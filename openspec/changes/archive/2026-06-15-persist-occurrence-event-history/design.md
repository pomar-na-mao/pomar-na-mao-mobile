## Context

`plant_occurrences` currently serves two incompatible purposes: it stores the current lifecycle state and also carries a single `field_operation_id`. The inspection and polygon RPCs update that foreign key when an existing occurrence is changed or removed, which destroys the direct relationship to the operation that created the occurrence. `plant_operation_history` only identifies that a plant participated in an operation; it does not identify the occurrence or action.

The user has already created `plant_occurrence_events` through the Supabase SQL Editor based on the proposed append-only schema. The local project is not linked to a remote Supabase project through the CLI, so implementation must inspect the deployed object through Supabase MCP before generating the canonical migration.

The affected writers are:

- `sync_manual_inspection`
- `create_occurrence_annotation`
- `sync_polygon_bulk_update`

The affected desktop reader is `get_inspection_operations`.

## Goals / Non-Goals

**Goals:**

- Persist every applied occurrence action with its operation, plant, occurrence, action, timestamp, and before/after values.
- Keep `plant_occurrences` as the current lifecycle record and preserve its creation operation relationship.
- Make retries idempotent so the same client change cannot create duplicate events.
- Return explicit chronological occurrence actions to the desktop inspection history.
- Keep occurrence state mutation and event insertion atomic inside each RPC.
- Version the deployed table and RPC contracts in Supabase migrations and `database.md`.

**Non-Goals:**

- Reconstructing exact events for historical rows whose operation relationship was already overwritten.
- Replacing `plant_operation_history`.
- Changing mobile inspection or annotation payload shapes when existing fields already contain the required event metadata.
- Removing the existing `occurrences` field from `get_inspection_operations`.
- Adding direct client write access to `plant_occurrence_events`.

## Decisions

### Treat `plant_occurrence_events` as append-only audit data

The canonical table contract is:

- `occurrence_id`, `plant_id`, `occurrence_type_id`, and `field_operation_id` foreign keys.
- `action` constrained to `added`, `updated`, `removed`, or `reopened`.
- `occurred_at` as the domain timestamp supplied by the originating change.
- `previous_value` and `new_value` as JSONB snapshots.
- `local_change_id` and `device_id` for retry identity.
- `created_at` as the database insertion timestamp.

Application RPCs insert events but never update or delete them. Existing rows remain historical facts even when `plant_occurrences` changes later.

Alternative considered: add `created_by_operation_id` and `resolved_by_operation_id` to `plant_occurrences`. That records only two lifecycle edges and cannot represent repeated updates, reopenings, or multiple changes in one operation.

### Preserve `plant_occurrences.field_operation_id` as creation attribution

When a new occurrence is inserted, `field_operation_id` records the creating operation. Later updates and removals SHALL NOT replace it. The later operation is represented by its event.

Legacy rows may already contain the most recent modifying operation instead of the creator. The migration will not guess or rewrite those rows.

### Derive event action from the mutation actually applied

`sync_manual_inspection` behavior:

- New occurrence inserted by `add_occurrence` -> `added`.
- Existing open occurrence updated by `add_occurrence` -> `updated`.
- Existing open occurrence closed by `remove_occurrence` -> `removed`.
- No matching open occurrence for removal -> no state change and no event.

`create_occurrence_annotation` always creates an occurrence and writes `added`.

`sync_polygon_bulk_update` behavior:

- `occurrenceAction = add` with no open occurrence -> insert occurrence and write `added`.
- `occurrenceAction = add` with an open occurrence -> update its mutable values without changing creation attribution and write `updated`.
- `occurrenceAction = remove` with an open occurrence -> close it and write `removed`.
- `occurrenceAction = remove` without an open occurrence -> no state change and no event.

### Store complete before/after snapshots

Events will use the payload `previousValue` and `newValue` where inspection already supplies them, enriched or normalized by the RPC when necessary. Annotation and polygon RPCs will construct JSONB snapshots from the actual occurrence fields written to the database.

