## ADDED Requirements

### Requirement: Spraying data is persisted in feature-specific SQLite tables

The app SHALL initialize and use local tables for spraying operations, track points, consolidated routes, inputs, candidate plants, and confirmed plants as defined by item 20.4.

#### Scenario: SQLite initialization runs

- **WHEN** the local database initializes
- **THEN** all six spraying tables and their lookup indexes SHALL exist without deleting existing local data

#### Scenario: Spraying state changes

- **WHEN** setup, tracking, simulation, review, or sync state changes
- **THEN** the corresponding operation and child rows SHALL be updated transactionally where consistency spans multiple tables

### Requirement: Zone selection loads eligible local plants

The app SHALL load non-existent-filtered plants for the selected zone from SQLite and SHALL retain their coordinates for offline map display and simulation.

#### Scenario: User loads a zone

- **WHEN** a zone is selected during setup
- **THEN** the app SHALL load the zone's eligible local plants
- **AND** the map SHALL distinguish them from plants later classified as candidates or confirmed
- **AND** the plants SHALL render with the same circular plant marker style used by inspection

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

The map review UI SHALL distinguish affected plants from unaffected plants and SHALL let the user add or remove individual plants by tapping map markers before synchronization.

#### Scenario: User removes an automatic candidate

- **WHEN** the user taps an affected `auto_matched` plant marker to mark it as not treated
- **THEN** it SHALL be excluded from confirmed plants
- **AND** the override SHALL persist across screen reloads and repeated simulation

#### Scenario: User manually adds a plant

- **WHEN** the user taps a non-candidate zone plant marker as treated
- **THEN** it SHALL be stored as confirmed with `match_source = 'manual_added'`

#### Scenario: User confirms review

- **WHEN** the user accepts the reviewed selection
- **THEN** the operation SHALL become `reviewed`
- **AND** only the confirmed plant set SHALL be eligible for synchronization
