## ADDED Requirements

### Requirement: Reviewed spraying synchronization uses one RPC boundary

The mobile app SHALL synchronize a reviewed spraying operation through `sync_reviewed_spraying_operation` or its verified replacement rather than issuing independent client writes to related Supabase tables.

#### Scenario: Reviewed operation is synchronized

- **WHEN** the user synchronizes a reviewed operation while online
- **THEN** the RPC payload SHALL include the operation, ordered track points, consolidated route, inputs, confirmed plants, stable local IDs, and device ID

### Requirement: Spraying synchronization is transactional and idempotent

The RPC SHALL atomically upsert the field operation and its reviewed child records, and repeated calls with the same operation `local_id` and `device_id` SHALL return the same remote operation without duplicating history.

#### Scenario: All payload data is valid

- **WHEN** the RPC processes a valid reviewed payload
- **THEN** it SHALL commit `field_operations`, `field_operation_track_points`, `field_operation_routes`, `operation_inputs`, and confirmed `plant_operation_history` rows together
- **AND** it SHALL return remote identifiers and synchronized counts

#### Scenario: A child record is invalid

- **WHEN** any required child record fails validation or persistence
- **THEN** the RPC SHALL roll back the complete synchronization
- **AND** no partial spraying operation SHALL remain committed

#### Scenario: The same payload is retried

- **WHEN** a previously successful operation is submitted again with the same stable identity
- **THEN** the RPC SHALL NOT duplicate track points, inputs, routes, or plant history

### Requirement: Server persistence preserves reviewed plants

The synchronization RPC SHALL persist exactly the confirmed plant set supplied by the reviewed local operation and SHALL NOT replace it with an automatic server recalculation.

#### Scenario: Reviewed set contains manual overrides

- **WHEN** confirmed plants include a manual addition or exclude an automatic candidate
- **THEN** `plant_operation_history` SHALL reflect those reviewed decisions and their `match_source`

### Requirement: Local sync state changes only after RPC outcome

The app SHALL mark the local operation and children synced only after a successful RPC response and SHALL preserve all local data with retryable error details after failure.

#### Scenario: RPC succeeds

- **WHEN** the RPC returns success
- **THEN** the app SHALL store returned remote identifiers, synchronized timestamps, and `synced` status in one local transaction
- **AND** it SHALL clear the active spraying cycle from the UI while keeping the selected zone plants loaded for a new operation

#### Scenario: RPC fails or connectivity is lost

- **WHEN** the RPC fails before success is confirmed
- **THEN** the app SHALL retain the reviewed operation and child rows
- **AND** it SHALL record `sync_error` without clearing the confirmed selection

### Requirement: Supabase contract is secured and documented

The implemented RPC, grants, policies, migration details, and payload/response shape SHALL be verified against the deployed Supabase project and documented in `database.md` item 20.4 and the documentation target required by `openspec/config.yaml`.

#### Scenario: Database implementation changes

- **WHEN** implementation adds or edits a function, grant, policy, or permission
- **THEN** a project migration SHALL capture the final SQL
- **AND** the relevant documentation SHALL describe the actual deployed contract and security model
