## ADDED Requirements

### Requirement: Inspection map markers

The inspection map SHALL render markers from `local_inspection_loaded_plants`.

#### Scenario: Loaded plants exist for active inspection

- **WHEN** an inspection has loaded plants
- **THEN** the map SHALL render one marker for each loaded plant

### Requirement: Marker visual states

The inspection map SHALL visually distinguish common plants, nearest plant, changed plants, and changed-nearest plants.

#### Scenario: Plant marker state changes

- **WHEN** a plant becomes nearest, changed, or both
- **THEN** the marker SHALL update its visual state without duplicating the plant marker

### Requirement: Nearest plant detection

The app SHALL calculate the nearest loaded inspection plant from valid GPS updates.

#### Scenario: Device location updates

- **WHEN** the app receives a valid current location during an active inspection
- **THEN** it SHALL calculate the nearest loaded plant and store nearest plant ID, current coordinates, and distance in local inspection state

### Requirement: Nearest plant persistence

The app SHALL persist nearest-plant state in SQLite.

#### Scenario: New nearest plant is detected

- **WHEN** the nearest plant changes
- **THEN** the app SHALL clear `is_nearest` for other loaded plants in that inspection and set `is_nearest` and `distance_meters` for the detected plant

### Requirement: No nearest plant before loading

The app SHALL not show nearest-plant details before plants are loaded.

#### Scenario: User opens nearest action with no loaded plants

- **WHEN** no active inspection has loaded plants
- **THEN** the app SHALL show a clear message and SHALL NOT open an empty edit workflow

