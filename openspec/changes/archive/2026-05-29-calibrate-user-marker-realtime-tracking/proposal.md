## Why

The current `UserMarkerLocation` visual style is acceptable, but the heading pointer appears slightly rotated to the right while walking, which makes the user-facing direction misleading during inspection. The marker position also updates in visible jumps; field use needs a smoother, more real-time feel similar to native map user-location markers.

## What Changes

- Calibrate the heading calculation and/or marker rotation so the pointer aligns with the user's forward movement and device orientation.
- Add a configurable heading offset or correction path so platform/device-specific right-shift can be adjusted without changing marker layout.
- Improve inspection location tracking frequency and UI updates to make the user marker move more continuously while walking.
- Smooth marker coordinate updates without delaying nearest-plant detection or persistence.
- Preserve the current marker visual style, plant-scale user circle, and attached pointer design.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `user-location-heading-marker`: Adjust heading alignment requirements and add real-time marker movement behavior.

## Impact

- Affects `src/ui/shared/components/user-marker-location`.
- Affects `src/shared/hooks/use-device-heading` and `src/utils/geolocation/heading`.
- Affects inspection location subscription/update behavior in `src/ui/inspection/view-models/use-inspection.tsx`.
- May add a shared hook or utility for smoother marker coordinates.
- Requires physical device verification while walking because compass heading and GPS update cadence cannot be fully validated in simulator.
