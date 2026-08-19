# scalable-plant-map-rendering Specification

## Purpose
TBD - created by archiving change optimize-field-work-map-plants. Update Purpose after archive.
## Requirements
### Requirement: Plant visualization is viewport-aware

The app SHALL derive visible plant visualization from the current map viewport plus a bounded overscan area instead of mounting the complete loaded plant collection.

#### Scenario: Map opens with a large loaded collection

- **WHEN** inspection or spraying opens with plants inside and outside the initial viewport
- **THEN** the map SHALL select plants from the viewport and overscan area for visualization
- **AND** it SHALL NOT mount individual markers for the complete collection

#### Scenario: User completes a pan gesture

- **WHEN** the map reports a completed region change
- **THEN** the app SHALL update the selected visualization for the new viewport
- **AND** it SHALL preserve the user's camera position

### Requirement: Dense plants are clustered within a render budget

The app SHALL aggregate nearby plants according to viewport detail and SHALL keep the number of simultaneously mounted plant and cluster overlays within a centralized render budget.

#### Scenario: Broad viewport contains many plants

- **WHEN** the viewport contains more plants than the individual-marker budget
- **THEN** the app SHALL render count clusters for nearby plants
- **AND** the combined number of individual and cluster overlays SHALL remain within the configured budget

#### Scenario: User zooms into a cluster

- **WHEN** the user selects a cluster or zooms into its area
- **THEN** the app SHALL increase spatial detail and expose individual plants when density permits

### Requirement: Visualization preserves plant state semantics

The scalable visualization SHALL preserve individual marker identity and visual state when a plant is rendered individually and SHALL summarize relevant state when plants are clustered.

#### Scenario: Priority plant is individually visible

- **WHEN** a nearest, changed, candidate, confirmed, or manually affected plant is emitted as an individual marker
- **THEN** it SHALL retain the visual state defined by its feature
- **AND** its marker identity SHALL remain stable across unrelated viewport updates

#### Scenario: Mixed-state plants form a cluster

- **WHEN** a cluster contains common and feature-highlighted plants
- **THEN** the cluster SHALL expose its total count and highlighted-state presence without presenting every plant as an individual marker

### Requirement: Individual actions target only individual plants

The app SHALL invoke inspection or spraying plant actions only from an individually rendered plant marker.

#### Scenario: User presses an individual spraying plant

- **WHEN** the spraying workflow permits review and the user presses an individual plant marker
- **THEN** the app SHALL invoke the existing review action for that plant

#### Scenario: User presses a cluster

- **WHEN** the user presses a cluster marker
- **THEN** the app SHALL move toward a more detailed view of that cluster
- **AND** it SHALL NOT mutate any individual plant

### Requirement: Large-collection behavior is observable and testable

The visualization layer SHALL expose deterministic counts for source plants, viewport candidates, clusters, and individual markers in development and tests.

#### Scenario: Synthetic large collection is evaluated

- **WHEN** tests evaluate at least 5,000 plants across a representative viewport
- **THEN** the result SHALL remain within the configured overlay budget
- **AND** repeated evaluation with equal inputs SHALL produce stable marker and cluster identities

