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

The nearest plant modal SHALL support adding, updating, removing, resolving, and confirming occurrences.

#### Scenario: User submits occurrence edit

- **WHEN** the user submits an occurrence edit action
- **THEN** the app SHALL validate the selected occurrence type and save the edit as a local inspection change

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

