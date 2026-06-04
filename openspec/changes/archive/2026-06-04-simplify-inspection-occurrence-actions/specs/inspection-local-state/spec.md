## MODIFIED Requirements

### Requirement: Changes persisted locally

The app SHALL persist add and remove occurrence edits locally and count distinct changed plants.

#### Scenario: User edits a plant occurrence

- **WHEN** the user adds or removes an occurrence
- **THEN** the app SHALL save a `local_inspection_changes` row and update the parent inspection's changed plant count

#### Scenario: Unsupported local action is not created

- **WHEN** the user edits occurrences through the inspection UI
- **THEN** the app SHALL NOT create new `local_inspection_changes` rows with `update_occurrence` or `resolve_occurrence`

### Requirement: Loaded plants persisted locally

The app SHALL persist filtered inspection plants locally for offline map usage.

#### Scenario: User loads inspection plants

- **WHEN** filtered plants are loaded for an inspection
- **THEN** each grouped plant SHALL be saved to `local_inspection_loaded_plants` with coordinates, filter metadata, occurrences JSON, nearest state, distance, and timestamps

#### Scenario: Add or remove occurrence change is saved

- **WHEN** the user saves an add or remove occurrence change for a loaded inspection plant
- **THEN** `local_inspection_loaded_plants.occurrences_json` for that plant SHALL be updated to reflect the effective local occurrence state after the change
