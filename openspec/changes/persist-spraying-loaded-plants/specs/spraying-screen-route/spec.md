## ADDED Requirements

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
