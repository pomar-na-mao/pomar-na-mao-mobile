## Why

The database and feature organization document defines annotation as an active field-work workflow in item 22.2, but the current app only keeps inspection available and the previous annotation route was retired. Reintroducing annotation now gives field users a focused offline-first way to register occurrence observations from the map and synchronize them into `field_operations` and `plant_occurrences`.

## What Changes

- Add a new annotation route and feature module that follows the current inspection-style screen pattern: map in the background, current GPS context, a compact annotation summary, and bottom actions.
- Add a modal-driven annotation form where the user selects occurrence data, captures GPS metadata, and optionally enters severity and notes.
- Persist annotation operations and occurrence rows locally in SQLite using the local tables described in `database-and-features-organization.md` item `20.3`.
- Add synchronization for pending annotations so the app can call the existing/recommended Supabase annotation RPC where appropriate, mark local rows synced only after success, and preserve errors for retry.
- Update field-work navigation so annotation is once again an active entrypoint, without restoring the previously retired implementation files.
- Update `database-and-features-organization.md` around item `22.2` if implementation requires RPC contract clarification or a different synchronization shape from the current document.

## Capabilities

### New Capabilities

- `annotation-screen-route`: Annotation navigation and route behavior, including the inspection-like map screen, summary, form modal entrypoint, finalize action, and sync action.
- `annotation-local-state`: Local annotation operation/occurrence persistence, summary counts, lifecycle status, and offline retry/error state.
- `annotation-gps-position`: Current-location based annotation capture without local plant assignment; nearest-plant resolution happens during sync.
- `annotation-sync`: Supabase synchronization contract for locally created annotations, including RPC payload mapping, success handling, and failure preservation.

### Modified Capabilities

- `inspection-screen-route`: Field-work navigation requirement changes so `/annotation` can be exposed as an active route while `/add-plant` and `/spraying` remain retired.

## Impact

- Affects Expo route registration under `src/app`, field-work navigation, and new annotation UI/view-model modules.
- Adds or extends annotation-specific repositories/services under `src/data`, plus domain models/helpers for local annotation payloads and GPS position capture.
- Uses existing structural SQLite/Supabase concepts from `field_operations`, `plant_occurrences`, `operation_types`, `plants`, `occurrence_types`, and the local annotation tables described in the organization document.
- May require Supabase RPC verification or updates for `create_occurrence_annotation` if the current database contract does not support the offline-first payload needed by the mobile app.
- Requires focused unit tests for route rendering, modal selection flow, local persistence, GPS position capture, and RPC/sync mapping.
