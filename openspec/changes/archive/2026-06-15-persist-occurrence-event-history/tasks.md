## 1. Remote Contract Verification

- [x] 1.1 Use Supabase MCP to inspect the deployed `plant_occurrence_events` columns, constraints, indexes, RLS state, policies, grants, and existing row count without modifying data.
- [x] 1.2 Inspect the deployed definitions, signatures, owners, security mode, search paths, and grants for `sync_manual_inspection`, `create_occurrence_annotation`, `sync_polygon_bulk_update`, and `get_inspection_operations`.
- [x] 1.3 Compare the deployed objects with `database.md` and record any contract differences that the migration must reconcile.

## 2. Versioned Event Table Contract

- [x] 2.1 Create a Supabase migration with `supabase migration new` for occurrence event history and RPC updates.
- [x] 2.2 Add non-destructive DDL that reconciles `plant_occurrence_events` with the canonical foreign keys, action constraint, JSONB snapshots, stable local identity fields, and timestamps while preserving existing rows.
- [x] 2.3 Add indexes for operation, occurrence, plant/type chronology, and the unique partial `(device_id, local_change_id)` retry identity.
- [x] 2.4 Enable RLS, allow only the required authenticated read path, and explicitly prevent direct client insert/update/delete while preserving controlled `security definer` RPC writes.

## 3. Inspection Event Persistence

- [x] 3.1 Update `sync_manual_inspection` so a new occurrence writes an `added` event with actual before/after data and the payload `localChangeId`.
- [x] 3.2 Update `sync_manual_inspection` so adding to an existing open occurrence writes an `updated` event without replacing `plant_occurrences.field_operation_id`.
- [x] 3.3 Update `sync_manual_inspection` so removing an open occurrence writes a `removed` event without replacing its creation operation, and produces no event when no mutation occurs.
- [x] 3.4 Preserve chronological add-then-remove processing and make inspection event retries idempotent.

## 4. Annotation Event Persistence

- [x] 4.1 Update `create_occurrence_annotation` to insert an `added` event in the same transaction as the annotation operation and occurrence.
- [x] 4.2 Build annotation event snapshots from the persisted occurrence values and use the annotation local ID/device ID as the stable retry identity.
- [x] 4.3 Preserve the existing RPC signature, return shape, nearest-plant behavior, and execution grants for `anon`, `authenticated`, and `service_role`.

## 5. Polygon Event Persistence

- [x] 5.1 Update `sync_polygon_bulk_update` add behavior to create an occurrence plus `added` event when no open occurrence exists.
- [x] 5.2 Update polygon add behavior to update an existing open occurrence plus an `updated` event without replacing its creation operation.
- [x] 5.3 Update polygon remove behavior to close every matching open occurrence plus a `removed` event, while creating no event for unmatched pairs.
- [x] 5.4 Derive deterministic per-operation, per-plant, per-occurrence, per-action local event identities so retries do not collide across polygon plants or duplicate history.
- [x] 5.5 Preserve polygon attribute updates, counters, transactionality, authenticated-only execution, and existing return shape.

## 6. Desktop Inspection History

- [x] 6.1 Update `get_inspection_operations` so each plant retains `occurrences` and gains chronologically ordered `occurrence_events`.
- [x] 6.2 Return event ID, occurrence ID, occurrence type ID/name, action, timestamp, previous/new values, and current status where available.
- [x] 6.3 Verify removal-only operations and same-operation add-then-remove flows remain visible through `occurrence_events`.
- [x] 6.4 Preserve the RPC signature, top-level return columns, filters, authenticated-only execution, and existing desktop compatibility.

## 7. Database Documentation

- [x] 7.1 Update `database.md` with the canonical `plant_occurrence_events` DDL, indexes, append-only rules, RLS policies, grants, idempotency contract, and historical-data limitation.
- [x] 7.2 Replace the documented `sync_manual_inspection` SQL with the complete event-writing implementation and explain creation attribution behavior.
- [x] 7.3 Replace the documented `create_occurrence_annotation` SQL with the complete atomic annotation event implementation and permissions.
- [x] 7.4 Replace the documented `sync_polygon_bulk_update` SQL with the complete add/update/remove event implementation, deterministic identities, counters, and permissions.
- [x] 7.5 Replace the documented `get_inspection_operations` SQL with the complete compatible `occurrence_events` response contract.
- [x] 7.6 Update the consolidated schema/RLS/function sections of `database.md` so they match the detailed sections and deployed migration.

## 8. Verification

- [x] 8.1 Apply or execute the migration through the approved Supabase workflow and verify the deployed function definitions and permissions.
- [x] 8.2 Run transactional SQL tests for inspection add, update, remove, add-then-remove, and retry scenarios, rolling test data back afterward.
- [x] 8.3 Run transactional SQL tests for annotation creation/retry and polygon add/update/remove/retry scenarios, rolling test data back afterward.
- [x] 8.4 Call `get_inspection_operations` against representative event data and verify chronological, removal-only, and compatibility behavior.
- [x] 8.5 Run Supabase database advisors and resolve new security or performance findings caused by this change.
- [x] 8.6 Run affected repository tests and validate the OpenSpec change and migration files.
