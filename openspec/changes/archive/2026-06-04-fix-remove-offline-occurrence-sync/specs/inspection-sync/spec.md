## MODIFIED Requirements

### Requirement: Inspection sync payload

The app SHALL build the `SyncInspectionPayload` described in item 20.2.16, preserving chronological local occurrence changes including remove actions.

#### Scenario: Payload is built

- **WHEN** a finished inspection has local changes
- **THEN** the payload SHALL include local inspection ID, optional filter IDs, start/end timestamps, device ID, and changed plants with their change rows

#### Scenario: Payload includes offline add then remove

- **WHEN** a finished inspection contains an add occurrence change followed by a remove occurrence change for the same plant and occurrence type
- **THEN** the payload SHALL include both change rows in chronological order with their previous and new values

### Requirement: Successful sync state

The app SHALL mark local inspection data as synced only after RPC success and SHALL update local loaded plant occurrence state to match the synced occurrence statuses.

#### Scenario: RPC succeeds

- **WHEN** `sync_manual_inspection` returns success with a remote field operation ID
- **THEN** the app SHALL set inspection sync status to `synced`, save the remote field operation ID, set `synced_at`, and mark related changes as synced

#### Scenario: Remove action sync succeeds

- **WHEN** `sync_manual_inspection` succeeds for an inspection containing remove occurrence changes
- **THEN** the local loaded plant occurrence state SHALL no longer expose the removed occurrence as open

#### Scenario: New inspection starts after sync

- **WHEN** the active inspection is synchronized successfully and the app starts a new local inspection from the synced loaded plants
- **THEN** the new inspection SHALL inherit the synced local occurrence statuses rather than the stale pre-sync occurrence snapshot
