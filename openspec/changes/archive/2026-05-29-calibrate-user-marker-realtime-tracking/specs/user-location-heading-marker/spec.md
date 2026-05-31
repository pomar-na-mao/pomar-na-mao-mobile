## MODIFIED Requirements

### Requirement: Sensor-based device heading

The app SHALL select the user marker heading from the best available foreground source: GPS course heading while the user is walking with a valid movement heading, and `expo-sensors` device heading when movement heading is unavailable, unreliable, or the user is stationary.

#### Scenario: Walking heading is available

- **WHEN** the user is walking and the current location provides a valid heading
- **THEN** the app SHALL rotate the marker direction indicator to the movement heading so it points toward the user's forward path

#### Scenario: Sensor heading is available

- **WHEN** movement heading is unavailable or unreliable and `expo-sensors` provides valid device orientation or magnetometer updates
- **THEN** the app SHALL calculate a normalized heading in degrees and rotate the marker direction indicator to that heading

#### Scenario: Sensor heading is unavailable

- **WHEN** the sensor is unavailable, denied, invalid, or not yet initialized
- **THEN** the app SHALL fall back to the heading provided by the current location when that heading is valid

### Requirement: Heading stability

The user heading marker SHALL avoid visually noisy rotation from small sensor or GPS fluctuations while still responding quickly enough to feel aligned with walking direction.

#### Scenario: Heading updates jitter

- **WHEN** consecutive heading updates vary only by insignificant noise
- **THEN** the app SHALL keep the rendered direction stable instead of rotating on every minor reading

#### Scenario: Heading crosses north

- **WHEN** heading changes cross the `359` to `0` degree boundary
- **THEN** the app SHALL rotate through the shortest path without jumping around the circle

#### Scenario: User changes walking direction

- **WHEN** the user changes walking direction and new movement headings remain valid
- **THEN** the marker direction SHALL update promptly without staying visually offset to the side

## ADDED Requirements

### Requirement: Heading calibration correction

The app SHALL support a heading correction offset for `UserMarkerLocation` so visual pointer alignment can be calibrated without changing the marker layout.

#### Scenario: Correction offset is configured

- **WHEN** a heading correction offset is configured
- **THEN** the app SHALL apply the offset after selecting and normalizing the heading source and before rendering the marker pointer

#### Scenario: No correction offset is configured

- **WHEN** no heading correction offset is configured
- **THEN** the app SHALL render the selected heading without adding an implicit layout rotation

### Requirement: Real-time foreground marker movement

The inspection map SHALL update the visible user marker position with a foreground cadence that feels continuous while walking.

#### Scenario: Foreground location updates arrive

- **WHEN** the inspection map receives foreground location updates while the user is walking
- **THEN** the visible user marker SHALL move smoothly between recent coordinates instead of waiting for coarse one-second jumps

#### Scenario: Location update jumps unexpectedly

- **WHEN** a new location update is stale, invalid, or jumps too far for smooth interpolation
- **THEN** the visible user marker SHALL snap or reset safely rather than animating through misleading intermediate positions

### Requirement: Persistence remains throttled

The app SHALL keep visual marker responsiveness separate from nearest-plant persistence and SQLite writes.

#### Scenario: Frequent visual updates occur

- **WHEN** the user marker receives frequent foreground location updates
- **THEN** the app SHALL NOT persist nearest-plant state more often than the meaningful nearest-plant or distance-change rules allow
