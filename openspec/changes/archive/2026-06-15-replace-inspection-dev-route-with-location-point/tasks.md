## 1. Location Override State

- [x] 1.1 Update the inspection view-model to cache every latest device-sourced location while allowing an active DEV override to suppress it from effective inspection state.
- [x] 1.2 Restore the cached device location through the normal nearest-plant evaluation path when the DEV override is disabled.
- [x] 1.3 Extend view-model tests to verify simulated updates remain effective during the override and deletion immediately restores normal device-driven location behavior.

## 2. Single-Point DEV Map Flow

- [x] 2.1 Replace the three-point route state, interval playback, and start/stop callbacks in `InspectionMap` with one simulated point and one point-selection mode.
- [x] 2.2 Apply a selected map coordinate immediately as the simulated user location and allow a later selection to replace the existing point.
- [x] 2.3 Remove the simulation polyline and render only one DEV point marker.
- [x] 2.4 Update the DEV simulation overlay to expose point selection and deletion controls without P1/P2/P3 or route playback actions.

## 3. Helper Cleanup

- [x] 3.1 Replace route interpolation, segment, bearing, and timer helpers with an inspection-local factory for a stationary synthetic `LocationObject`.
- [x] 3.2 Remove obsolete route helper exports, route tuple/index types, interval constants, and duplicate route-oriented tests.
- [x] 3.3 Add helper tests for coordinate, timestamp, and stationary metadata in the synthetic location value.

## 4. Verification

- [x] 4.1 Update inspection map and simulation control component tests for single-point selection, replacement, deletion, and DEV-only rendering.
- [x] 4.2 Run the focused inspection helper, component, map, and view-model Jest suites.
- [x] 4.3 Run TypeScript validation and linting for the changed implementation.
