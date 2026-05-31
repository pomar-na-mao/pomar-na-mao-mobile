## ADDED Requirements

### Requirement: Feature helpers are separated from components
Components SHALL NOT define reusable pure helpers, mappers, factories, or calculation functions when those helpers can be represented as typed functions in a responsibility-specific feature helper file.

#### Scenario: Inspection map simulation route helpers are reviewed
- **WHEN** the `InspectionMap` component is inspected after implementation
- **THEN** simulation route construction helpers such as `buildSimulationRoute`, route segment construction, bearing calculation, and simulation location creation SHALL be imported from a separate inspection helper module rather than declared inside the component file

#### Scenario: Component event handlers need local state
- **WHEN** a component callback depends on component state, refs, or lifecycle behavior
- **THEN** the callback MAY remain inside the component while pure calculations used by that callback SHALL be delegated to helper functions

### Requirement: View-model helpers are separated from orchestration
View-model files SHALL keep state orchestration, service calls, and exposed UI actions in the view-model while pure helper functions that transform, calculate, filter, or map data SHALL be moved to feature-local helper or model files.

#### Scenario: Inspection view-model contains pure calculation helpers
- **WHEN** a helper in `use-inspection` does not call React hooks, mutate provider state directly, or call a service
- **THEN** that helper SHALL be moved to a separate typed file and imported by the view-model

#### Scenario: Helper uses feature-specific inspection types
- **WHEN** a helper depends on inspection-specific types or rules
- **THEN** the helper SHALL live under an inspection-owned path rather than a global utility path

### Requirement: Shared helpers require shared usage
Helpers SHALL be placed under shared utility paths only when they are used by more than one feature or represent domain-neutral logic that already belongs to an existing shared utility category.

#### Scenario: Helper is used only by inspection
- **WHEN** an extracted helper has only inspection consumers
- **THEN** it SHALL remain in an inspection-local helper module

#### Scenario: Helper is used by inspection and spraying
- **WHEN** the same helper is needed by inspection and spraying
- **THEN** it SHALL be moved to an existing shared utility area such as `src/utils/geolocation` or `src/shared` and both features SHALL import the shared implementation

### Requirement: Extracted helpers preserve behavior
Extracting helper functions SHALL preserve existing runtime behavior and public UI flows.

#### Scenario: Dev simulation route is extracted
- **WHEN** the inspection nearest-plant simulation is started in development mode after extraction
- **THEN** it SHALL still produce the same route shape, timestamps, headings, and location update flow as before extraction

#### Scenario: Helper extraction is verified
- **WHEN** helper extraction is complete
- **THEN** the codebase SHALL pass TypeScript validation and linting for the touched files
