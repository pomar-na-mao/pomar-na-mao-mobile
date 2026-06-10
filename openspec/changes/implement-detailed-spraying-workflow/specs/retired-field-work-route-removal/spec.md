## MODIFIED Requirements

### Requirement: Retired app routes are removed

The app SHALL keep the `/add-plant` route entrypoint removed, SHALL keep `/annotation` active, and SHALL reactivate `/spraying` only through the new detailed spraying implementation.

#### Scenario: Developer inspects app routes

- **WHEN** `src/app` is inspected after implementation
- **THEN** `add-plant.tsx` SHALL NOT exist
- **AND** `annotation.tsx` and `spraying.tsx` SHALL exist as active route entrypoints

### Requirement: Retired flows are not reachable from navigation

The app SHALL keep navigation registrations and menu entries for `/add-plant` removed while exposing the active `/annotation` and `/spraying` routes.

#### Scenario: User opens field work menu

- **WHEN** the field-work menu is rendered after implementation
- **THEN** it SHALL NOT show an action that navigates to `/add-plant`
- **AND** it SHALL show actions that navigate to `/annotation` and `/spraying`

#### Scenario: Developer inspects stack configuration

- **WHEN** `src/app/_layout.tsx` is inspected after implementation
- **THEN** it SHALL NOT register an `add-plant` stack screen
- **AND** it SHALL register `annotation` and `spraying` stack screens

### Requirement: Exclusive retired-flow code is deleted

The app SHALL keep implementation files used only by the retired add-plant flow deleted and SHALL implement spraying as new code consistent with the current architecture rather than restoring deleted legacy files wholesale.

#### Scenario: Developer searches retired UI folders

- **WHEN** the codebase is inspected after implementation
- **THEN** `src/ui/add-plant` SHALL NOT remain as an active feature folder
- **AND** `src/ui/annotation` and `src/ui/spraying` SHALL contain active implementations

#### Scenario: Developer searches exclusive retired data modules

- **WHEN** data, domain, store, hook, task, utility, and constant modules are inspected after implementation
- **THEN** modules exclusively used by add-plant or obsolete legacy spraying behavior SHALL remain removed

### Requirement: Remaining app compiles without retired imports

The retained and reactivated app SHALL compile without stale imports from deleted add-plant or obsolete legacy spraying files.

#### Scenario: TypeScript validation runs

- **WHEN** TypeScript validation is run after implementation
- **THEN** it SHALL NOT fail due to missing retired-route modules or stale imports

#### Scenario: Retired flow terms are searched

- **WHEN** the codebase is searched for removed route paths and feature imports
- **THEN** `/add-plant` matches SHALL be historical documentation or intentional tests
- **AND** active `/spraying` matches SHALL reference the new implementation
