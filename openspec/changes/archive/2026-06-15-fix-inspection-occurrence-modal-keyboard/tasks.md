## 1. Modal Layout

- [x] 1.1 Wrap `NearestPlantModal` in a platform-aware `KeyboardAvoidingView` matching `SprayingSetupModal`.
- [x] 1.2 Move the nearest-plant details and occurrence form into a bounded scroll container with `keyboardShouldPersistTaps="handled"` and `keyboardDismissMode="on-drag"`.
- [x] 1.3 Keep the close/save actions reachable outside the scrollable body while preserving current submit and close behavior.
- [x] 1.4 Add bottom spacing and bounded card styles so the final editable fields can scroll above deployed mobile keyboards.

## 2. Tests and Verification

- [x] 2.1 Extend `NearestPlantModal` tests to assert the keyboard-avoiding wrapper and scroll keyboard props.
- [x] 2.2 Add or update tests that confirm save and close actions remain available after the layout change.
- [x] 2.3 Run the focused nearest-plant modal tests.
- [x] 2.4 Run lint and TypeScript validation for the changed files.
