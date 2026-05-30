# inspection-sync Specification

## Purpose
TBD - created by archiving change implement-inspection-routine. Update Purpose after archive.
## Requirements
### Requirement: Swipeable sync action

The local inspection list SHALL expose a Swipeable action to synchronize finished pending inspections.

#### Scenario: User swipes a finished pending inspection

- **WHEN** the user triggers the sync action
- **THEN** the app SHALL load the inspection and its local changes and start synchronization

### Requirement: Inspection sync payload

The app SHALL build the `SyncInspectionPayload` described in item 20.2.16.

#### Scenario: Payload is built

- **WHEN** a finished inspection has local changes
- **THEN** the payload SHALL include local inspection ID, optional filter IDs, start/end timestamps, device ID, and changed plants with their change rows

### Requirement: Sync RPC call

The app SHALL call `sync_manual_inspection` with the inspection payload.

#### Scenario: Sync starts

- **WHEN** the app has a valid inspection sync payload
- **THEN** it SHALL call the Supabase RPC `sync_manual_inspection`

### Requirement: Successful sync state

The app SHALL mark local inspection data as synced only after RPC success.

#### Scenario: RPC succeeds

- **WHEN** `sync_manual_inspection` returns success with a remote field operation ID
- **THEN** the app SHALL set inspection sync status to `synced`, save the remote field operation ID, set `synced_at`, and mark related changes as synced

### Requirement: Failed sync state

The app SHALL preserve pending local data when synchronization fails.

#### Scenario: RPC fails

- **WHEN** `sync_manual_inspection` fails
- **THEN** the app SHALL keep local changes available, set inspection sync status to error, and store the error message

