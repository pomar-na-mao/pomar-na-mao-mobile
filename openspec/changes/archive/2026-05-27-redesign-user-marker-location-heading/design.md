## Context

`UserMarkerLocation` currently combines a small user circle with a geographic `Polygon` cone. The cone is computed in map coordinates, while the marker itself is rendered in screen pixels by `react-native-maps`. That mismatch makes the cone look detached or visually awkward when the marker size changes.

The existing location heading from `expo-location` describes movement direction and can be `null` or inaccurate while the user is standing still. The requested behavior is closer to device-facing direction, so the implementation should use `expo-sensors` where available and keep `expo-location` heading as a fallback.

## Goals / Non-Goals

**Goals:**

- Redesign `UserMarkerLocation` so the user circle and direction cue are a single visual marker.
- Keep the visible user circle comparable to plant marker size.
- Show direction with an attached pointer/arrow/wedge that originates at the circle center and touches or overlaps the circle.
- Use `expo-sensors` to derive device-facing compass heading when available.
- Smooth heading updates enough to avoid noisy rotation in normal field use.
- Keep map rendering lightweight by avoiding per-frame map polygons for the user heading indicator.

**Non-Goals:**

- Do not redesign plant markers.
- Do not change nearest-plant detection or inspection persistence.
- Do not implement turn-by-turn navigation.
- Do not require sensor heading for the app to function; location heading fallback remains acceptable.
- Do not use background sensor tracking.

## Decisions

1. Render heading as part of the marker view instead of a map polygon.

   `UserMarkerLocation` should render a fixed-size marker frame anchored at the coordinate center. The frame contains the user circle and a rotated direction element whose transform origin is the same center point. The direction element can be a compact triangular pointer, arrow, or wedge that visually overlaps the circle edge.

   Alternative considered: continue using geographic `Polygon` overlays and tune offsets. This was rejected because a map-coordinate polygon and a pixel-sized marker do not remain visually aligned across zoom levels and marker sizes.

2. Use `Magnetometer` from `expo-sensors` as the primary heading source.

   Add a hook or utility, for example `useDeviceHeading`, that checks sensor availability, requests permissions if needed, subscribes to magnetometer updates, converts calibrated `x/y` readings into degrees, and returns a normalized heading in the `[0, 360)` range.

   Alternative considered: use only `LocationObject.coords.heading`. This was rejected because it represents travel direction, not where the device is facing, and often degrades when the user is stopped.

3. Keep a fallback heading path.

   If `Magnetometer` is unavailable, denied, invalid, or temporarily noisy, the component should fall back to the heading already available from `expo-location`. If neither source is valid, the component should render only the user circle.

   Alternative considered: hide the marker when heading is unavailable. This was rejected because current position remains useful even without direction.

4. Smooth heading with circular math.

   Heading smoothing must handle the `359 -> 0` wraparound. A simple low-pass filter or shortest-angle interpolation should be used, with a small threshold to ignore meaningless jitter.

   Alternative considered: directly applying every sensor update to the marker transform. This was rejected because magnetometer readings can flicker noticeably in field conditions.

5. Install the dependency through Expo.

   Add `expo-sensors` with `npx expo install expo-sensors` so the installed version matches the project Expo SDK. Configure `app.config.ts` only if the selected sensor API requires a platform permission message.

   Alternative considered: manually adding a semver range. This was rejected because Expo-managed packages should use `expo install` for SDK-compatible versions.

## Risks / Trade-offs

- [Risk] Magnetometer readings can be disturbed by metal equipment, tractors, or phone calibration state -> Mitigation: smooth readings, fall back gracefully, and test on real Android/iOS devices.
- [Risk] Compass heading formulas can differ by platform/orientation -> Mitigation: isolate conversion in a utility and verify north/east/south/west behavior on device before completing implementation.
- [Risk] A larger marker frame can make the tap/visual footprint feel bigger than plant markers -> Mitigation: keep only the circle at plant-marker scale and let the pointer be slim and attached.
- [Risk] Sensor subscriptions can waste battery if left active -> Mitigation: subscribe only while the marker component is mounted and remove the subscription on unmount.
- [Risk] Web or simulator behavior may not represent real sensors -> Mitigation: keep fallback rendering and document that final visual verification requires a physical device.

## Migration Plan

1. Add `expo-sensors` through Expo.
2. Replace the existing cone utility/component usage with a marker-centered heading visual.
3. Add a shared hook/utility for device heading with availability, permission, fallback, and smoothing.
4. Update inspection map usage to pass location heading as fallback while the marker reads sensor heading internally.
5. Remove obsolete cone-offset logic and unused polygon helpers.
6. Validate TypeScript and lint on changed files.
7. Test on a physical device by rotating in place and confirming the direction cue remains attached to the user circle.

Rollback is to restore the previous `UserMarkerLocation` implementation and remove `expo-sensors` if no other code uses it.

## Open Questions

- Should the marker force map rotation off, or should it compensate for camera heading if rotated maps are introduced later?
- Should the visual cue be a filled triangular pointer, a slim compass needle, or a small wedge matching the current map color palette?
