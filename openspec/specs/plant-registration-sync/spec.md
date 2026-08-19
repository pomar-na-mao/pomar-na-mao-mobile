# plant-registration-sync Specification

## Purpose
TBD - created by archiving change add-offline-plant-registration. Update Purpose after archive.
## Requirements
### Requirement: Local plant fields map to the remote plants contract

The app SHALL synchronize a local registration through the configured plant-sync RPC using the `public.plants` contract documented in `database.md` item 5.

#### Scenario: Pending plant is sent for synchronization

- **WHEN** the user synchronizes a pending local plant
- **THEN** local latitude SHALL map to `plants.latitude`
- **AND** local longitude SHALL map to `plants.longitude`
- **AND** the selected variety id SHALL map to `plants.variety_id`
- **AND** the selected zone id SHALL map to `plants.zone_id`
- **AND** the selected planting date SHALL map to `plants.planting_date`
- **AND** local identity and device identity SHALL map to their corresponding remote columns
- **AND** the database SHALL generate remote `created_at`, `updated_at`, and `synced_at` when synchronization runs instead of copying local save timestamps
- **AND** `is_dead` and `non_existent` SHALL be false and `is_new` SHALL be true

### Requirement: Remote plant creation is idempotent

The database SHALL enforce one remote plant for each non-null `(device_id, local_id)` pair, and the plant-sync RPC SHALL reconcile retries against that identity.

#### Scenario: First synchronization succeeds

- **WHEN** no remote plant exists for the payload's device and local identities
- **THEN** the RPC SHALL create one `public.plants` row
- **AND** it SHALL return the created remote plant identity and timestamps
- **AND** remote `created_at` and `updated_at` SHALL represent the database synchronization time

#### Scenario: Request is retried after uncertain transport outcome

- **WHEN** a plant already exists for the same non-null `device_id` and `local_id`
- **THEN** the RPC SHALL return or reconcile that same plant
- **AND** it SHALL NOT create a duplicate row
- **AND** it SHALL preserve the remote `created_at` from the first successful synchronization

#### Scenario: Two synchronization requests race

- **WHEN** concurrent calls carry the same non-null `device_id` and `local_id`
- **THEN** the database uniqueness guarantee SHALL allow at most one remote plant for that identity

### Requirement: Plant sync validates structural references and required input

The RPC SHALL reject invalid coordinates, missing identity, missing required form values, and unknown variety or zone identifiers without creating a partial plant.

#### Scenario: Referenced option no longer exists

- **WHEN** the payload references a variety or zone that is absent from the remote database
- **THEN** the RPC SHALL return an error
- **AND** it SHALL NOT create a `plants` row
- **AND** the app SHALL preserve the local registration for retry or correction

### Requirement: Sync success reconciles local state

The app SHALL mark a registration synchronized only after receiving a complete successful RPC result.

#### Scenario: RPC returns success

- **WHEN** the RPC returns a remote plant id and synchronization timestamps
- **THEN** the app SHALL store the remote plant id and `synced_at`
- **AND** it SHALL replace local `created_at` and `updated_at` with the timestamps returned by the RPC
- **AND** it SHALL mark the local row `synced`
- **AND** it SHALL clear any previous sync error

### Requirement: Sync failure preserves local data

The app SHALL keep a registration retryable when the RPC fails and SHALL not report successful synchronization.

#### Scenario: RPC or network fails

- **WHEN** the plant-sync call throws, returns an error, or omits its required result
- **THEN** the app SHALL preserve the local plant and stable identities
- **AND** it SHALL persist an error sync state and message
- **AND** it SHALL NOT show the plant as synchronized

### Requirement: Plant sync follows least-privilege database access

The database migration SHALL explicitly configure the plant-sync RPC execution permissions and any required `plants` table grants/RLS policies for the actual mobile roles.

#### Scenario: Unauthorized role calls plant sync

- **WHEN** a role without the explicit plant-sync permission invokes the RPC
- **THEN** PostgreSQL SHALL reject the call

#### Scenario: Authorized mobile role calls plant sync

- **WHEN** the configured mobile role invokes the RPC with a valid payload
- **THEN** the call SHALL be evaluated under the documented security mode and validation rules
- **AND** it SHALL have no permission to mutate unrelated tables through this RPC

### Requirement: Database documentation matches the implemented sync contract

The implementation SHALL update `database.md` items 18, 20, 22, 24, and 25 and SHALL check item 5 against the final plant column mapping.

#### Scenario: Plant sync database changes are implemented

- **WHEN** the migration adds or edits the plant RPC, uniqueness, policy, or grant contract
- **THEN** item 18 SHALL document the complete RPC and payload/return mapping
- **AND** item 20 SHALL document the SQLite and offline-first registration flow
- **AND** item 22 SHALL summarize collected and synchronized plant data
- **AND** item 24 SHALL include teardown for the new function before dependent objects
- **AND** item 25 SHALL include the complete current creation, index, RLS, and permission SQL
- **AND** item 5 SHALL remain aligned with all written `public.plants` columns and defaults
