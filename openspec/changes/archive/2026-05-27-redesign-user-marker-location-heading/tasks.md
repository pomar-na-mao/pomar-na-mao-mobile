## 1. Dependency Setup

- [x] 1.1 Install `expo-sensors` with `npx expo install expo-sensors`.
- [x] 1.2 Verify `package.json`, `package-lock.json`, and `app.config.ts` for any required sensor permission configuration.

## 2. Heading Source

- [x] 2.1 Add heading math helpers for degree normalization, shortest-angle interpolation, and jitter thresholding.
- [x] 2.2 Add a shared `useDeviceHeading` hook that checks sensor availability, requests permission when needed, subscribes to `Magnetometer`, and cleans up on unmount.
- [x] 2.3 Implement heading fallback selection so sensor heading is preferred and location heading is used only when sensor heading is unavailable or invalid.
- [x] 2.4 Verify heading behavior across the `359` to `0` degree boundary.

## 3. Marker Redesign

- [x] 3.1 Replace `UserMarkerLocation` polygon cone rendering with a single custom `Marker` view.
- [x] 3.2 Render a plant-scale user circle and an attached rotated direction pointer whose visual origin is the marker center.
- [x] 3.3 Ensure the marker renders only the user circle when no valid heading exists.
- [x] 3.4 Remove obsolete cone-offset logic and unused user-location cone helpers.

## 4. Map Integration

- [x] 4.1 Update inspection map usage to pass current location heading as a fallback to the redesigned `UserMarkerLocation`.
- [x] 4.2 Audit other map screens for `UserMarkerLocation` reuse or old user marker behavior.

## 5. Verification

- [x] 5.1 Run TypeScript validation.
- [x] 5.2 Run ESLint on changed files.
- [ ] 5.3 Test on a physical device by rotating in place and confirming the direction pointer stays attached to the user circle.
- [x] 5.4 Check the inspection map with loaded plant markers to confirm the user circle remains visually comparable to plant marker size.
