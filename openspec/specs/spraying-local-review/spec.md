# spraying-local-review Specification

## Purpose
TBD - created by archiving change implement-detailed-spraying-workflow. Update Purpose after archive.
## Requirements
### Requirement: Spraying data is persisted in feature-specific SQLite tables

The app SHALL initialize and use local tables for spraying operations, track points, consolidated routes, inputs, candidate plants, and confirmed plants as defined by item 20.4.

#### Scenario: SQLite initialization runs

- **WHEN** the local database initializes
- **THEN** all six spraying tables and their lookup indexes SHALL exist without deleting existing local data

#### Scenario: Spraying state changes

- **WHEN** setup, tracking, simulation, review, or sync state changes
- **THEN** the corresponding operation and child rows SHALL be updated transactionally where consistency spans multiple tables

### Requirement: Zone selection loads eligible local plants

The app SHALL load non-existent-filtered plants for the selected zone from
SQLite, SHALL retain their coordinates for offline map display and simulation,
and SHALL persist the loaded zone identity so those cached plants can be
restored after app restart until the user explicitly deletes or replaces the
loaded spraying state.

#### Scenario: User loads a zone

- **WHEN** a zone is selected during setup
- **THEN** the app SHALL load the zone's eligible local plants
- **AND** the map SHALL distinguish them from plants later classified as
  candidates or confirmed
- **AND** the plants SHALL render with the same circular plant marker style used
  by inspection
- **AND** the loaded zone identity SHALL be persisted locally

#### Scenario: Cached loaded zone is restored

- **WHEN** the app starts with a persisted loaded spraying zone and no
  recoverable active spraying operation
- **THEN** the app SHALL reload that zone's eligible cached plants from SQLite
- **AND** it SHALL restore them as the selected spraying zone plants

#### Scenario: Persisted loaded zone has no cached plants

- **WHEN** the app starts with a persisted loaded spraying zone whose cached
  local plant list is empty
- **THEN** the app SHALL leave the spraying screen in the empty loaded-plant
  state
- **AND** it SHALL allow the user to load plants from the zone modal again

### Requirement: Completed tracks are consolidated locally

The app SHALL produce a chronological GeoJSON `LineString`, distance, start time, and finish time from accepted persisted track points after tracking finishes.

#### Scenario: At least two accepted points exist

- **WHEN** the user finishes tracking
- **THEN** the app SHALL store a consolidated local route with `[longitude, latitude]` coordinates
- **AND** it SHALL calculate route distance from consecutive accepted points

#### Scenario: Insufficient points exist

- **WHEN** fewer than two accepted points are available
- **THEN** the operation SHALL remain unsimulatable
- **AND** the app SHALL explain that a valid route was not captured

### Requirement: Simulation uses the lateral treatment band

The local simulation SHALL calculate each loaded plant's shortest geodesic distance to the completed route and classify it as a candidate when the distance is within the operation's configured inclusive minimum and maximum range, defaulting to 3.5 and 4.0 meters.

#### Scenario: Plant lies within the default band

- **WHEN** a plant's shortest route distance is at least 3.5 meters and at most 4.0 meters
- **THEN** the simulation SHALL create or update it as an `auto_matched` candidate with the nearest track context

#### Scenario: Plant lies outside the configured band

- **WHEN** a plant's shortest route distance is outside the operation's minimum and maximum range
- **THEN** the simulation SHALL leave it unselected unless the user manually adds it

### Requirement: User review is authoritative

The map review UI SHALL distinguish affected plants from unaffected plants through individual markers or cluster summaries and SHALL let the user add or remove individual plants by tapping individually rendered map markers before synchronization.

#### Scenario: User removes an automatic candidate

- **WHEN** an affected `auto_matched` plant is individually rendered and the user taps it to mark it as not treated
- **THEN** it SHALL be excluded from confirmed plants
- **AND** the override SHALL persist across screen reloads and repeated simulation

#### Scenario: User manually adds a plant

- **WHEN** a non-candidate zone plant is individually rendered and the user taps it as treated
- **THEN** it SHALL be stored as confirmed with `match_source = 'manual_added'`

#### Scenario: Dense spraying plants are clustered

- **WHEN** the current viewport contains more spraying plants than the render budget
- **THEN** the map SHALL cluster nearby plants and indicate clusters containing affected plants
- **AND** pressing a cluster SHALL zoom toward its plants without changing review state

#### Scenario: User confirms review

- **WHEN** the user accepts the reviewed selection
- **THEN** the operation SHALL become `reviewed`
- **AND** only the confirmed plant set SHALL be eligible for synchronization

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

