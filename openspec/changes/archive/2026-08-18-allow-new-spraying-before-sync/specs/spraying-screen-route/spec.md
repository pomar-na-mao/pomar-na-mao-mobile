## ADDED Requirements

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
