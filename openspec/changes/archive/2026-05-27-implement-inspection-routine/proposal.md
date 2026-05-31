## Why

The current `/routine` implementation still reflects the previous routine workflow, while `database-and-features-organization.md` item 20.2 defines the new inspection process. Moving this feature to `/inspection` with inspection-oriented file and class names lets the app use the new structural data model and prepares field work around local inspections, nearest-plant editing, and later synchronization.

## What Changes

- **BREAKING** Replace route `/routine` with route `/inspection` for the inspection workflow from item 20.2.
- Rename routine-oriented UI, view-model, service, repository, store, model, class, hook, component, and function names to inspection-oriented names where they remain relevant.
- Remove obsolete routine components/functions that no longer fit the inspection flow.
- Add the inspection screen initial state: empty map, current user location, filter action, nearest-plant details action, and local inspections list.
- Add inspection filter loading for zones, occurrence types, and varieties, using local cache where available and Supabase/RPC where required.
- Add filtered inspection plant loading via `get_inspection_plants`, grouping multiple occurrence rows by plant before saving locally.
- Add local SQLite persistence for `local_inspections`, `local_inspection_loaded_plants`, and `local_inspection_changes`.
- Add map rendering for loaded inspection plants, nearest plant highlighting, and changed plant highlighting.
- Add GPS-based nearest plant detection from loaded local inspection plants.
- Add nearest-plant detail/edit modal for adding, updating, removing, resolving, or confirming occurrences.
- Add finalization of local inspections and a local inspection list.
- Add Swipeable synchronization for finished inspections through `sync_manual_inspection`, sending only changed plants.

## Capabilities

### New Capabilities

- `inspection-screen-route`: Adds `/inspection` as the inspection screen route, removes the old `/routine` entrypoint, wires renamed modules, and shows the local inspection list.
- `inspection-filter-loading`: Provides inspection filter options and loads filtered plants for an inspection.
- `inspection-local-state`: Persists local inspections, loaded plants, and inspection changes in SQLite.
- `inspection-map-nearest-plant`: Renders inspection plants on the map and tracks the nearest loaded plant from GPS updates.
- `inspection-occurrence-editing`: Edits nearest-plant occurrences and records only changed plants.
- `inspection-sync`: Finalizes and synchronizes local inspection payloads with Supabase.

### Modified Capabilities

- None.

## Impact

- Affected route: create `src/app/inspection.tsx` as the feature entrypoint and remove or retire `src/app/routine.tsx`.
- Affected code: rename routine UI/view-model/store/repository/service/model folders under `src/ui/routines`, `src/data/services/routine`, `src/data/repositories/routines`, `src/data/store/routine`, and `src/domain/models/routine` to inspection-oriented paths such as `src/ui/inspection`, `src/data/services/inspection`, `src/data/repositories/inspection`, `src/data/store/inspection`, and `src/domain/models/inspection`.
- Affected SQLite: add inspection-specific tables and indexes from item 20.2.
- Affected Supabase APIs: consume `get_inspection_plants` and `sync_manual_inspection`; no remote migration is executed by this app change unless already available through existing Supabase setup.
- Existing routine code may be deleted or renamed as part of this intentional replacement.
