## ADDED Requirements

### Requirement: Spraying route hosts the detailed workflow

The `/spraying` route SHALL render a new map-first spraying feature with operation summary, current location, route state, loaded plants, and lifecycle actions.

#### Scenario: User opens spraying

- **WHEN** the user navigates to `/spraying`
- **THEN** the app SHALL show the spraying map and an idle operation state
- **AND** it SHALL provide actions to configure, start, finish, simulate, review, and synchronize as allowed by the current lifecycle state

### Requirement: Spraying setup collects required operation data

The spraying feature SHALL first require the user to select a zone and explicitly load its plants. Only after the zone plants are loaded SHALL it enable the operation start action that collects operator, optional machine or sprayer identification, and at least one applied input before tracking starts.

#### Scenario: User configures a valid operation

- **WHEN** the user selects a zone and presses the action to load its plants
- **THEN** the app SHALL load the active plants from that zone
- **AND** it SHALL enable the operation start action

#### Scenario: User starts a configured operation

- **WHEN** zone plants are loaded and the user confirms the required operator data and at least one input
- **THEN** the app SHALL create the local spraying operation
- **AND** it SHALL immediately start GPS tracking

#### Scenario: Required setup data is missing

- **WHEN** the user attempts to start without all required setup data
- **THEN** the app SHALL keep the operation idle
- **AND** it SHALL identify the invalid or missing fields

### Requirement: Spraying actions follow a controlled lifecycle

The feature SHALL enforce the lifecycle `draft`, `tracking`, `finished`, `simulated`, `reviewed`, `syncing`, and `synced` or `sync_error`.

#### Scenario: User finishes an active track

- **WHEN** the operation is `tracking` and the user confirms finish
- **THEN** GPS capture SHALL stop
- **AND** the operation SHALL become `finished`
- **AND** simulation SHALL become available

#### Scenario: Developer simulates a spraying route

- **WHEN** the app is running in development mode and the operation is `tracking`
- **THEN** the map SHALL allow selecting P1 and P2 points
- **AND** starting the simulation SHALL emit persisted route points from P1 to P2 without requiring real GPS movement
- **AND** points captured before the simulation start SHALL be discarded from the simulated route
- **AND** real foreground location updates SHALL NOT move the displayed user marker during the simulation
- **AND** route simulation SHALL NOT reset the user's current map zoom or camera position

#### Scenario: User attempts to synchronize before review

- **WHEN** the operation has not reached `reviewed`
- **THEN** synchronization SHALL remain unavailable

#### Scenario: User deletes an active local spraying operation

- **WHEN** a non-synchronized operation exists and the user confirms deletion
- **THEN** the app SHALL stop active GPS capture when necessary
- **AND** it SHALL delete the local operation, points, route, inputs, candidates, and confirmed plants atomically
- **AND** it SHALL keep the selected zone plants loaded on the map

### Requirement: Field-work navigation exposes spraying

The field-work menu and root stack SHALL expose `/spraying` alongside inspection and annotation.

#### Scenario: User opens the field-work menu

- **WHEN** the field-work menu renders
- **THEN** it SHALL include a spraying entry that navigates to `/spraying`
