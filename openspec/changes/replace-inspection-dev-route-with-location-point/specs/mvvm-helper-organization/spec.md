## MODIFIED Requirements

### Requirement: Feature helpers are separated from components

Components SHALL NOT define reusable pure helpers, mappers, factories, or calculation functions when those helpers can be represented as typed functions in a responsibility-specific feature helper file.

#### Scenario: Inspection map simulated location helpers are reviewed

- **WHEN** the `InspectionMap` component is inspected after implementation
- **THEN** synthetic inspection `LocationObject` construction SHALL be imported from a separate inspection helper module rather than declared inside the component file

#### Scenario: Component event handlers need local state

- **WHEN** a component callback depends on component state, refs, or lifecycle behavior
- **THEN** the callback MAY remain inside the component while pure calculations used by that callback SHALL be delegated to helper functions

### Requirement: Extracted helpers preserve behavior

Extracting helper functions SHALL preserve existing runtime behavior and public UI flows except where an approved capability change explicitly replaces that behavior.

#### Scenario: DEV simulated inspection point is applied

- **WHEN** the developer selects a simulated inspection location after helper extraction
- **THEN** the helper SHALL produce a valid stationary location value at the selected coordinate for the standard inspection location update flow

#### Scenario: Helper extraction is verified

- **WHEN** helper extraction is complete
- **THEN** the codebase SHALL pass TypeScript validation and linting for the touched files
