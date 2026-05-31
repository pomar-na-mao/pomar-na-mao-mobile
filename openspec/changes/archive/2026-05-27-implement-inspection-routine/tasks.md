## 1. Inspection Route and Module Replacement

- [x] 1.1 Inventory current routine imports, files, route dependencies, and navigation references before deleting or renaming anything.
- [x] 1.2 Create inspection-oriented folders for UI, view-models, store, services, repositories, and models.
- [x] 1.3 Create `src/app/inspection.tsx` so `/inspection` renders the inspection provider/screen.
- [x] 1.4 Remove or retire `src/app/routine.tsx` so `/routine` is no longer the inspection entrypoint.
- [x] 1.5 Remove or rename obsolete routine components, hooks, classes, functions, services, stores, repositories, and models that are no longer used.
- [x] 1.6 Update all imports and navigation references so active code references inspection-oriented modules and `/inspection`.

## 2. Inspection Models and SQLite Schema

- [x] 2.1 Add domain models for inspection filters, loaded plants, occurrence edits, local inspections, inspection list items, nearest plant state, and sync payloads.
- [x] 2.2 Add `local_inspections` SQLite table with fields from item 20.2.7.
- [x] 2.3 Add `local_inspection_loaded_plants` SQLite table with fields from item 20.2.6.
- [x] 2.4 Add `local_inspection_changes` SQLite table with fields from item 20.2.11.
- [x] 2.5 Add indexes for inspection status, inspection sync status, loaded plants by inspection/plant, and changes by inspection/plant/sync status.

## 3. Inspection Data Layer

- [x] 3.1 Implement Supabase repository methods for filter option reads and `get_inspection_plants`.
- [x] 3.2 Implement grouping of `get_inspection_plants` rows into one inspection plant per `plant_id` with an occurrences array.
- [x] 3.3 Implement local SQLite service/repository methods to create inspections, replace loaded plants, list inspections, read active inspection data, and update nearest plant state.
- [x] 3.4 Implement local SQLite service/repository methods to create inspection changes, count distinct changed plants, finish inspections, and load changes for sync.
- [x] 3.5 Implement Supabase sync repository method for `sync_manual_inspection`.

## 4. Inspection State and View Model

- [x] 4.1 Create an inspection store or provider state for current location, active inspection, loaded plants, nearest plant, selected filters, modals, loading, and errors.
- [x] 4.2 Implement screen initialization that loads current location and local inspections without auto-loading plants.
- [x] 4.3 Implement filter application flow that validates filters, calls the repository, creates the local inspection, saves loaded plants, and updates map state.
- [x] 4.4 Implement nearest plant calculation on valid location updates using loaded inspection plants.
- [x] 4.5 Persist nearest plant updates to `local_inspections` and `local_inspection_loaded_plants` only when the nearest plant or meaningful distance changes.

## 5. Inspection UI

- [x] 5.1 Build the inspection screen layout with map, filter action, nearest-plant details action, finish action, and local inspections list.
- [x] 5.2 Build the inspection filter modal with zone and occurrence selection and optional variety display/support where useful.
- [x] 5.3 Build the inspection map markers for common, nearest, changed, and changed-nearest plant states.
- [x] 5.4 Build the nearest plant details/edit modal showing plant ID, zone, variety, distance, occurrences, and edit controls.
- [x] 5.5 Build the local inspections list with status, sync status, counts, and Swipeable sync action.

## 6. Occurrence Editing and Finalization

- [x] 6.1 Implement add occurrence action with local validation and `local_inspection_changes` persistence.
- [x] 6.2 Implement update occurrence action for severity/notes changes.
- [x] 6.3 Implement remove/resolve occurrence action by recording a resolving local change rather than deleting history.
- [x] 6.4 Capture edit location metadata and distance to plant when available.
- [x] 6.5 Update loaded plant display state and changed plant count after each saved edit.
- [x] 6.6 Implement finish inspection flow that sets status to `finished`, sets `finished_at`, keeps sync status pending, and refreshes the local inspection list.

## 7. Inspection Synchronization

- [x] 7.1 Build `SyncInspectionPayload` from finished inspection and `local_inspection_changes`, excluding unchanged plants.
- [x] 7.2 Implement Swipeable sync state transitions for pending, syncing, synced, and error states.
- [x] 7.3 On RPC success, save `remote_field_operation_id`, set `synced_at`, mark inspection synced, and mark related changes synced.
- [x] 7.4 On RPC failure, preserve local data, set inspection sync status to error, and store the error message.
- [x] 7.5 Refresh the local inspection list after sync success or failure.

## 8. Verification

- [x] 8.1 Run TypeScript checking and fix errors introduced by the inspection replacement.
- [x] 8.2 Run lint for changed files and fix issues introduced by this change.
- [x] 8.3 Verify `/inspection` opens the inspection screen and no active inspection code imports legacy routine UI modules.
- [x] 8.4 Verify an inspection can be created from a valid filter and persists loaded plants locally.
- [x] 8.5 Verify nearest plant updates, occurrence edits, finish flow, and sync payload construction with local data.
- [x] 8.6 Review deleted/renamed routine route and files to confirm no unrelated feature files were removed.
