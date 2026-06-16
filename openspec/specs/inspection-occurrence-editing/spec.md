# inspection-occurrence-editing Specification

## Purpose

TBD - created by archiving change implement-inspection-routine. Update Purpose after archive.
## Requirements
### Requirement: Nearest plant details modal

The app SHALL provide a details modal for the current nearest plant.

#### Scenario: User opens nearest plant details

- **WHEN** a nearest plant exists for the active inspection
- **THEN** the modal SHALL show plant ID, zone, variety, distance, current occurrences, and inspection edit state

### Requirement: Occurrence edit actions

The nearest plant modal SHALL support only adding and removing occurrences, and SHALL validate remove actions against the effective offline occurrence state for the nearest plant.

#### Scenario: User submits occurrence edit

- **WHEN** the user submits an add or remove occurrence action
- **THEN** the app SHALL validate the selected occurrence type and save the edit as a local inspection change

#### Scenario: User selects occurrence action

- **WHEN** the nearest plant modal renders the action dropdown
- **THEN** the dropdown SHALL expose only `add_occurrence` and `remove_occurrence` actions

#### Scenario: Unsupported occurrence action is unavailable

- **WHEN** the nearest plant modal is used during inspection
- **THEN** the user SHALL NOT be able to select update or resolve occurrence actions

#### Scenario: User removes occurrence added offline

- **WHEN** the user adds an occurrence to the nearest plant during an active offline inspection and then submits a remove action for the same occurrence type before synchronizing
- **THEN** the app SHALL save the remove action as a local inspection change without requiring the occurrence to exist in the original loaded plant occurrence snapshot

#### Scenario: User removes occurrence from pending local state

- **WHEN** the user submits a remove action for an occurrence type represented by pending local changes on the nearest plant
- **THEN** the app SHALL use the locally projected occurrence state as the previous occurrence value for the new local change

#### Scenario: User removes occurrence that does not exist locally

- **WHEN** the user submits a remove action for an occurrence type that is absent from both the loaded occurrence snapshot and pending local changes for the nearest plant
- **THEN** the app SHALL show the existing validation message and SHALL NOT save a local inspection change

### Requirement: Edit location metadata

The app SHALL capture location metadata when saving an occurrence edit whenever current location is available.

#### Scenario: User edits with location available

- **WHEN** the user saves an occurrence edit and current GPS data is available
- **THEN** the local change SHALL include latitude, longitude, GPS accuracy when available, and distance to the plant when available

### Requirement: Changed plant state

The app SHALL mark a plant as changed after at least one local inspection change exists for it.

#### Scenario: Plant has local changes

- **WHEN** a plant receives a local inspection change
- **THEN** the map marker and loaded plant state SHALL reflect that the plant was changed

### Requirement: Only changed plants are prepared for sync

The app SHALL build changed plant arrays only from plants with `local_inspection_changes` rows.

#### Scenario: Sync payload is prepared

- **WHEN** the app creates a sync payload
- **THEN** unchanged loaded plants SHALL be excluded from `plantsChanged`

### Requirement: Occurrence edit modal remains keyboard accessible

The nearest plant occurrence edit modal SHALL keep its editable fields and
primary actions reachable when the on-screen keyboard is visible in deployed
mobile builds.

#### Scenario: Keyboard opens while editing occurrence details

- **WHEN** the user focuses the severity or notes input in the nearest plant
  occurrence modal
- **THEN** the modal SHALL avoid the keyboard using the same platform behavior as
  the spraying setup modal
- **AND** the user SHALL be able to scroll to the final editable fields
- **AND** the close and save actions SHALL remain reachable without dismissing
  the modal content accidentally

#### Scenario: User scrolls while editing occurrence details

- **WHEN** the user drags the nearest plant occurrence modal content while the
  keyboard is visible
- **THEN** the modal SHALL support drag-to-dismiss keyboard behavior
- **AND** taps on dropdown or action controls SHALL still be handled by the
  modal content

