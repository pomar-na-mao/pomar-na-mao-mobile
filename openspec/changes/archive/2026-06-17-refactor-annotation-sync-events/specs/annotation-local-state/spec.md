## MODIFIED Requirements

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
