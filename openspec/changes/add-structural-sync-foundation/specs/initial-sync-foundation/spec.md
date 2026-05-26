## ADDED Requirements

### Requirement: Initial sync SQLite tables

The app SHALL initialize the local SQLite tables required by item 20.1 for initial offline cache data.

#### Scenario: Initial sync cache tables are created

- **WHEN** SQLite initialization runs
- **THEN** it SHALL create `local_varieties`, `local_occurrence_types`, `local_operation_types`, `local_zones`, `local_plants`, `local_plant_occurrences`, `local_field_operations`, `local_inspection_targets`, and `sync_queue` if they do not already exist

### Requirement: Initial sync indexes

The app SHALL create indexes needed for common offline reads from the initial sync cache.

#### Scenario: Offline lookup indexes are created

- **WHEN** SQLite initialization runs
- **THEN** it SHALL create indexes for plant zone, plant variety, plant latitude/longitude, occurrence plant, occurrence type, occurrence status, field operation type, field operation start date, inspection target operation, and inspection target plant lookups

### Requirement: Initial sync local model definitions

The app SHALL define TypeScript models for rows stored in the item 20.1 local SQLite tables.

#### Scenario: Local cache row models are available

- **WHEN** a future sync repository imports the initial sync model module
- **THEN** local row models SHALL be available for all item 20.1 cache tables and `sync_queue`

### Requirement: Sync queue foundation

The app SHALL provide a structural foundation for queued local mutations without implementing feature-specific synchronization flows.

#### Scenario: Queue records can represent pending mutations

- **WHEN** a future feature creates a queued mutation
- **THEN** the queue model SHALL support entity name, entity local ID, action, serialized payload, status, attempts, last error, and timestamps

### Requirement: No automatic feature synchronization

The initial sync foundation SHALL NOT automatically download, upload, or mutate Supabase data as part of this change.

#### Scenario: App starts after the structural foundation is added

- **WHEN** the app initializes SQLite
- **THEN** it SHALL only ensure local structural tables exist and SHALL NOT trigger new Supabase network calls or alter current feature workflows
