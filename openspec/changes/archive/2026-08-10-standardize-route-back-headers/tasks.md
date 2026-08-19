## 1. Shared Header Foundation

- [x] 1.1 Review the current `/spraying` header variants and extract a shared field-work header component with configurable title, subtitle, back action, and optional right-side action slot.
- [x] 1.2 Update the field-work route stack configuration so `inspection` and `annotation` no longer rely on the native stack header.

## 2. Route Integration

- [x] 2.1 Integrate the shared header into the inspection route and adjust top spacing so the map summary panel does not collide with the new header.
- [x] 2.2 Integrate the shared header into the annotation route and adjust top spacing so the map summary panel and actions keep their current usability.
- [x] 2.3 Refactor the spraying list and map states to consume the shared header component while preserving their current back-navigation behavior and route-specific actions.

## 3. Verification

- [x] 3.1 Update or add component tests covering header rendering and back-button behavior for `inspection`, `annotation`, and `spraying`.
- [x] 3.2 Run the relevant test suite and verify that the field-work routes render the standardized header without regressions in navigation flow.
