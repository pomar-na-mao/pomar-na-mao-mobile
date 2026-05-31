## ADDED Requirements

### Requirement: Supabase structural table models

The app SHALL define TypeScript models for the restructured Supabase tables described by the database organization document.

#### Scenario: Structural table models are available

- **WHEN** a developer imports the structural model module
- **THEN** models SHALL be available for `varieties`, `zones`, `plants`, `occurrence_types`, `operation_types`, `field_operations`, `field_operation_track_points`, `field_operation_routes`, `plant_operation_history`, `operation_inputs`, `plant_occurrences`, `inspection_targets`, and `inspection_routes`

### Requirement: Shared sync metadata models

The app SHALL define reusable sync metadata types for records that can exist locally before or after remote synchronization.

#### Scenario: Syncable structural records expose sync metadata

- **WHEN** a structural model represents a syncable remote or local record
- **THEN** the model SHALL include appropriate fields for local identity, device identity, sync status, synced timestamp, and sync error where applicable

### Requirement: Legacy feature behavior remains untouched

The structural model implementation SHALL NOT replace existing feature-specific models or change current feature imports.

#### Scenario: Existing feature modules still compile against legacy models

- **WHEN** the project is type-checked after adding structural models
- **THEN** existing inspection, annotation, spraying, routine, and map modules SHALL continue compiling without requiring behavior-level changes

### Requirement: Geography values are represented for app use

The app SHALL represent remote PostGIS fields in a way that mobile code and SQLite cache code can consume without requiring PostGIS locally.

#### Scenario: Local cache models avoid PostGIS-only types

- **WHEN** local or app-facing models represent zones, plants, routes, or point locations
- **THEN** they SHALL use latitude/longitude, GeoJSON text, or route JSON/text fields rather than requiring PostGIS geography types in SQLite
