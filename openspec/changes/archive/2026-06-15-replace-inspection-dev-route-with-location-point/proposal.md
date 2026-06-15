## Why

The current inspection DEV simulator requires three map points and plays an interpolated route, which is unnecessarily slow when the developer only needs to test nearest-plant behavior at a specific coordinate. A single-point location override makes inspection testing faster and easier to control.

## What Changes

- Replace the P1/P2/P3 route controls with a single DEV-only point selection control.
- Apply the selected map coordinate immediately as the effective user location instead of generating or playing a route.
- Keep device location updates from replacing the selected DEV location while the point exists.
- Delete the simulated point through the existing clear action and immediately resume normal device location detection.
- Remove route preview, interval playback, start/stop controls, and route-specific helper logic and tests from the inspection simulator.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `inspection-map-nearest-plant`: Define the single-point DEV location override and restoration of normal device location detection when it is deleted.
- `mvvm-helper-organization`: Replace route-specific inspection simulation helper requirements with the smaller point-location transformation required by the new flow.

## Impact

- Affects the inspection map, DEV simulation control, inspection location update orchestration, and their unit/component tests.
- Removes inspection-only route interpolation and timer behavior.
- Does not change production behavior, public APIs, dependencies, SQLite data, or Supabase contracts.
