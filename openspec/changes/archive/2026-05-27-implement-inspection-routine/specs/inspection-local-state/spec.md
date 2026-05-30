## ADDED Requirements

### Requirement: Inspection SQLite tables

The app SHALL initialize local SQLite tables for inspections, loaded inspection plants, and inspection changes.

#### Scenario: SQLite initialization runs

- **WHEN** the app initializes SQLite
- **THEN** it SHALL create `local_inspections`, `local_inspection_loaded_plants`, and `local_inspection_changes` if they do not already exist

### Requirement: Inspection SQLite indexes

The app SHALL initialize indexes needed for local inspection reads and sync operations.

#### Scenario: SQLite initialization runs for inspection

- **WHEN** the app initializes SQLite
- **THEN** it SHALL create indexes for inspection status, inspection sync status, loaded plants by inspection, loaded plants by plant, changes by inspection, changes by plant, and changes by sync status

### Requirement: Loaded plants persisted locally

The app SHALL persist filtered inspection plants locally for offline map usage.

#### Scenario: User loads inspection plants

- **WHEN** filtered plants are loaded for an inspection
- **THEN** each grouped plant SHALL be saved to `local_inspection_loaded_plants` with coordinates, filter metadata, occurrences JSON, nearest state, distance, and timestamps

### Requirement: Changes persisted locally

The app SHALL persist occurrence edits locally and count distinct changed plants.

#### Scenario: User edits a plant occurrence

- **WHEN** the user adds, updates, removes, resolves, or confirms an occurrence
- **THEN** the app SHALL save a `local_inspection_changes` row and update the parent inspection's changed plant count

### Requirement: Finish inspection locally

The app SHALL finalize an inspection without requiring network access.

#### Scenario: User finishes inspection

- **WHEN** the user finalizes the active inspection
- **THEN** the app SHALL set inspection status to `finished`, set `finished_at`, keep sync status pending, and display it in the local inspection list

