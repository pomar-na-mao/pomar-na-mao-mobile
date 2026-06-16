## MODIFIED Requirements

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
