## Context

`UserMarkerLocation` now renders a compact marker-centered pointer and reads heading from `expo-sensors`, falling back to `expo-location`. In real walking use, the pointer can appear shifted to the right of the user's forward movement. The current inspection location subscription also uses a `timeInterval` of 1000ms and `distanceInterval` of 1m, which can make the marker move in visible jumps.

The requested behavior is closer to the native Google Maps user marker: the marker should feel live while walking, and its direction should match the visible movement direction instead of appearing offset.

## Goals / Non-Goals

**Goals:**

- Align the marker pointer with the user's forward walking direction.
- Keep the current `UserMarkerLocation` visual style.
- Prefer movement/course heading while the user is actively walking and location heading is reliable.
- Use sensor heading as a fallback or stationary direction source, with a correction offset available for device-axis differences.
- Make the user marker position update feel more real-time and less jumpy.
- Avoid increasing SQLite writes or nearest-plant persistence frequency unnecessarily.

**Non-Goals:**

- Do not redesign plant markers.
- Do not replace `react-native-maps`.
- Do not add background tracking for inspection.
- Do not change inspection sync or occurrence editing behavior.
- Do not require remote schema changes.

## Decisions

1. Prefer GPS course heading while walking.

   When `LocationObject.coords.speed` is above a small walking threshold and `coords.heading` is valid, the marker should use that heading as the primary visual direction. This matches what the user expects while walking: the arrow points where the user is moving. Sensor heading remains useful when the user is stopped, moving slowly, or when GPS heading is unavailable.

   Alternative considered: always use magnetometer heading. This was rejected because phone/device orientation is not always the same as walking direction, and the current issue was observed while walking.

2. Keep a heading correction offset in the heading pipeline.

   Add an explicit correction offset, for example `headingOffsetDegrees`, applied after selecting the heading source and before rendering. The default can start at `0` or a measured project constant, but the implementation should make the correction easy to tune after physical-device testing.

   Alternative considered: adjust the pointer layout by rotating the view manually. This was rejected because it hides the calibration issue in styles and makes future sensor math harder to reason about.

3. Separate visual marker updates from heavier inspection state persistence.

   The marker can receive more frequent location updates and animate/smooth displayed coordinates, while nearest-plant persistence remains throttled by existing meaningful-change checks. This improves perceived real-time movement without writing to SQLite on every GPS tick.

   Alternative considered: simply lower `timeInterval` and persist every update. This was rejected because it can increase battery use and unnecessary SQLite work.

4. Tune foreground inspection location subscription for live movement.

   The inspection foreground watcher should use `BestForNavigation`, a lower `timeInterval` where supported, and `distanceInterval: 0` or a very small distance interval for visual responsiveness. The implementation should still handle platform throttling because Android/iOS may not honor exact intervals.

   Alternative considered: keep the existing `1000ms/1m` watcher. This was rejected because it visibly lags and jumps during walking.

5. Smooth position display with bounded interpolation.

   Add a small display-coordinate smoothing layer or use `react-native-maps` animated marker support where it fits the current component. The interpolation should be short enough to feel live and should snap when updates are stale or jump too far, avoiding a marker that trails behind the user.

   Alternative considered: heavy animation or route prediction. This was rejected because inspection needs accurate nearby plant behavior more than speculative movement.

## Risks / Trade-offs

- [Risk] GPS heading can be noisy at very low speed -> Mitigation: only prefer movement heading above a walking speed threshold and fall back to sensor heading otherwise.
- [Risk] Sensor and GPS headings can disagree -> Mitigation: expose the selected heading source in code and use deterministic source selection rules.
- [Risk] More frequent location updates can use more battery -> Mitigation: apply only to active foreground inspection map usage and keep persistence throttled.
- [Risk] Smoothing can make the marker lag behind -> Mitigation: cap animation duration and snap on large jumps or stale updates.
- [Risk] Offset tuning requires real-device testing -> Mitigation: centralize the offset constant/prop and include a physical walking verification task.

## Migration Plan

1. Add heading source selection that prefers GPS course while walking and sensor heading otherwise.
2. Add heading correction offset support in the heading utility or `UserMarkerLocation`.
3. Adjust the inspection location watcher for more frequent foreground updates.
4. Add display-coordinate smoothing or marker animation without changing persistence thresholds.
5. Validate TypeScript and lint on changed files.
6. Test on a physical device by walking straight and confirming the arrow points forward and the marker movement feels live.

Rollback is to restore the previous `useDeviceHeading`, `UserMarkerLocation`, and inspection watcher interval settings.

## Open Questions

- What heading offset is visually correct on the primary target devices after field testing?
- Should spraying reuse the same live user marker behavior later, or keep its current native/default marker behavior?
