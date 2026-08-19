## ADDED Requirements

### Requirement: Valid plant registration is persisted locally first

The app SHALL persist a valid registration to SQLite before any Supabase request and SHALL keep the row available across app restarts.

#### Scenario: User saves a valid plant while offline

- **WHEN** the device is offline and the user saves valid coordinates, variety, zone, and planting date
- **THEN** the app SHALL insert a `local_plants` row marked as a local registration
- **AND** the new row SHALL appear in the registration list without requiring network access

### Requirement: Local registration identity and defaults are generated automatically

The app SHALL generate a stable `local_id`, a durable app-installation `device_id`, and one save timestamp without asking the user for those values.

#### Scenario: Local row is created

- **WHEN** a valid plant is committed to SQLite
- **THEN** its local primary identity and `local_id` SHALL use the generated local UUID
- **AND** `created_at` and `updated_at` SHALL equal the ISO timestamp of that save
- **AND** `is_dead` and `non_existent` SHALL be false
- **AND** `is_new` SHALL be true
- **AND** `sync_status` SHALL be `pending_create`
- **AND** optional fields not supplied by the form SHALL remain null or use their defined defaults

#### Scenario: App restarts before synchronization

- **WHEN** a pending registration is reloaded in a later app process
- **THEN** its `local_id` and `device_id` SHALL remain unchanged
- **AND** it SHALL remain available for synchronization

### Requirement: Local and remote plant identities remain distinct

The app SHALL retain the local SQLite identity after synchronization and SHALL store the returned Supabase plant UUID in a separate remote-id field.

#### Scenario: Pending plant synchronizes successfully

- **WHEN** Supabase returns the remote plant id
- **THEN** the app SHALL store it as the local row's remote plant mapping
- **AND** it SHALL NOT replace the stable SQLite primary identity or `local_id`

### Requirement: Registration rows are distinguishable from remote cache rows

The local plant schema SHALL record whether a row originated from local registration or remote cache loading.

#### Scenario: Remote plants are already cached

- **WHEN** the registration route loads while downloaded remote plant rows exist in `local_plants`
- **THEN** it SHALL exclude those remote-cache rows from the registration list
- **AND** it SHALL preserve every pending local-registration row during cache refresh

### Requirement: Local delete has local-only scope

Deleting a registration card SHALL remove the corresponding local-registration row and SHALL NOT issue a Supabase delete.

#### Scenario: User deletes a pending registration

- **WHEN** the user confirms Delete for a pending registration
- **THEN** the app SHALL remove that row from SQLite and the visible list
- **AND** no Supabase mutation SHALL occur

#### Scenario: User deletes a synchronized registration card

- **WHEN** the user confirms Delete for a synchronized registration
- **THEN** the app SHALL remove only its local registration row
- **AND** the mapped remote plant SHALL remain in `public.plants`

### Requirement: Synchronization state is recoverable

The app SHALL persist synchronization state and error information so an interrupted or failed attempt remains retryable.

#### Scenario: Synchronization begins

- **WHEN** a pending or error row starts synchronization
- **THEN** the app SHALL mark that row as `syncing` before the remote request

#### Scenario: Synchronization fails

- **WHEN** the remote request returns an error or incomplete result
- **THEN** the app SHALL retain the plant fields and identities
- **AND** it SHALL persist `sync_status = 'error'` and a safe error message

#### Scenario: App restarts after an interrupted attempt

- **WHEN** startup finds a local registration left in `syncing`
- **THEN** the app SHALL normalize it to a retryable state without changing its identities or creating another local row

