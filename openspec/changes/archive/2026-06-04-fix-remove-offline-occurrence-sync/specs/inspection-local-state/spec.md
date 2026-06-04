## MODIFIED Requirements

### Requirement: Loaded plants persisted locally

The app SHALL persist filtered inspection plants locally for offline map usage and SHALL keep their occurrence JSON updated with pending local occurrence edits.

#### Scenario: User loads inspection plants

- **WHEN** filtered plants are loaded for an inspection
- **THEN** each grouped plant SHALL be saved to `local_inspection_loaded_plants` with coordinates, filter metadata, occurrences JSON, nearest state, distance, and timestamps

#### Scenario: Local occurrence change is saved

- **WHEN** the user saves an add, update, remove, or resolve occurrence change for a loaded inspection plant
- **THEN** `local_inspection_loaded_plants.occurrences_json` for that plant SHALL be updated to reflect the effective local occurrence status after the change

#### Scenario: Local inspection state is restored

- **WHEN** the app restores a pending inspection from SQLite after occurrence changes were saved offline
- **THEN** the restored loaded plants SHALL include occurrence state projected from the saved local changes

### Requirement: Changes persisted locally

The app SHALL persist occurrence edits locally and count distinct changed plants without requiring network validation.

#### Scenario: User edits a plant occurrence

- **WHEN** the user adds, updates, removes, resolves, or confirms an occurrence
- **THEN** the app SHALL save a `local_inspection_changes` row and update the parent inspection's changed plant count

#### Scenario: User removes pending occurrence offline

- **WHEN** the user removes an occurrence that was added or updated earlier in the same offline inspection
- **THEN** the app SHALL save a `local_inspection_changes` row for the remove action and SHALL keep the parent inspection available for local finish and later synchronization
