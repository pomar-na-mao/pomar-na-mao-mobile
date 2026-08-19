# spraying-screen-route Specification

## Purpose
TBD - created by archiving change implement-detailed-spraying-workflow. Update Purpose after archive.
## Requirements
### Requirement: Spraying route hosts the detailed workflow

The `/spraying` route SHALL render a new map-first spraying feature with operation summary, current location, route state, loaded plants, and lifecycle actions, and it SHALL define the standardized in-screen header pattern used by the field-work routes.

#### Scenario: User opens spraying

- **WHEN** the user navigates to `/spraying`
- **THEN** the app SHALL show a standardized in-screen header with a back action consistent with the route's current state
- **AND** it SHALL show the spraying map or spraying list according to the active spraying view
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

### Requirement: Loaded spraying zone survives app restart

The spraying screen SHALL restore the last loaded zone and its cached plants
after the app is closed and reopened, as long as the user has not explicitly
deleted or replaced that loaded spraying state.

#### Scenario: User reopens the app after loading plants

- **WHEN** the user has loaded plants for a spraying zone and then closes and
  reopens the app before starting a spraying operation
- **THEN** the spraying screen SHALL restore the selected zone from local
  persistence
- **AND** it SHALL render that zone's cached plants on the map without requiring
  another remote load
- **AND** the screen summary SHALL show the loaded zone and plant count

#### Scenario: User deletes loaded spraying state

- **WHEN** the user confirms deletion while a zone's plants are loaded on the
  spraying screen
- **THEN** the app SHALL clear the selected zone and loaded plants from memory
  and local persistence
- **AND** reopening the app SHALL NOT restore those deleted loaded plants

#### Scenario: User loads another zone

- **WHEN** the user loads plants for a different spraying zone
- **THEN** the app SHALL replace the persisted loaded-zone identity
- **AND** future app startups SHALL restore the newly loaded zone instead of the
  previous one

### Requirement: Spraying uses preloaded zones

The spraying route SHALL initialize its zone options from the field-work preload and SHALL NOT repeat the Supabase zone request when the route mounts.

#### Scenario: User opens spraying from a ready card

- **WHEN** the spraying card is ready and the user navigates to `/spraying`
- **THEN** the spraying provider SHALL expose the preloaded zones
- **AND** route startup SHALL NOT request zones again

#### Scenario: User selects a loaded zone

- **WHEN** the user selects a zone whose plants were loaded from the field-work screen
- **THEN** the spraying workflow SHALL read that zone's plants from shared SQLite storage
- **AND** it SHALL NOT request plants from Supabase

### Requirement: Spraying list permits consecutive offline operations

The `/spraying` list SHALL provide an accessible action to begin a spraying cycle when completed local operations remain unsynchronized, and it SHALL keep at most one `draft` or `tracking` operation in progress.

#### Scenario: User starts another spraying before synchronizing

- **WHEN** the list contains one or more operations in `finished`, `simulated`, `reviewed`, or `sync_error` and no operation is `draft` or `tracking`
- **THEN** the list SHALL show an action labeled to start a new spraying
- **AND** selecting it SHALL open the map in a new-operation setup state
- **AND** the existing operations SHALL remain available for later review, synchronization, or deletion

#### Scenario: Several completed operations are pending

- **WHEN** the user has completed multiple spraying operations without synchronizing them
- **THEN** every operation SHALL remain listed with its own lifecycle and actions
- **AND** the action to start another spraying SHALL remain available

#### Scenario: An operation is already in progress

- **WHEN** an operation in `draft` or `tracking` exists and the user selects the new-spraying entry point
- **THEN** the app SHALL reopen that in-progress operation
- **AND** it SHALL NOT create a second in-progress operation

#### Scenario: New-operation action remains visible at the list footer

- **WHEN** the spraying list is empty or contains enough operations to scroll
- **THEN** a single new-operation action SHALL remain visible below the scrollable list
- **AND** it SHALL be presented separately from per-operation actions without obscuring list content
- **AND** the same action SHALL be used in empty and non-empty states
- **AND** it SHALL have a textual accessibility label and a touch target of at least 44 by 44 points

#### Scenario: User chooses a loaded zone for the next spraying

- **WHEN** the previous spraying zone is restored and the user starts a new spraying cycle
- **THEN** the app SHALL open the loaded-zone selector with the restored zone preselected
- **AND** it SHALL allow the user to choose any other locally loaded zone
- **AND** it SHALL open operation setup only after the selected zone plants load successfully

#### Scenario: User cancels zone confirmation for the next spraying

- **WHEN** the loaded-zone selector was opened from the new-cycle start action and the user cancels it
- **THEN** the app SHALL keep the prior idle zone state
- **AND** it SHALL NOT open operation setup

