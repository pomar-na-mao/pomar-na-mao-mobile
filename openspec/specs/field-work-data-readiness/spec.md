# field-work-data-readiness Specification

## Purpose
TBD - created by archiving change preload-field-work-options. Update Purpose after archive.
## Requirements
### Requirement: Field-work structural data is preloaded

The app SHALL request the structural zones, occurrence types, and varieties needed by field-work features when the field-work screen starts, before the user opens a feature route.

#### Scenario: Field-work screen starts online

- **WHEN** the field-work screen starts with usable internet connectivity
- **THEN** the app SHALL request zones, occurrence types, and varieties without waiting for a field-work card press
- **AND** it SHALL keep each card disabled until all resources required by that card resolve

### Requirement: Readiness is evaluated per card

The app SHALL enable each field-work card when every structural resource required by that feature has loaded successfully with at least one record. When offline, previously loaded in-memory resources SHALL remain eligible for readiness.

#### Scenario: All structural resources are available

- **WHEN** zones, occurrence types, and varieties each load at least one record
- **THEN** the app SHALL enable the inspection, annotation, and spraying cards

#### Scenario: Occurrence types are unavailable

- **WHEN** occurrence types fail to load or contain no records while zones remain available
- **THEN** the app SHALL disable inspection and annotation
- **AND** it SHALL keep spraying enabled

#### Scenario: Zones are unavailable

- **WHEN** zones fail to load or contain no records
- **THEN** the app SHALL disable inspection, annotation, and spraying

#### Scenario: Varieties are unavailable

- **WHEN** varieties fail to load or contain no records while zones and occurrence types remain available
- **THEN** the app SHALL disable inspection
- **AND** it SHALL keep annotation and spraying enabled

### Requirement: Non-ready cards communicate their state

The app SHALL prevent navigation from loading or unavailable cards and SHALL distinguish pending loading from an unavailable result.

#### Scenario: Required data is still loading

- **WHEN** any resource required by a card is unresolved
- **THEN** that card SHALL remain disabled
- **AND** it SHALL show a loading treatment instead of an unavailable indicator

#### Scenario: Required data cannot be used

- **WHEN** a required Supabase request fails, a required resource contains no records, or the device is offline without a required resource cached
- **THEN** every affected card SHALL remain disabled
- **AND** each affected card SHALL show a `cloud-off` unavailable icon with an accessible description
- **AND** pressing an affected card SHALL NOT navigate

#### Scenario: Cached data remains usable offline

- **WHEN** structural data exists in memory from an earlier successful request
- **AND** the device has no usable internet connection
- **THEN** each card with all required cached resources SHALL remain enabled
- **AND** each card missing any required cached resource SHALL remain disabled

### Requirement: Preloaded data is reused by feature routes

The app SHALL provide successfully preloaded structural data to inspection, annotation, and spraying without repeating the corresponding Supabase option requests when those routes mount.

#### Scenario: User opens a ready feature

- **WHEN** a card becomes ready and the user opens its route
- **THEN** the route SHALL initialize its option state from the shared preload
- **AND** route startup SHALL NOT repeat the Supabase request for those options

### Requirement: Structural options persist across app restarts

The app SHALL persist successfully loaded zones, occurrence types, and varieties and SHALL restore them before evaluating field-work readiness after a new app process starts.

#### Scenario: App restarts offline after a successful preload

- **WHEN** structural options were loaded successfully in an earlier app process
- **AND** the user restarts the app without usable internet connectivity
- **THEN** the app SHALL restore the persisted options
- **AND** it SHALL enable each card whose required persisted collections are non-empty
- **AND** it SHALL keep cards with missing or empty persisted dependencies disabled

#### Scenario: Loaded plants survive restart

- **WHEN** the user previously loaded plants for one or more zones and restarts the app
- **THEN** the app SHALL restore those snapshots from SQLite

### Requirement: Plant snapshots gate plant-dependent cards

The app SHALL enable inspection and spraying only when at least one non-empty zone plant snapshot is stored locally. Annotation SHALL remain independent of plant snapshots.

#### Scenario: No plants have been loaded

- **WHEN** no local zone contains loaded plants
- **THEN** inspection and spraying SHALL remain disabled
- **AND** annotation readiness SHALL depend only on its structural resources

### Requirement: Loaded-data card manages zone snapshots

The field-work screen SHALL show a loaded-data card instead of the weather card and SHALL allow an online user to load plants for a selected zone into SQLite.

#### Scenario: Loaded-data summary is displayed

- **WHEN** the field-work screen contains one or more loaded zone snapshots
- **THEN** the loaded-data card SHALL show each zone name and its plant count
- **AND** it SHALL explain that plants must be loaded for inspection and spraying
- **AND** this guidance SHALL appear in a visually distinct yellow informational banner
- **AND** the unframed download icon in the card header SHALL open the plant-loading modal
- **AND** the card SHALL retain a fixed height while the zone summary scrolls independently when it exceeds the available space

#### Scenario: User clears loaded plants

- **WHEN** the user confirms the trash action beside the load action
- **THEN** the app SHALL remove all locally cached plant snapshots
- **AND** SHALL refresh the summary and readiness of inspection and spraying
- **AND** SHALL NOT delete remote Supabase plant records
- **AND** the confirmation SHALL use the app theme and the same visual structure as the plant-loading modal

#### Scenario: User removes one loaded zone

- **WHEN** the user swipes a loaded-zone row from left to right and confirms removal
- **THEN** the app SHALL remove only that zone's locally cached plants
- **AND** SHALL preserve every other loaded zone
- **AND** SHALL refresh the zone summary and card readiness

### Requirement: Unavailable resources can recover

The app SHALL retry failed or empty structural resources when the online field-work screen is revisited while preserving successful resources.

#### Scenario: User returns after a transient failure

- **WHEN** a required resource was unavailable and the user revisits the field-work screen with usable internet connectivity
- **THEN** the app SHALL retry that resource
- **AND** it SHALL enable each affected card after all of its required resources return non-empty results

#### Scenario: Connection becomes available while the screen remains open

- **WHEN** the field-work screen is open without usable internet connectivity
- **AND** the device regains usable internet connectivity
- **THEN** the app SHALL request resources that were not loaded and retry failed or empty resources
- **AND** it SHALL update each card state without requiring the user to leave the screen or restart the app

