## Context

Both native field-work maps pass their complete plant arrays to `PlantMapMarkers`. That component maps every item to a custom `Marker` containing a React Native `View`. Memoization prevents some rerenders but does not reduce the number of mounted React components, native marker views, bridge/fabric work, or map-engine overlays. Spraying adds route polylines and changing review states; inspection updates nearest-plant state from frequent location events, so marker saturation also delays unrelated interaction.

The solution must work offline with the existing in-memory/SQLite snapshots, preserve map semantics, support Android and iOS through the installed `react-native-maps`, and avoid a new native dependency unless measurement proves the built-in approach insufficient.

## Goals / Non-Goals

**Goals:**

- Keep map pan, zoom, location, simulation, route, and review interactions responsive with thousands of loaded plants.
- Share one deterministic visualization strategy between inspection and spraying.
- Bound mounted plant overlays independently of the total loaded collection.
- Preserve exact individual marker behavior when the viewport is detailed enough.
- Make the spatial selection and clustering logic testable without mounting a native map.

**Non-Goals:**

- Reducing, paginating, or changing the cached plant dataset.
- Changing nearest-plant computation, spraying simulation, synchronization, or Supabase contracts.
- Persisting clusters or viewport state.
- Replacing `react-native-maps` or adding a native clustering library in the first implementation.

## Decisions

### Build a shared immutable spatial index from plant coordinates

A shared hook will build an index only when the plant collection identity changes. Plants will be assigned to geographic buckets and queried using the current region plus a small overscan margin. Region changes therefore inspect relevant buckets instead of remapping and testing the entire orchard on every pan.

The index and query functions will be pure TypeScript modules. Invalid coordinates and duplicate IDs will be rejected deterministically before rendering.

Alternative considered: filter the full array on every `onRegionChangeComplete`. This reduces mounted views but retains O(n) work after every gesture and becomes visible on lower-end devices.

### Cluster by screen-relative grid until the render budget is satisfied

The current map region determines an approximate zoom/detail level and grid-cell size. Plants within the same cell become a single cluster marker containing a count. Grid size decreases as the user zooms in. If an unusually dense viewport still exceeds the configured marker budget, the selector increases aggregation until the output is within budget.

Initial constants will be centralized and measurable rather than scattered through map components. The implementation target is at most 250 plant/cluster overlays at once for a normal viewport, with tests using at least 5,000 source plants.

Alternative considered: a fixed “first N plants” cap. It is cheap but geographically biased, hides arbitrary plants, and produces unstable output while arrays change.

### Keep map region state local and update visualization after completed gestures

Inspection and spraying will provide `onRegionChangeComplete` to the shared hook. The initial region seeds the first query. Continuous `onRegionChange` updates will not rebuild marker output during every animation frame. A small viewport overscan prevents markers from flashing at the edges.

Alternative considered: recompute continuously while panning. That gives immediate edge updates but competes directly with the gesture and map renderer.

### Represent clusters separately from individual markers

`PlantMapMarkers` will accept a discriminated visualization result containing individual plants and clusters. Cluster markers use lightweight count badges and pressing a cluster animates the map toward its bounds/center. Individual callbacks remain available only for actual plant markers.

Nearest inspection plants remain individual when they are in or near the viewport. Changed inspection plants and affected spraying plants retain their state on individual markers; aggregate markers expose state counts so clustering does not falsely show a uniform status. Spraying review mutation remains available when a plant is individually rendered after zooming in.

Alternative considered: preserve all special-state plants as individual overlays at every zoom. A large completed spraying operation could then defeat the render bound.

### Stabilize marker props and disable unnecessary native tracking

Individual and cluster marker components will be memoized with stable callbacks and IDs. Static custom marker content will set `tracksViewChanges={false}` after its visual state is established. Only IDs whose visual category changes should remount or update.

### Add development diagnostics and deterministic performance assertions

In development, an optional compact diagnostic will report total loaded plants, viewport candidates, individual markers, clusters, and query duration. Unit tests will assert stable output, render bounds, state aggregation, and viewport changes. Map tests will verify region wiring, cluster expansion, nearest styling, and spraying press behavior.

## Risks / Trade-offs

- [Clusters temporarily hide individual plants] → Cluster presses zoom in, counts remain visible, and individual actions are available at detailed zoom.
- [Latitude/longitude grid distortion] → Derive longitude scale from latitude and use the grid only for visualization, never domain distance calculations.
- [Nested map updates can reset camera state] → Update marker data only; never replace `initialRegion` or imperatively recenter during clustering.
- [Marker budget may be too high for old devices or too low for tablets] → Centralize defaults, instrument counts/duration, and allow platform-tuned constants after measurement.
- [Special-state changes can invalidate clusters frequently] → Keep the coordinate index stable and recompute only lightweight visualization metadata.
- [Custom marker snapshots can become stale with `tracksViewChanges={false}`] → Include visual category in stable keys or briefly enable tracking only when category changes.

## Migration Plan

1. Add and test spatial index, viewport query, and grid aggregation helpers behind the shared marker API.
2. Integrate region-aware visualization into inspection while retaining nearest-plant domain computation.
3. Integrate spraying, including cluster status counts and detailed-zoom plant review.
4. Exercise synthetic 1,000/5,000/10,000-plant datasets and tune centralized limits on Android and iOS development builds.
5. Remove the legacy all-markers path after both integrations and regression tests pass.

Rollback restores direct `plantsData.map` rendering; no stored data or database migration must be reverted.

## Open Questions

- Final marker budget and grid sizes should be tuned using representative orchard datasets and the lowest supported Android device; the design starts with 250 overlays as a testable ceiling.