For removals, `previous_value` captures the open occurrence before mutation and `new_value` captures the resulting status and resolution timestamp. This allows the desktop to explain both what was changed and the resulting state.

### Use stable retry identities

Inspection uses `localChangeId` and annotation uses the stable local annotation ID. Polygon events need one identity per plant and occurrence mutation, so the RPC will derive a deterministic `local_change_id` from:

`localOperationId + plantId + occurrenceTypeId + normalized action`

The unique partial index on `(device_id, local_change_id)` prevents duplicate events on retries. Event insertion will use conflict handling consistent with this constraint.

### Return events without breaking existing desktop consumers

`get_inspection_operations` will retain each plant's existing `occurrences` array and add `occurrence_events`, ordered by `occurred_at` and then `created_at`. Each event includes:

- event and occurrence IDs
- occurrence type ID and name
- action
- occurred timestamp
- previous and new values
- current occurrence status when available

For removal-only operations, `occurrences` may be empty while `occurrence_events` contains the authoritative removal action. New desktop code must use events to describe what the operation did.

### Control writes through RPCs

RLS must be enabled on `plant_occurrence_events`. Authenticated desktop users may receive read access if required, but `anon` and authenticated clients will not receive direct insert, update, or delete policies. `security definer` RPCs perform controlled writes.

`create_occurrence_annotation` retains execution for `anon`, `authenticated`, and `service_role`. Inspection permissions remain aligned with the mobile synchronization contract. Polygon and desktop history RPCs remain authenticated-only.

### Version and document the manually created table

Implementation will first inspect the deployed table, indexes, policies, and grants. A Supabase migration created with `supabase migration new` will then establish the canonical table contract using idempotent DDL where needed and replace the four RPC definitions.

`database.md` will be updated in both its detailed feature sections and consolidated SQL section. It will contain the table DDL, indexes, RLS/grants, event semantics, and complete current definitions of all changed RPCs.

## Risks / Trade-offs

- [The manually created table differs from the expected schema] -> Inspect it first and write an additive/reconciling migration; do not drop data or recreate the table blindly.
- [Retries create duplicate events] -> Enforce the stable device/local-change unique index and use deterministic polygon identities.
- [Occurrence mutation succeeds without its event] -> Keep mutation and event insertion in the same PostgreSQL function transaction and let any event error roll back the RPC.
- [Legacy occurrences have incorrect creation attribution] -> Leave them unchanged and document the historical cutoff; do not fabricate provenance.
- [Desktop clients ignore the new field] -> Preserve `occurrences` and add `occurrence_events` as a compatible JSON extension.
- [Large event arrays increase RPC payload size] -> Filter events by operation and plant, index `field_operation_id`, `occurrence_id`, and relevant ordering columns, and aggregate only matching rows.
- [Multiple writers implement inconsistent snapshots] -> Define one documented JSON shape and verify each RPC with focused SQL scenarios.

## Migration Plan

1. Inspect deployed `plant_occurrence_events`, the four RPC definitions, indexes, RLS state, policies, and grants through Supabase MCP.
2. Create a versioned migration with `supabase migration new`.
3. Reconcile the event table contract, indexes, unique retry constraint, RLS, read policy, and direct-write restrictions without deleting existing event data.
4. Replace `sync_manual_inspection`, `create_occurrence_annotation`, and `sync_polygon_bulk_update` with transactional event-writing implementations.
5. Replace `get_inspection_operations` with the compatible event-enriched response.
6. Update `database.md` with complete deployed SQL and implementation notes.
7. Verify add, update, remove, add-then-remove, retry, annotation, and polygon scenarios using test data inside a transaction that is rolled back.
8. Run database advisors and confirm function permissions.

Rollback can restore the prior RPC definitions while leaving `plant_occurrence_events` and its recorded rows in place. Dropping the event table is not part of rollback because that would destroy audit history.

## Open Questions

- Confirm whether the manually created table exactly matches the expected action constraint and unique `(device_id, local_change_id)` index.
- Confirm whether authenticated users need direct `SELECT` access to `plant_occurrence_events`, or whether all desktop reads will remain exclusively through RPCs.
