## ADDED Requirements

### Requirement: Completed local spraying operations do not own the active cycle

The app SHALL distinguish an in-progress local spraying operation (`draft` or `tracking`) from completed operations retained for review or synchronization, and completed operations SHALL NOT prevent creation of a later spraying cycle.

#### Scenario: First operation is finished offline

- **WHEN** the user finishes a spraying operation without synchronizing it
- **THEN** the app SHALL retain the completed operation and all child records under its stable local identity
- **AND** it SHALL consider the active tracking cycle available for another operation

#### Scenario: Second operation is created before first sync

- **WHEN** a completed unsynchronized operation exists and the user confirms setup for another spraying
- **THEN** the app SHALL create the new operation with a different stable local identity
- **AND** it SHALL leave the earlier operation and all of its child records unchanged

#### Scenario: App restarts with only completed pending operations

- **WHEN** the app starts with one or more completed unsynchronized operations and no `draft` or `tracking` operation
- **THEN** it SHALL keep those operations in the list
- **AND** it SHALL restore the loaded-zone setup state without assigning a completed operation as the active cycle

#### Scenario: App restarts with an in-progress operation

- **WHEN** the app starts with an operation in `draft` or `tracking`
- **THEN** it SHALL recover that operation as the active cycle
- **AND** it SHALL prevent insertion of another `draft` or `tracking` operation until the recovered cycle is finished or deleted

#### Scenario: Pending operation is synchronized independently

- **WHEN** the user synchronizes a completed operation while another operation exists locally
- **THEN** the app SHALL update and clear UI state only for the synchronized operation ID
- **AND** it SHALL preserve the lifecycle, children, loaded-zone state, and active GPS tracking of every other operation
