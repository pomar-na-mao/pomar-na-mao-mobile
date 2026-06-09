# inspection-local-state Specification

## Purpose

TBD - created by archiving change implement-inspection-routine. Update Purpose after archive.

## Requirements

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

The app SHALL persist filtered inspection plants locally for offline map usage and SHALL keep their occurrence JSON updated with pending local add/remove occurrence edits.

#### Scenario: User loads inspection plants

- **WHEN** filtered plants are loaded for an inspection
- **THEN** each grouped plant SHALL be saved to `local_inspection_loaded_plants` with coordinates, filter metadata, occurrences JSON, nearest state, distance, and timestamps

#### Scenario: Add or remove occurrence change is saved

- **WHEN** the user saves an add or remove occurrence change for a loaded inspection plant
- **THEN** `local_inspection_loaded_plants.occurrences_json` for that plant SHALL be updated to reflect the effective local occurrence state after the change

#### Scenario: Local inspection state is restored

- **WHEN** the app restores a pending inspection from SQLite after occurrence changes were saved offline
- **THEN** the restored loaded plants SHALL include occurrence state projected from the saved local changes

### Requirement: Changes persisted locally

The app SHALL persist add and remove occurrence edits locally and count distinct changed plants without requiring network validation.

#### Scenario: User edits a plant occurrence

- **WHEN** the user adds or removes an occurrence
- **THEN** the app SHALL save a `local_inspection_changes` row and update the parent inspection's changed plant count

#### Scenario: User removes pending occurrence offline

- **WHEN** the user removes an occurrence that was added earlier in the same offline inspection
- **THEN** the app SHALL save a `local_inspection_changes` row for the remove action and SHALL keep the parent inspection available for local finish and later synchronization

#### Scenario: Unsupported local action is not created

- **WHEN** the user edits occurrences through the inspection UI
- **THEN** the app SHALL NOT create new `local_inspection_changes` rows with `update_occurrence` or `resolve_occurrence`

### Requirement: Finish inspection locally

The app SHALL finalize an inspection without requiring network access.

#### Scenario: User finishes inspection

- **WHEN** the user finalizes the active inspection
- **THEN** the app SHALL set inspection status to `finished`, set `finished_at`, keep sync status pending, and display it in the local inspection list
