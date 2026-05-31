# inspection-map-nearest-plant Specification

## Purpose
TBD - created by archiving change implement-inspection-routine. Update Purpose after archive.
## Requirements
### Requirement: Inspection map markers

The inspection map SHALL render markers from `local_inspection_loaded_plants`.

#### Scenario: Loaded plants exist for active inspection

- **WHEN** an inspection has loaded plants
- **THEN** the map SHALL render one marker for each loaded plant

### Requirement: Marker visual states

The inspection map SHALL visually distinguish common plants, nearest plant, changed plants, and changed-nearest plants, and SHALL update nearest marker state promptly when nearest-plant detection changes.

#### Scenario: Plant marker state changes

- **WHEN** a plant becomes nearest, changed, or both
- **THEN** the marker SHALL update its visual state without duplicating the plant marker

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
