## Why

Inspection, annotation, and spraying currently request their structural Supabase data only after the user enters each feature, delaying the workflow and allowing navigation into screens that cannot operate. The field-work menu should establish each feature's readiness up front and prevent entry when required data is unavailable.

## What Changes

- Preload the structural field-work data required by inspection, annotation, and spraying when the field-work screen starts.
- Track loading, ready, and unavailable states independently for each field-work card.
- Keep a card disabled while its required data is loading or unavailable, while allowing offline entry when every required option collection is already cached and non-empty.
- Show a `cloud-off` unavailable indicator inside disabled cards, with an accessible description.
- Reuse the successfully preloaded data when opening each feature instead of issuing the same Supabase option request on route startup.
- Persist successfully loaded structural options so they remain available after the app process restarts offline.
- Retry availability loading when the field-work screen is revisited so transient failures can recover.
- Replace the weather card with a loaded-data card that downloads and persists plant snapshots by zone.
- Make inspection and spraying consume only persisted plants filtered locally, and require loaded plants for readiness.

## Capabilities

### New Capabilities

- `field-work-data-readiness`: Preloading, per-card readiness, disabled-card feedback, recovery, and handoff of structural data to field-work routes.

### Modified Capabilities

- `inspection-screen-route`: Replace unconditional inspection/annotation/spraying card availability with readiness-gated navigation while keeping all three entries visible.
- `inspection-filter-loading`: Supply inspection filter options from the field-work preload rather than requesting them when the inspection route mounts.
- `annotation-screen-route`: Supply annotation occurrence and zone options from the field-work preload rather than requesting them when the annotation route mounts.
- `spraying-screen-route`: Supply spraying zone options from the field-work preload rather than requesting them when the spraying route mounts.

## Impact

- Affected UI: `src/app/field-works.tsx` and its card states, accessibility, and tests.
- Affected state/data flow: shared field-work option query/cache and the inspection, annotation, and spraying providers.
- Affected remote reads: existing Supabase reads for `zones`, `occurrence_types`, and currently required inspection structural options move earlier and are shared instead of repeated on route entry.
- Affected local behavior: SQLite stores reusable per-zone plant snapshots shared by inspection and spraying.
- Dependencies: existing TanStack Query, Expo Network, and Material Icons packages; no new package is required.
- No Supabase schema, table, RPC, function, trigger, policy, permission, or migration changes.
