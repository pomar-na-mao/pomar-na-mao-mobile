## Why

Inspection and spraying currently mount one custom `react-native-maps` marker for every loaded plant. Large orchards therefore create enough React and native map views to block interactions, location updates, and route rendering, even though most plants are outside the viewport or cannot be distinguished at the current zoom.

## What Changes

- Add a shared scalable plant-visualization layer for inspection and spraying maps.
- Index loaded plant coordinates and render only data relevant to the current viewport.
- Group nearby plants into count clusters at broader zoom levels and expand clusters as the user zooms in.
- Bound the number of simultaneously mounted plant markers while keeping selected, nearest, changed, candidate, and confirmed plants visually correct.
- Preserve individual plant interaction when the map is sufficiently zoomed in.
- Add deterministic selector tests and map integration tests for large plant collections and viewport changes.
- Add development instrumentation for rendered plant and cluster counts so performance regressions can be diagnosed.

## Capabilities

### New Capabilities

- `scalable-plant-map-rendering`: Viewport-aware indexing, clustering, render limits, priority markers, interaction, and performance observability shared by plant maps.

### Modified Capabilities

- `inspection-map-nearest-plant`: Keep nearest and changed inspection plants visible while the remaining plant collection is culled or clustered.
- `spraying-local-review`: Preserve candidate/confirmed styling and individual review interactions within the scalable map-rendering strategy.

## Impact

- Affected UI: shared plant marker components, inspection map, spraying map, and their tests.
- Affected state: local map region/zoom state and memoized spatial indexes derived from already-loaded plants.
- Dependencies: existing React, `react-native-maps`, and React Native APIs; no new runtime package is required initially.
- Data and APIs: no Supabase, SQLite schema, RPC, synchronization, or offline-cache changes.
