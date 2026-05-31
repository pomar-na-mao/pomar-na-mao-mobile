## 1. Identify Extraction Targets

- [x] 1.1 Review staged UI component files for pure helpers, mappers, factories, formatters, and calculations that are not rendering or event-binding logic
- [x] 1.2 Review staged view-model files for pure helpers that do not call hooks, mutate provider state directly, or call services
- [x] 1.3 Classify each helper as feature-local or shared based on real usage across features

## 2. Extract Inspection Map Simulation Helpers

- [x] 2.1 Create an inspection-local helper module for map simulation route logic
- [x] 2.2 Move `buildSimulationRoute`, route segment construction, bearing calculation, and simulation location creation out of `InspectionMap`
- [x] 2.3 Export explicit types and constants needed by the component without importing the component from the helper module
- [x] 2.4 Update `InspectionMap` to import the helper module and keep only rendering, local state, refs, and event handlers in the component file

## 3. Extract Additional MVVM Helpers

- [x] 3.1 Move inspection view-model pure helpers into feature-local helper/model files where they are independent from provider orchestration
- [x] 3.2 Move component-local formatters or mappers from staged files into responsibility-specific helper modules when they are reusable or non-trivial
- [x] 3.3 Move only genuinely cross-feature helpers to existing shared utility paths such as `src/utils` or `src/shared`
- [x] 3.4 Update imports and remove duplicated helper declarations from the original files

## 4. Verify Behavior

- [x] 4.1 Run TypeScript validation and fix any import/type issues introduced by the extraction
- [x] 4.2 Run linting and fix touched-file violations
- [ ] 4.3 Verify the dev-only inspection route simulation still starts, emits route locations, and updates nearest-plant state as before
