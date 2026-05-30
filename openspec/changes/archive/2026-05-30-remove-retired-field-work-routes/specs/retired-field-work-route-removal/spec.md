## ADDED Requirements

### Requirement: Retired app routes are removed
The app SHALL remove the `/add-plant`, `/annotation`, and `/spraying` route entrypoints.

#### Scenario: Developer inspects app routes
- **WHEN** `src/app` is inspected after implementation
- **THEN** `add-plant.tsx`, `annotation.tsx`, and `spraying.tsx` SHALL NOT exist
- **AND** retained route files SHALL remain available

### Requirement: Retired flows are not reachable from navigation
The app SHALL remove navigation registrations and menu entries that point to the retired routes.

#### Scenario: User opens field work menu
- **WHEN** the field-work menu is rendered after implementation
- **THEN** it SHALL NOT show actions that navigate to `/add-plant`, `/annotation`, or `/spraying`

#### Scenario: Developer inspects stack configuration
- **WHEN** `src/app/_layout.tsx` is inspected after implementation
- **THEN** it SHALL NOT register stack screens for `add-plant`, `annotation`, or `spraying`

### Requirement: Exclusive retired-flow code is deleted
The app SHALL delete implementation files that are used only by the retired add-plant, annotation, and spraying flows.

#### Scenario: Developer searches retired UI folders
- **WHEN** the codebase is inspected after implementation
- **THEN** `src/ui/add-plant`, `src/ui/annotation`, and `src/ui/spraying` SHALL NOT remain as active feature folders

#### Scenario: Developer searches exclusive retired data modules
- **WHEN** data, domain, store, hook, task, utility, and constant modules are inspected after implementation
- **THEN** modules exclusively imported by the retired routes SHALL be removed

### Requirement: Remaining app compiles without retired imports
The retained app SHALL compile without imports or route references to deleted retired-flow files.

#### Scenario: TypeScript validation runs
- **WHEN** TypeScript validation is run after implementation
- **THEN** it SHALL NOT fail due to missing retired-route modules or stale imports

#### Scenario: Retired flow terms are searched
- **WHEN** the codebase is searched for removed route paths and feature imports
- **THEN** remaining matches SHALL be either historical documentation/OpenSpec artifacts or retained domain-neutral schema fields, not active route references
