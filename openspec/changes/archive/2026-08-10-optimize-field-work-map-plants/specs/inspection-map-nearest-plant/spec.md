## MODIFIED Requirements

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
