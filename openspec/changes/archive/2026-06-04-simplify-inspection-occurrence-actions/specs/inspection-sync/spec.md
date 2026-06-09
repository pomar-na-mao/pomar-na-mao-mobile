## MODIFIED Requirements

### Requirement: Inspection sync payload

The app SHALL build the `SyncInspectionPayload` described in item 20.2.16 using only add and remove occurrence change types for inspection edits.

#### Scenario: Payload is built

- **WHEN** a finished inspection has local changes
- **THEN** the payload SHALL include local inspection ID, optional filter IDs, start/end timestamps, device ID, and changed plants with their add/remove change rows

#### Scenario: Payload excludes unsupported occurrence actions

- **WHEN** the app builds a sync payload from inspection changes created by the current UI
- **THEN** the payload SHALL NOT contain `update_occurrence` or `resolve_occurrence` change types

### Requirement: Sync RPC call

The app SHALL call `sync_manual_inspection` with the inspection payload.

#### Scenario: Sync starts

- **WHEN** the app has a valid inspection sync payload
- **THEN** it SHALL call the Supabase RPC `sync_manual_inspection`

#### Scenario: Remove action sync starts

- **WHEN** the payload contains a `remove_occurrence` change
- **THEN** the app SHALL pass that remove action through to `sync_manual_inspection` as the occurrence-closing action for the plant
