## ADDED Requirements

### Requirement: Field-work structural data is preloaded

The app SHALL request the structural zones, occurrence types, and varieties needed by field-work features when the field-work screen starts, before the user opens a feature route.

#### Scenario: Field-work screen starts online

- **WHEN** the field-work screen starts with usable internet connectivity
- **THEN** the app SHALL request zones, occurrence types, and varieties without waiting for a field-work card press
- **AND** it SHALL keep each card disabled until all resources required by that card resolve

### Requirement: Readiness is evaluated per card

The app SHALL enable each field-work card only when the device is online and every structural resource required by that feature has loaded successfully with at least one record.

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

- **WHEN** the device is offline, a required Supabase request fails, or a required resource contains no records
- **THEN** every affected card SHALL remain disabled
- **AND** each affected card SHALL show a `cloud-off` unavailable icon with an accessible description
- **AND** pressing an affected card SHALL NOT navigate

### Requirement: Preloaded data is reused by feature routes

The app SHALL provide successfully preloaded structural data to inspection, annotation, and spraying without repeating the corresponding Supabase option requests when those routes mount.

#### Scenario: User opens a ready feature

- **WHEN** a card becomes ready and the user opens its route
- **THEN** the route SHALL initialize its option state from the shared preload
- **AND** route startup SHALL NOT repeat the Supabase request for those options

#### Scenario: Feature loads selected plants

- **WHEN** the user applies an inspection filter or selects a spraying zone after route startup
- **THEN** the feature SHALL still request and persist the matching plant data according to its existing workflow

### Requirement: Unavailable resources can recover

The app SHALL retry failed or empty structural resources when the online field-work screen is revisited while preserving successful resources.

#### Scenario: User returns after a transient failure

- **WHEN** a required resource was unavailable and the user revisits the field-work screen with usable internet connectivity
- **THEN** the app SHALL retry that resource
- **AND** it SHALL enable each affected card after all of its required resources return non-empty results
