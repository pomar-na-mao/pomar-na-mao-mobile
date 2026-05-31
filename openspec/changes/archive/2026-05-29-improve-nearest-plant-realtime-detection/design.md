## Context

Inspection currently recalculates nearest plant inside a React effect that depends on `currentLocation`, `loadedPlants`, and `nearestPlant`. The algorithm includes a switch margin to avoid flicker and also updates `loadedPlants` marker state plus SQLite persistence from the same flow. In practice, when the user walks between plants, the app can wait too long before visually switching the nearest plant.

Recent marker-location work made foreground GPS updates more frequent. Nearest-plant detection should consume those updates immediately for UI state, while keeping persistence throttled to avoid excessive SQLite writes.

## Goals / Non-Goals

**Goals:**

- Recalculate nearest plant on every valid foreground location update while plants are loaded.
- Update `nearestPlant` and map marker state immediately when another plant is clearly closer.
- Keep hysteresis only for near-tie situations to prevent flickering between adjacent plants.
- Keep SQLite persistence throttled by nearest plant changes and meaningful distance changes.
- Avoid stale React closures delaying nearest-plant decisions.

**Non-Goals:**

- Do not change the inspection SQLite schema.
- Do not change Supabase RPCs or sync payloads.
- Do not redesign plant marker visuals.
- Do not remove the nearest-plant switch margin entirely.
- Do not persist nearest-plant state on every GPS tick.

## Decisions

1. Move nearest-plant decision logic into a stable update function.

   Create a focused function or hook path that receives the latest location and current plants, computes the closest plant, applies switching rules, and returns the next nearest state. Keep refs for the latest nearest plant and loaded plants so the location watcher can evaluate current data without waiting for React effect dependency cycles.

   Alternative considered: keep the current effect and tune constants only. This was rejected because the delay is likely caused by both hysteresis and React state/effect timing.

2. Separate immediate UI update from persistence.

   The in-memory `nearestPlant` and loaded plant marker flags should update as soon as a plant is clearly closer. SQLite writes should remain behind the existing `lastPersistedNearestRef` rules: persist on plant ID change or meaningful distance delta.

   Alternative considered: persist first, then update UI. This was rejected because storage latency should never block the map highlight.

3. Apply hysteresis only to ambiguous switches.

   Keep a margin to avoid rapid oscillation when two plants have nearly equal distance. The app should not block switching when the new plant is materially closer, especially after several location updates show the same candidate.

   Alternative considered: switch to the mathematically nearest plant on every update. This was rejected because GPS noise can make markers flicker around rows of close plants.

4. Avoid full marker-array rewrites unless nearest flags actually changed.

   Updating all loaded plants on every location tick can be wasteful. Marker state should only update when the nearest plant ID changes or the nearest plant distance shown in state changes meaningfully.

   Alternative considered: rewrite `loadedPlants` for every GPS update. This was rejected because it can cause avoidable rerenders when many plants are loaded.

5. Keep validation device-focused.

   Unit-level checks can validate decision rules, but real field behavior depends on GPS cadence and orchard spacing. The implementation should include a manual walking verification step.

## Risks / Trade-offs

- [Risk] Reducing effective hysteresis can cause flicker between plants in dense rows -> Mitigation: keep a near-tie margin and optionally require a candidate to be clearly closer.
- [Risk] More frequent nearest checks can cost CPU with many plants -> Mitigation: keep the O(n) scan simple, skip when no plants are loaded, and avoid state writes when the result is unchanged.
- [Risk] Refs can drift from React state if not kept current -> Mitigation: update refs alongside state transitions and keep nearest decision logic small.
- [Risk] Persistence might lag behind the UI by design -> Mitigation: persist on plant ID changes and meaningful distance changes, while the UI stays immediate.

## Migration Plan

1. Extract or isolate nearest-plant calculation and switch-decision logic.
2. Add refs for latest loaded plants, nearest plant, active inspection, and persistence state where needed.
3. Trigger nearest evaluation from foreground location updates or a tightly coupled current-location path.
4. Update UI state immediately and persist asynchronously only when persistence thresholds are met.
5. Validate TypeScript and ESLint on changed files.
6. Test while walking between two or more loaded plants to confirm the map highlight switches promptly without flicker.
