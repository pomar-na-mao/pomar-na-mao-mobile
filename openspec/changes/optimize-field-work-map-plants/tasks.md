## 1. Spatial Visualization Core

- [x] 1.1 Define shared plant visualization types, centralized viewport overscan, zoom/grid thresholds, and the initial 250-overlay render budget.
- [x] 1.2 Implement an immutable geographic bucket index with coordinate validation, duplicate-ID handling, and viewport queries that account for longitude scale and antimeridian-safe bounds.
- [x] 1.3 Implement deterministic grid aggregation that emits stable individual and cluster identities, cluster bounds, total counts, and highlighted-state counts while respecting the render budget.
- [x] 1.4 Add unit tests for index construction, viewport/overscan selection, zoom-dependent aggregation, stable identities, invalid coordinates, and 5,000+ plant render-budget behavior.

## 2. Shared Map Rendering

- [x] 2.1 Refactor `PlantMapMarkers` to render discriminated individual and cluster markers with memoized props and disabled unnecessary native view tracking.
- [x] 2.2 Add a shared region-aware visualization hook that builds the spatial index only when source plants change and recomputes output on completed region changes.
- [x] 2.3 Implement cluster press behavior that returns cluster bounds/center for camera expansion without invoking individual plant callbacks.
- [x] 2.4 Add development diagnostics for source count, viewport candidates, individuals, clusters, mounted overlays, and selector duration.
- [x] 2.5 Extend shared marker tests for cluster counts, highlighted cluster state, stable individual visuals, press routing, and marker tracking configuration.

## 3. Inspection Integration

- [x] 3.1 Connect the inspection map initial region and `onRegionChangeComplete` to the shared visualization hook without changing user-location or simulation camera behavior.
- [x] 3.2 Prioritize an in-viewport nearest inspection plant as an individual marker and preserve nearest, changed, and changed-nearest visuals through visualization updates.
- [x] 3.3 Add inspection map tests for large collections, viewport changes, cluster expansion, nearest-state updates, and unchanged location simulation behavior.

## 4. Spraying Integration

- [x] 4.1 Connect the spraying map to the shared visualization hook while preserving route polylines, camera tracking, and simulation controls.
- [x] 4.2 Map candidate, confirmed, and manually affected states into individual markers and cluster summaries without recomputing the coordinate index.
- [x] 4.3 Restrict review mutations to individual plant markers and make cluster presses expand the camera without toggling a plant.
- [x] 4.4 Add spraying map tests for large collections, affected-state clusters, detailed-zoom review interactions, route rendering, and simulation behavior.

## 5. Performance Validation

- [x] 5.1 Add deterministic synthetic datasets for 1,000, 5,000, and 10,000 plants and assert the mounted overlay budget across representative regions and zoom levels.
- [ ] 5.2 Profile inspection and spraying on Android and iOS development builds with a representative large orchard, record selector/overlay diagnostics, and tune only the centralized thresholds if needed.
- [x] 5.3 Run focused shared/inspection/spraying tests, TypeScript compilation, and lint, and confirm the change contains no Supabase or SQLite schema modifications.
