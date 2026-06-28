## Why

Inspection, annotation, and spraying currently request their structural Supabase data only after the user enters each feature, delaying the workflow and allowing navigation into screens that cannot operate. The field-work menu should establish each feature's readiness up front and prevent entry when required data is unavailable.

## What Changes

- Preload the structural field-work data required by inspection, annotation, and spraying when the field-work screen starts.
- Track loading, ready, and unavailable states independently for each field-work card.
- Keep a card disabled while its required data is loading or when a required collection is empty, the Supabase request fails, or the device has no usable internet connection.
- Show a `cloud-off` unavailable indicator inside disabled cards, with an accessible description.
- Reuse the successfully preloaded data when opening each feature instead of issuing the same Supabase option request on route startup.
- Retry availability loading when the field-work screen is revisited so transient failures can recover.
- Preserve feature-specific loading, such as fetching plants after an inspection filter or spraying zone is selected.

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
- Affected local behavior: existing SQLite restoration and feature-specific plant loading remain in place.
- Dependencies: existing TanStack Query, Expo Network, and Material Icons packages; no new package is required.
- No Supabase schema, table, RPC, function, trigger, policy, permission, or migration changes.
