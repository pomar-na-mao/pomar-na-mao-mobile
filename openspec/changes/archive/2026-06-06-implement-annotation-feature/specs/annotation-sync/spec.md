## ADDED Requirements

### Requirement: Annotation sync RPC call

The app SHALL synchronize locally created annotations through a Supabase RPC boundary that creates or reconciles the remote `field_operations` and `plant_occurrences` records.

#### Scenario: Pending annotation is synchronized

- **WHEN** the user synchronizes a pending local annotation
- **THEN** the app SHALL call the configured Supabase annotation RPC with occurrence type, annotation coordinates, GPS accuracy, severity, notes, device id, and stable local id
- **AND** it SHALL omit local plant id so the RPC resolves the nearest plant from the annotation coordinates
- **AND** it SHALL not impose a maximum nearest-plant distance unless explicitly configured

### Requirement: Sync success handling

The app SHALL mark local annotation data as synced only after the RPC succeeds.

#### Scenario: RPC succeeds

- **WHEN** the annotation RPC returns success for a local annotation
- **THEN** the app SHALL update the local annotation records with remote identifiers when returned
- **AND** it SHALL set sync status to synced and refresh the annotation summary counts so synchronized rows no longer contribute to visible total, pending, or error counters

### Requirement: Sync failure handling

The app SHALL preserve pending annotation data when the RPC fails.

#### Scenario: RPC fails

- **WHEN** the annotation RPC returns an error or no successful result
- **THEN** the app SHALL keep the local annotation available for retry
- **AND** it SHALL store the error message and show the annotation in the error count
- **AND** it SHALL not show a successful synchronization message for annotations that failed

### Requirement: Database contract documentation

The implementation SHALL keep `database-and-features-organization.md` aligned with the actual Supabase annotation sync contract.

#### Scenario: RPC contract changes during implementation

- **WHEN** implementation creates or edits the Supabase annotation RPC
- **THEN** the change SHALL update `database-and-features-organization.md` with the RPC signature, payload fields, return shape, permissions, and sync behavior
