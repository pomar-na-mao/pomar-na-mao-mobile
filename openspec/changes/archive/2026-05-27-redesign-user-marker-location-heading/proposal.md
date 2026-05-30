## Why

The current `UserMarkerLocation` uses a map polygon cone that can look detached from the user's marker, especially after resizing the user marker to match plant markers. Field inspection needs a compact marker that keeps the user circle visible while clearly showing the direction the device/user is facing.

## What Changes

- Replace the detached geographic cone visual with a marker-centered heading indicator rendered as part of `UserMarkerLocation`.
- Keep the user position circle visually comparable to plant markers while adding an attached direction cue such as a small arrow, pointer, or wedge.
- Use `expo-sensors` to read device orientation/compass data, with a fallback to `expo-location` heading when sensors are unavailable or invalid.
- Smooth heading updates to avoid jitter while walking through the orchard.
- Remove the current cone-offset workaround and avoid map `Polygon` overlays for the user heading marker.

## Capabilities

### New Capabilities

- `user-location-heading-marker`: Covers the shared user-location marker, its heading source, sensor fallback behavior, and map visual requirements.

### Modified Capabilities

None.

## Impact

- Adds `expo-sensors` as a project dependency installed through Expo.
- Affects `src/ui/shared/components/user-marker-location`.
- May add shared geolocation/sensor utilities or hooks under `src/utils/geolocation` or `src/ui/shared/hooks`.
- Affects inspection map usage of `UserMarkerLocation`; spraying can opt into the same shared marker later if needed.
- Requires device testing because compass/magnetometer behavior depends on real mobile hardware and calibration.
