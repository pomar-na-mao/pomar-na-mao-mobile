## Context

The current `/routine` route renders a legacy routine map and uses `routine_plants` as a local cache. Item 20.2 of `database-and-features-organization.md` defines a different workflow: an inspection starts with an empty map, the user applies zone and/or occurrence filters, the app loads plants for that inspection, tracks the nearest plant while the user moves, records only changed plants locally, and synchronizes finished inspections later.

The structural foundation change already introduced app-side structural models and item 20.1 initial sync cache tables. This change builds the actual inspection feature on top of that foundation, moves the user-facing route to `/inspection`, and intentionally removes the old `/routine` implementation.

## Goals / Non-Goals

**Goals:**

- Create `/inspection` as the app route for the inspection feature.
- Remove or retire `/routine` so the old routine route is no longer the inspection entrypoint.
- Rename or recreate routine modules, classes, hooks, functions, and components as inspection modules and delete obsolete routine-specific files.
- Add SQLite schema, row models, repositories, services, store/view-models, and UI components for item 20.2.
- Load filter options for zones, occurrence types, and varieties.
- Load inspection plants through `get_inspection_plants`, group returned rows by `plant_id`, create a local inspection, and persist loaded plants locally.
- Render loaded inspection plants on the map with visual states for normal, nearest, changed, and changed-nearest plants.
- Track current GPS location and calculate the nearest plant among loaded inspection plants.
- Let the user edit the nearest plant's occurrences and persist changes in `local_inspection_changes`.
- Finalize inspections locally and synchronize finished inspections with `sync_manual_inspection` using only changed plants.

**Non-Goals:**

- Do not create or migrate Supabase remote schema from the app.
- Do not keep the old routine workflow or `/routine` route as a parallel mode.
- Do not synchronize unchanged plants.
- Do not implement unrelated item 20.3 annotation or item 20.4 spraying behavior.
- Do not archive previous OpenSpec changes as part of this proposal.

## Decisions

1. Replace `/routine` with `/inspection` and rename implementation modules to inspection.

   The inspection feature should use `src/app/inspection.tsx` as its route entrypoint. The previous `src/app/routine.tsx` should be removed or retired unless a deliberate redirect is added later. New code should prefer paths such as `src/ui/inspection`, `src/data/services/inspection`, `src/data/repositories/inspection`, `src/data/store/inspection`, and `src/domain/models/inspection`.

   Alternative considered: keeping `/routine` and only renaming internals. This was rejected because the updated requirement is to replace `/routine` with `/inspection`.

2. Replace rather than wrap the legacy routine workflow.

   The old routine map loads plants immediately from legacy filters and stores `PlantData` blobs in `routine_plants`. Inspection requires local inspection sessions, loaded plant rows, change rows, and final sync. Keeping both behaviors in the same module would increase ambiguity and make later refactors harder.

   Alternative considered: preserving legacy routine components and adding inspection beside them. This was rejected because the request explicitly allows deletion and replacement.

3. Use normalized local inspection tables for item 20.2.

   Add `local_inspections`, `local_inspection_loaded_plants`, and `local_inspection_changes` with indexes for inspection ID, plant ID, status, and sync status. Store occurrence lists and previous/new values as JSON text where the document calls for JSON.

   Alternative considered: reusing `routine_plants`. This was rejected because it cannot represent local inspection lifecycle, changed plants, or synchronization state cleanly.

4. Treat RPCs as required backend contracts.

   The app should call `get_inspection_plants` for filtered plant loading and `sync_manual_inspection` for sync. If a backend function is missing, the app should surface a clear error instead of attempting to reconstruct all remote writes client-side.

   Alternative considered: direct writes to multiple Supabase tables. This was rejected for MVP because item 20.2 recommends the RPC and because multi-table writes are easier to keep consistent on the server.

5. Group inspection plant rows by plant before local persistence.

   `get_inspection_plants` can return multiple rows for one plant when multiple occurrences are open. The repository/service layer should group by `plant_id` into one loaded plant with an `occurrences` array before writing `occurrences_json`.

   Alternative considered: persisting one row per occurrence. This was rejected because map markers, nearest detection, and editing operate per plant.

6. Persist every occurrence edit immediately.

   Each edit in the nearest-plant modal should write a row to `local_inspection_changes` and update loaded-plant display state. This protects field data if the app is backgrounded or closed.

   Alternative considered: storing only in React state until finish. This was rejected because field work is offline-prone.

## Risks / Trade-offs

- [Risk] Remote RPCs may not exist in Supabase yet -> Mitigation: implement clear repository errors and keep RPC names/payloads isolated.
- [Risk] Renaming/deleting routine route and modules can break imports or navigation links -> Mitigation: replace imports and route references systematically and run TypeScript.
- [Risk] GPS updates can cause excessive SQLite writes -> Mitigation: update nearest plant only when the nearest plant or meaningful distance changes.
- [Risk] Multiple open occurrences can create duplicate UI entries -> Mitigation: group RPC rows by plant and deduplicate occurrences by occurrence type/status where needed.
- [Risk] Failed sync can lose local state if marked too early -> Mitigation: mark `synced` only after RPC success; preserve pending/error rows on failure.
- [Risk] Lint may still fail from existing unrelated files -> Mitigation: validate changed files and report unrelated failures separately.

## Migration Plan

1. Add inspection domain models and SQLite schema from item 20.2.
2. Create inspection repositories/services for local SQLite and Supabase RPC calls.
3. Add `src/app/inspection.tsx` with the new inspection provider/screen and remove or retire `src/app/routine.tsx`.
4. Rename or delete obsolete routine UI/view-model/store/service files, classes, hooks, functions, and components as part of the feature replacement.
5. Implement filter modal, map, nearest plant detection, edit modal, local list, finish action, and sync action.
6. Run TypeScript and lint for changed files; run broader checks where feasible.

Rollback is to restore the previous `/routine` route and routine modules, then remove the `/inspection` route wiring and inspection-specific SQLite initialization additions. Local inspection tables can remain harmless if already created because they are additive.
