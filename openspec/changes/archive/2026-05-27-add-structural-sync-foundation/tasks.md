## 1. Structural Domain Models

- [x] 1.1 Create a structural models module under `src/domain/models` without changing existing feature model imports.
- [x] 1.2 Add shared sync metadata types for local identity, device identity, sync status, synced timestamp, timestamps, and sync errors.
- [x] 1.3 Add TypeScript interfaces for `varieties`, `zones`, `plants`, `occurrence_types`, and `operation_types`.
- [x] 1.4 Add TypeScript interfaces for `field_operations`, `field_operation_track_points`, `field_operation_routes`, `plant_operation_history`, and `operation_inputs`.
- [x] 1.5 Add TypeScript interfaces for `plant_occurrences`, `inspection_targets`, and `inspection_routes`.
- [x] 1.6 Export the structural model types through an index file or existing project export convention.

## 2. Initial Sync Local Models

- [x] 2.1 Create local SQLite row models for `local_varieties`, `local_occurrence_types`, `local_operation_types`, `local_zones`, and `local_plants`.
- [x] 2.2 Create local SQLite row models for `local_plant_occurrences`, `local_field_operations`, and `local_inspection_targets`.
- [x] 2.3 Create a `sync_queue` row model that supports entity name, entity local ID, action, payload JSON, status, attempts, last error, and timestamps.
- [x] 2.4 Keep local models aligned with item 20.1 simplified SQLite fields rather than copying PostGIS-only remote fields.

## 3. SQLite Initialization

- [x] 3.1 Extend SQLite initialization with idempotent `CREATE TABLE IF NOT EXISTS` statements for all item 20.1 local cache tables.
- [x] 3.2 Add idempotent indexes for local plant zone, variety, latitude/longitude lookups.
- [x] 3.3 Add idempotent indexes for local occurrence plant, type, and status lookups.
- [x] 3.4 Add idempotent indexes for local field operation type/start date and inspection target operation/plant lookups.
- [x] 3.5 Verify existing legacy local tables are not dropped, renamed, or behaviorally changed.

## 4. Initial Sync Foundation Boundaries

- [x] 4.1 Add constants for item 20.1 local table names and sync statuses.
- [x] 4.2 Add a sync foundation service/repository module boundary for future initial download and local upsert logic.
- [x] 4.3 Ensure the new sync foundation does not automatically call Supabase or alter current app startup workflows beyond table creation.

## 5. Verification

- [x] 5.1 Run TypeScript checking and fix any structural model type errors.
- [x] 5.2 Run lint and fix issues introduced by the new modules.
- [x] 5.3 Review changed files to confirm no inspection, annotation, spraying, routine, map, or RPC behavior was refactored in this structural phase.
