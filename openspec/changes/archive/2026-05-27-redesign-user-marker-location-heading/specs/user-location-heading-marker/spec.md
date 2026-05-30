## ADDED Requirements

### Requirement: Marker-centered user heading visual

The app SHALL render the user's current map position as a single marker that includes both the visible user circle and the direction indicator.

#### Scenario: Heading is available

- **WHEN** the map has a valid user coordinate and a valid heading
- **THEN** the app SHALL render a user circle and an attached direction indicator whose origin is visually aligned with the circle center

#### Scenario: Heading is unavailable

- **WHEN** the map has a valid user coordinate but no valid heading
- **THEN** the app SHALL render the user circle without a detached cone, arrow, or placeholder direction indicator

### Requirement: Direction indicator attachment

The direction indicator SHALL touch or overlap the user circle so it appears to come from the user's marker rather than from a separate map overlay.

#### Scenario: User marker is visible

- **WHEN** the user marker is rendered with a heading indicator
- **THEN** the direction indicator SHALL remain visually attached to the circle at all heading angles

#### Scenario: Map zoom changes

- **WHEN** the user zooms the map in or out
- **THEN** the direction indicator SHALL remain attached to the marker circle without requiring a geographic polygon offset

### Requirement: Sensor-based device heading

The app SHALL use `expo-sensors` as the primary source for device-facing heading when a supported sensor is available and permitted.

#### Scenario: Sensor heading is available

- **WHEN** `expo-sensors` provides valid device orientation or magnetometer updates
- **THEN** the app SHALL calculate a normalized heading in degrees and rotate the marker direction indicator to that heading

#### Scenario: Sensor heading is unavailable

- **WHEN** the sensor is unavailable, denied, invalid, or not yet initialized
- **THEN** the app SHALL fall back to the heading provided by the current location when that heading is valid

### Requirement: Heading stability

The user heading marker SHALL avoid visually noisy rotation from small sensor fluctuations.

#### Scenario: Heading updates jitter

- **WHEN** consecutive heading updates vary only by insignificant noise
- **THEN** the app SHALL keep the rendered direction stable instead of rotating on every minor reading

#### Scenario: Heading crosses north

- **WHEN** heading changes cross the `359` to `0` degree boundary
- **THEN** the app SHALL rotate through the shortest path without jumping around the circle

### Requirement: Sensor subscription lifecycle

The app SHALL manage sensor subscriptions only while the user heading marker needs them.

#### Scenario: Marker mounts

- **WHEN** `UserMarkerLocation` mounts on a platform with supported sensors
- **THEN** the app SHALL check sensor availability and subscribe to heading updates if allowed

#### Scenario: Marker unmounts

- **WHEN** `UserMarkerLocation` unmounts
- **THEN** the app SHALL remove active sensor subscriptions

### Requirement: Plant-scale position circle

The user position circle SHALL remain visually comparable to plant markers while the direction cue may extend beyond the circle.

#### Scenario: User and plant markers are rendered together

- **WHEN** the inspection map shows loaded plants and the user marker
- **THEN** the user circle SHALL not appear significantly larger than plant markers, while the attached direction cue SHALL identify facing direction
