# spraying-background-tracking Specification

## Purpose
TBD - created by archiving change implement-detailed-spraying-workflow. Update Purpose after archive.
## Requirements
### Requirement: Tracking requires foreground and background location permission

The app SHALL verify the platform location permissions required for durable foreground and background spraying capture before starting an operation.

#### Scenario: Required permissions are granted

- **WHEN** the user starts a configured operation and grants the required permissions
- **THEN** the app SHALL start the registered spraying location task
- **AND** it SHALL mark the local operation as `tracking`

#### Scenario: A required permission is denied

- **WHEN** foreground or background location permission is denied
- **THEN** the app SHALL NOT start tracking
- **AND** it SHALL show an actionable permission error without losing the draft

### Requirement: Every accepted GPS point is durable

The location task SHALL persist each accepted point to SQLite with operation local ID, timestamp, coordinates, speed, accuracy, device ID, and pending sync status before relying on UI state.

#### Scenario: Location update arrives while the screen is closed

- **WHEN** the registered background task receives a valid location for an active spraying operation
- **THEN** it SHALL insert the point into `local_spraying_track_points`
- **AND** reopening `/spraying` SHALL reconstruct the route from persisted points

#### Scenario: Location update is unusable

- **WHEN** a location is stale, invalid, or exceeds the configured accuracy threshold
- **THEN** the task SHALL reject it from the route
- **AND** it SHALL NOT corrupt the active operation

### Requirement: Live route derives from persisted track data

The spraying map SHALL render the current route from chronologically ordered persisted points and SHALL update while accepted points arrive.

#### Scenario: New persisted point is observed

- **WHEN** tracking is active and a new accepted point is stored
- **THEN** the map SHALL extend the displayed polyline in recorded-time order

### Requirement: Tracking recovers safely after interruption

The app SHALL detect an unfinished local spraying operation and reconcile its state with the registered background location task.

#### Scenario: App restarts during tracking

- **WHEN** the app starts and finds an operation marked `tracking`
- **THEN** it SHALL restore that operation and its persisted route
- **AND** it SHALL indicate whether background capture remains active or requires recovery

#### Scenario: User finishes tracking

- **WHEN** the user confirms finish
- **THEN** the app SHALL stop the spraying task
- **AND** it SHALL persist the finish time before route consolidation

