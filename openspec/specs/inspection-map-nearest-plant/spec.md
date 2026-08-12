# inspection-map-nearest-plant Specification

## Purpose
TBD - created by archiving change implement-inspection-routine. Update Purpose after archive.
## Requirements
### Requirement: Inspection map markers

The inspection map SHALL visualize plants from `local_inspection_loaded_plants` using viewport selection and zoom-dependent clustering, and SHALL render individual markers when viewport density permits.

#### Scenario: Loaded plants exist for active inspection

- **WHEN** an inspection has loaded plants
- **THEN** the map SHALL visualize plants relevant to the current viewport as individual markers or count clusters
- **AND** it SHALL keep mounted plant overlays within the shared render budget

#### Scenario: User zooms into inspection plants

- **WHEN** the viewport reaches sufficient detail for individual rendering
- **THEN** the map SHALL render the corresponding plants as individual markers

### Requirement: Marker visual states

The inspection map SHALL visually distinguish common plants, nearest plant, changed plants, and changed-nearest plants when individually rendered, SHALL summarize highlighted state in clusters, and SHALL update nearest marker state promptly when nearest-plant detection changes.

#### Scenario: Plant marker state changes

- **WHEN** a visible plant becomes nearest, changed, or both
- **THEN** its individual marker or containing cluster SHALL update its visual state without duplicating the plant

#### Scenario: Nearest plant is within the viewport

- **WHEN** nearest-plant detection identifies a plant within the viewport or overscan area
- **THEN** the visualization SHALL prioritize that plant as an individual nearest marker

### Requirement: Nearest plant detection

The app SHALL calculate the nearest loaded inspection plant from every valid foreground GPS update while an inspection has loaded plants.

#### Scenario: Device location updates

- **WHEN** the app receives a valid current location during an active inspection
- **THEN** it SHALL calculate the nearest loaded plant and update in-memory nearest plant ID, current coordinates, and distance for the inspection UI

#### Scenario: User walks from one plant toward another

- **WHEN** repeated valid location updates show a different loaded plant is clearly closer than the current nearest plant
- **THEN** the app SHALL switch the in-memory nearest plant promptly

#### Scenario: Two plants are nearly tied

- **WHEN** the current nearest plant and candidate nearest plant distances differ only within the configured near-tie margin
- **THEN** the app SHALL keep the current nearest plant to avoid visual flicker

### Requirement: Nearest plant persistence

The app SHALL persist nearest-plant state in SQLite without blocking immediate in-memory nearest-plant UI updates.

#### Scenario: New nearest plant is detected

- **WHEN** the nearest plant changes
- **THEN** the app SHALL update in-memory marker state immediately and SHALL asynchronously clear `is_nearest` for other loaded plants in that inspection and set `is_nearest` and `distance_meters` for the detected plant

#### Scenario: Frequent location updates do not materially change nearest state

- **WHEN** valid foreground location updates continue but nearest plant ID and meaningful distance have not changed
- **THEN** the app SHALL NOT write nearest-plant state to SQLite for every update

### Requirement: No nearest plant before loading

The app SHALL not show nearest-plant details before plants are loaded.

#### Scenario: User opens nearest action with no loaded plants

- **WHEN** no active inspection has loaded plants
- **THEN** the app SHALL show a clear message and SHALL NOT open an empty edit workflow

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

