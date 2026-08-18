# plant-registration-screen Specification

## Purpose
TBD - created by archiving change add-offline-plant-registration. Update Purpose after archive.
## Requirements
### Requirement: Field-work navigation exposes plant registration

The field-work screen SHALL show a plant-registration card that navigates to a dedicated `/plant-registration` route.

#### Scenario: User opens plant registration

- **WHEN** the plant-registration card is ready and the user activates it
- **THEN** the app SHALL navigate to `/plant-registration`
- **AND** the route SHALL show an in-screen header with a back action to field work

### Requirement: Registration route lists only locally registered plants

The registration route SHALL list plant records created through this device's registration workflow and SHALL NOT include ordinary downloaded plant-cache rows.

#### Scenario: No plant has been registered locally

- **WHEN** the route contains no local-registration rows
- **THEN** the app SHALL show an empty state explaining that plants saved on this device will appear there
- **AND** it SHALL show an action to add the first plant

#### Scenario: Registered plants exist

- **WHEN** one or more plants have been saved through the registration form
- **THEN** the app SHALL render one card per local registration
- **AND** each card SHALL identify its variety, zone, planting date, coordinates, and synchronization status

### Requirement: User opens a map-first registration modal

The route SHALL provide an Add Plant action that opens a modal containing current-position map context and the plant form.

#### Scenario: Device location becomes available

- **WHEN** the user opens the modal and foreground location permission is granted
- **THEN** the app SHALL center the map on the current device position
- **AND** it SHALL populate labeled latitude and longitude controls from that position
- **AND** those coordinate controls SHALL be disabled or read-only

#### Scenario: Location permission is denied

- **WHEN** foreground location permission is denied or a current position cannot be acquired
- **THEN** the modal SHALL explain why the coordinates are unavailable
- **AND** it SHALL keep Save disabled
- **AND** it SHALL provide retry or close navigation without creating a plant

### Requirement: Registration form collects and validates required plant data

The modal SHALL require a current latitude, current longitude, one variety, one zone, and a planting date before local save.

#### Scenario: User completes the form

- **WHEN** current coordinates are available and the user selects a variety, a zone, and a planting date
- **THEN** the Save action SHALL become available
- **AND** activating Save SHALL create the plant in SQLite before closing the modal

#### Scenario: Required data is missing

- **WHEN** the user attempts to save without any required field
- **THEN** the app SHALL NOT create a local plant
- **AND** it SHALL show an accessible validation message next to the invalid or unavailable field

### Requirement: Plant cards provide delete and synchronize actions

Each eligible card SHALL support a rightward swipe to reveal Delete and a leftward swipe to reveal Synchronize, and SHALL expose equivalent labeled controls that do not require a swipe gesture.

#### Scenario: User swipes a card to the right

- **WHEN** the user moves a registration card from left to right
- **THEN** the app SHALL reveal a destructive Delete action
- **AND** confirming it SHALL delete only the local SQLite registration
- **AND** it SHALL NOT delete a previously synchronized Supabase plant

#### Scenario: User swipes a pending card to the left

- **WHEN** the user moves a pending or error registration card from right to left
- **THEN** the app SHALL reveal a Synchronize action
- **AND** activating it SHALL attempt synchronization for that single plant

#### Scenario: User cannot perform a swipe gesture

- **WHEN** the user navigates by assistive technology, keyboard, or direct action controls
- **THEN** the same Delete and eligible Synchronize actions SHALL be available with descriptive accessible labels

### Requirement: Plant-registration UI communicates interaction state accessibly

All plant-registration controls SHALL use the existing theme, meet a minimum 44 by 44 point touch target, pair status colors with text or icons, and prevent duplicate actions while asynchronous work is running.

#### Scenario: A plant is synchronizing

- **WHEN** synchronization is in progress for a card
- **THEN** the card SHALL show a textual and visual in-progress state
- **AND** its synchronize controls SHALL remain disabled until the attempt completes

#### Scenario: Synchronization fails

- **WHEN** a synchronization attempt fails
- **THEN** the card SHALL show an error status and a concise retryable error message
- **AND** it SHALL keep Synchronize available for a later retry

#### Scenario: Synchronization succeeds

- **WHEN** a synchronization attempt succeeds
- **THEN** the card SHALL show a synchronized status
- **AND** it SHALL not offer another active Synchronize action for that row
