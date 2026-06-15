## ADDED Requirements

### Requirement: DEV single-point location override

In development builds, the inspection map SHALL allow one selected map coordinate to replace the device location as the effective user location for the user marker and nearest-plant detection.

#### Scenario: Developer selects a simulated location

- **WHEN** the developer enables point selection and selects a coordinate on the inspection map
- **THEN** the app SHALL render one simulated point marker at that coordinate
- **AND** the app SHALL immediately use that coordinate as the effective user location
- **AND** the app SHALL evaluate the nearest loaded inspection plant from that coordinate

#### Scenario: Developer replaces the simulated location

- **WHEN** a simulated point already exists and the developer selects another coordinate
- **THEN** the app SHALL replace the existing point instead of creating an additional point
- **AND** the app SHALL immediately update the effective user location and nearest-plant detection

#### Scenario: Device location updates while a simulated point exists

- **WHEN** the foreground location watcher emits a device location while the DEV simulated point is active
- **THEN** the app SHALL retain the simulated point as the effective user location
- **AND** the app SHALL retain the latest device location for later restoration

#### Scenario: Developer deletes the simulated location

- **WHEN** the developer deletes the active simulated point
- **THEN** the app SHALL remove the simulated point marker
- **AND** the app SHALL immediately restore the latest retained device location as the effective user location
- **AND** subsequent device location updates SHALL drive nearest-plant detection normally

#### Scenario: Production build renders the inspection map

- **WHEN** the inspection map runs outside a development build
- **THEN** the app SHALL NOT render or activate the simulated location controls
