## Why

Occurrence mutations currently overwrite `plant_occurrences.field_operation_id`, so a later removal can erase the direct relationship to the operation that originally added the occurrence. The database needs an append-only event trail so desktop history can show exactly what each inspection, annotation, or polygon operation added, updated, or removed.

## What Changes

- Adopt the existing `plant_occurrence_events` table created in the Supabase SQL Editor as the authoritative append-only audit trail, after verifying its deployed columns, constraints, indexes, RLS, and grants.
- Update `sync_manual_inspection` to write one idempotent event for every applied `add_occurrence` or `remove_occurrence` change, including chronological metadata and previous/new values.
- Preserve the creation relationship in `plant_occurrences.field_operation_id` instead of replacing it when a later inspection updates or removes the occurrence.
- Update `create_occurrence_annotation` to write an `added` event in the same transaction as the field operation and occurrence.
- Update `sync_polygon_bulk_update` so occurrence additions, updates of existing open occurrences, and removals write corresponding events for every affected plant.
- Update `get_inspection_operations` to return ordered `occurrence_events` per plant while retaining the existing `occurrences` data for compatibility.
- Add or update versioned Supabase migrations, RPC verification tests, and `database.md` with the deployed table contract and complete SQL definitions for all changed RPCs.

## Capabilities

### New Capabilities

- `occurrence-event-history`: Defines append-only occurrence event persistence, idempotency, operation attribution, polygon behavior, and desktop history retrieval.

### Modified Capabilities

- `inspection-sync`: Inspection synchronization must preserve every applied occurrence action as an event without overwriting the occurrence's creation operation.
- `annotation-sync`: Annotation synchronization must atomically persist the occurrence creation event and document the actual RPC contract in `database.md`.

## Impact

- Affected Supabase objects: `plant_occurrence_events`, `plant_occurrences`, `sync_manual_inspection`, `create_occurrence_annotation`, `sync_polygon_bulk_update`, and `get_inspection_operations`.
- Affected permissions: RLS/read policy for authenticated desktop users and RPC execution grants must be verified and documented; direct event writes remain controlled by backend RPCs.
- Affected consumers: the desktop inspection-history response gains `occurrence_events`; existing `occurrences` output remains available.
- Affected repository artifacts: Supabase migrations, database contract documentation, structural database tests, and possibly generated/local TypeScript database types if used by the project.
- Historical relationships already overwritten before this change cannot be reconstructed exactly; the new guarantee applies to events recorded after deployment.
