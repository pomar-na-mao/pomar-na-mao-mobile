# annotation-local-state Specification

## Purpose
TBD - created by archiving change implement-annotation-feature. Update Purpose after archive.
## Requirements
### Requirement: Local annotation persistence

The app SHALL persist created annotation operations and annotation occurrence data locally before any Supabase synchronization is required.

#### Scenario: User saves a valid annotation

- **WHEN** the user saves a valid annotation from the annotation modal
- **THEN** the app SHALL persist a local field operation with `operation_type_code` equal to `occurrence_annotation`
- **AND** it SHALL persist a related local occurrence with occurrence type, annotation latitude/longitude, GPS accuracy, severity, notes, device id, null plant assignment, and pending sync status

### Requirement: Local annotation list state

The app SHALL load local annotation rows for the annotation screen and derive summary state from SQLite.

#### Scenario: Annotation screen loads

- **WHEN** the annotation screen initializes
- **THEN** the app SHALL load local annotation operation and occurrence rows from SQLite
- **AND** it SHALL derive total, pending, synced, and error counts from those rows

#### Scenario: User clears local annotations

- **WHEN** the user requests annotation cleanup
- **THEN** the app SHALL delete local occurrence annotation rows and their annotation field operation rows from SQLite
- **AND** it SHALL refresh the annotation list and summary to an empty visible state

### Requirement: Sync error preservation

The app SHALL preserve local annotation data when synchronization fails.

#### Scenario: Sync fails for annotation

- **WHEN** Supabase synchronization fails for a local annotation
- **THEN** the app SHALL keep the annotation locally with an error sync status and store the sync error message for retry

### Requirement: Remote id mapping

The app SHALL store remote identifiers after successful annotation synchronization and SHALL preserve a single remote field operation id for every local annotation operation.

#### Scenario: Sync succeeds for annotation

- **WHEN** Supabase synchronization succeeds for a local annotation
- **THEN** the app SHALL store the returned remote field operation and occurrence identifiers when available
- **AND** it SHALL mark the local records synced with a synced timestamp

#### Scenario: Another annotation reuses the same local operation

- **WHEN** a later synchronized annotation belongs to a local operation that already has a stored `remote_field_operation_id`
- **THEN** the app SHALL reuse that parent mapping as the expected remote operation identity
- **AND** it SHALL keep the existing parent mapping unchanged when the RPC returns the same remote field operation id

#### Scenario: Returned operation id diverges from the stored parent mapping

- **WHEN** a synchronized annotation returns a remote field operation id different from the one already stored for its local operation
- **THEN** the app SHALL keep the existing `remote_field_operation_id`
- **AND** it SHALL treat the synchronization as inconsistent instead of silently overwriting the parent mapping

