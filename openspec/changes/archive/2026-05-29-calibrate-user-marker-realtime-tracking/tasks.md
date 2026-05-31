## 1. Heading Selection

- [x] 1.1 Add heading-source selection helpers that prefer valid GPS course heading while walking and use sensor heading otherwise.
- [x] 1.2 Add speed/heading validity thresholds for deciding when movement heading is reliable.
- [x] 1.3 Add heading correction offset support and apply it after source selection and normalization.
- [x] 1.4 Preserve shortest-path heading smoothing across the `359` to `0` degree boundary.

## 2. User Marker Integration

- [x] 2.1 Update `useDeviceHeading` or a related hook to accept location heading, speed, and correction offset inputs.
- [x] 2.2 Update `UserMarkerLocation` props to pass the data needed for movement-heading selection without changing the current visual style.
- [x] 2.3 Verify the pointer uses GPS course while walking and sensor heading when stationary or GPS heading is invalid.

## 3. Real-Time Location Updates

- [x] 3.1 Tune the inspection foreground `Location.watchPositionAsync` options for more responsive walking updates.
- [x] 3.2 Add bounded visual coordinate smoothing or marker animation for `UserMarkerLocation`.
- [x] 3.3 Ensure stale, invalid, or large-jump location updates snap safely instead of animating through misleading positions.
- [x] 3.4 Keep nearest-plant persistence gated by existing meaningful-change rules despite more frequent visual updates.

## 4. Verification

- [x] 4.1 Run TypeScript validation.
- [x] 4.2 Run ESLint on changed files.
- [ ] 4.3 Test on a physical device by walking straight and confirming the pointer points forward instead of to the right.
- [ ] 4.4 Test on a physical device that marker movement feels continuous and does not lag excessively.
