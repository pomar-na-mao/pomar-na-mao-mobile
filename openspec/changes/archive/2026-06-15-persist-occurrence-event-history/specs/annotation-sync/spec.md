## MODIFIED Requirements

### Requirement: Annotation sync RPC call

The app SHALL synchronize locally created annotations through a Supabase RPC boundary that atomically creates or reconciles the remote `field_operations`, `plant_occurrences`, and `plant_occurrence_events` records.

#### Scenario: Pending annotation is synchronized

- **WHEN** the user synchronizes a pending local annotation
- **THEN** the app SHALL call the configured Supabase annotation RPC with occurrence type, annotation coordinates, GPS accuracy, severity, notes, device id, and stable local id
- **AND** it SHALL omit local plant id so the RPC resolves the nearest plant from the annotation coordinates
- **AND** it SHALL not impose a maximum nearest-plant distance unless explicitly configured
- **AND** the RPC SHALL create an `added` event linked to the annotation operation and occurrence

#### Scenario: Annotation event cannot be persisted

- **WHEN** the annotation RPC cannot create its occurrence event
- **THEN** it SHALL roll back the field operation and occurrence creation

### Requirement: Database contract documentation

The implementation SHALL keep `database.md` aligned with the actual Supabase annotation sync and occurrence event contracts.

#### Scenario: RPC contract changes during implementation

- **WHEN** implementation creates or edits the Supabase annotation RPC
- **THEN** the change SHALL update `database.md` with the table contract, RPC signature, payload fields, return shape, permissions, event behavior, and complete current SQL definition
