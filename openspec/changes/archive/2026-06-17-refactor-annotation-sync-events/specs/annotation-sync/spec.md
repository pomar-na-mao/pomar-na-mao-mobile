## MODIFIED Requirements

### Requirement: Annotation sync RPC call

The app SHALL synchronize locally created annotations through a Supabase RPC boundary that atomically creates or reconciles the remote `field_operations`, `plant_occurrences`, and `plant_occurrence_events` records while preserving the local operation grouping used in SQLite.

#### Scenario: Pending annotation is synchronized

- **WHEN** the user synchronizes a pending local annotation
- **THEN** the app SHALL call the configured Supabase annotation RPC with occurrence type, annotation coordinates, GPS accuracy, severity, notes, device id, a stable local annotation id, and a stable local operation id
- **AND** it SHALL omit local plant id so the RPC resolves the nearest plant from the annotation coordinates
- **AND** it SHALL not impose a maximum nearest-plant distance unless explicitly configured
- **AND** the RPC SHALL create an `added` event linked to the reconciled remote operation and occurrence

#### Scenario: Multiple annotations share one local operation

- **WHEN** two or more pending local annotations belong to the same local annotation operation and are synchronized in separate RPC calls
- **THEN** each RPC call SHALL reconcile the same remote `field_operation` using the stable local operation id
- **AND** each annotation SHALL keep its own idempotent occurrence and event identity using the stable local annotation id

#### Scenario: Annotation event cannot be persisted

- **WHEN** the annotation RPC cannot create its occurrence event
- **THEN** it SHALL roll back the field operation and occurrence creation or update performed in that call

### Requirement: Sync success handling

The app SHALL mark local annotation data as synced only after the RPC succeeds and SHALL preserve one stable remote field operation identity for all local annotations that share the same local operation.

#### Scenario: RPC succeeds for the first annotation in an operation

- **WHEN** the annotation RPC returns success for a local annotation whose parent local operation does not yet have a remote field operation id
- **THEN** the app SHALL update the local annotation records with remote identifiers when returned
- **AND** it SHALL store the returned remote field operation id on the parent local operation
- **AND** it SHALL set sync status to synced and refresh the annotation summary counts so synchronized rows no longer contribute to visible total, pending, or error counters

#### Scenario: RPC succeeds for another annotation in the same operation

- **WHEN** the annotation RPC returns success for a local annotation whose parent local operation already has a remote field operation id
- **THEN** the app SHALL require the returned remote field operation id to match the id already stored locally
- **AND** it SHALL not silently replace the existing parent operation mapping with a different remote id

### Requirement: Database contract documentation

The implementation SHALL keep `database.md` aligned with the actual Supabase annotation sync and occurrence event contracts.

#### Scenario: RPC contract changes during implementation

- **WHEN** implementation creates or edits the Supabase annotation RPC
- **THEN** the change SHALL update `database.md` with the table contract, RPC signature, payload fields, operation and annotation identity mapping, return shape, permissions, event behavior, and complete current SQL definition
