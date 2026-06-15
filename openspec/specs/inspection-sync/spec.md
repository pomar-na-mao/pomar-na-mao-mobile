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

The app SHALL build the `SyncInspectionPayload` described in item 20.2.16 using only add and remove occurrence change types for inspection edits.

#### Scenario: Payload is built

- **WHEN** a finished inspection has local changes
- **THEN** the payload SHALL include local inspection ID, optional filter IDs, start/end timestamps, device ID, and changed plants with their add/remove change rows

#### Scenario: Payload includes offline add then remove

- **WHEN** a finished inspection contains an add occurrence change followed by a remove occurrence change for the same plant and occurrence type
- **THEN** the payload SHALL include both change rows in chronological order with their previous and new values

#### Scenario: Payload excludes unsupported occurrence actions

- **WHEN** the app builds a sync payload from inspection changes created by the current UI
- **THEN** the payload SHALL NOT contain `update_occurrence` or `resolve_occurrence` change types

### Requirement: Sync RPC call

The app SHALL call `sync_manual_inspection` with the inspection payload, and the RPC SHALL persist an append-only event for every occurrence change it successfully applies.

#### Scenario: Sync starts

- **WHEN** the app has a valid inspection sync payload
- **THEN** it SHALL call the Supabase RPC `sync_manual_inspection`

#### Scenario: Add action creates an occurrence

- **WHEN** the payload contains `add_occurrence` and no matching open occurrence exists
- **THEN** the RPC SHALL create the occurrence and an `added` event linked to the inspection operation

#### Scenario: Add action updates an existing occurrence

- **WHEN** the payload contains `add_occurrence` and a matching open occurrence exists
- **THEN** the RPC SHALL update the occurrence without replacing its creation operation
- **AND** it SHALL create an `updated` event linked to the inspection operation

#### Scenario: Remove action sync starts

- **WHEN** the payload contains a `remove_occurrence` change for an existing open occurrence
- **THEN** the RPC SHALL close that occurrence without replacing its creation operation
- **AND** it SHALL create a `removed` event linked to the inspection operation

#### Scenario: Offline add then remove is synchronized

- **WHEN** the payload contains an add followed by a remove for the same plant and occurrence type
- **THEN** the RPC SHALL process both rows chronologically
- **AND** it SHALL persist both events with their stable local change IDs

### Requirement: Successful sync state

The app SHALL mark local inspection data as synced only after RPC success and SHALL keep local loaded plant occurrence state aligned with the synced add/remove occurrence statuses.

#### Scenario: RPC succeeds

- **WHEN** `sync_manual_inspection` returns success with a remote field operation ID
- **THEN** the app SHALL set inspection sync status to `synced`, save the remote field operation ID, set `synced_at`, and mark related changes as synced

#### Scenario: Remove action sync succeeds

- **WHEN** `sync_manual_inspection` succeeds for an inspection containing remove occurrence changes
- **THEN** the local loaded plant occurrence state SHALL no longer expose the removed occurrence as open

#### Scenario: New inspection starts after sync

- **WHEN** the active inspection is synchronized successfully and the app starts a new local inspection from the synced loaded plants
- **THEN** the new inspection SHALL inherit the synced local occurrence statuses rather than the stale pre-sync occurrence snapshot

### Requirement: Failed sync state

The app SHALL preserve pending local data when synchronization fails.

#### Scenario: RPC fails

- **WHEN** `sync_manual_inspection` fails
- **THEN** the app SHALL keep local changes available, set inspection sync status to error, and store the error message

