# inspection-filter-loading Specification

## Purpose
TBD - created by archiving change implement-inspection-routine. Update Purpose after archive.
## Requirements
### Requirement: Inspection filter options

The app SHALL preload zone, occurrence type, and variety options on the field-work screen and SHALL provide the preloaded options to the inspection filter without another option request when the inspection route mounts.

#### Scenario: Filter modal opens after preload

- **WHEN** the user opens the inspection filter modal from a ready inspection route
- **THEN** the app SHALL make the preloaded zones, occurrence types, and varieties available for selection or display
- **AND** it SHALL NOT repeat the Supabase structural-option request on inspection route startup

### Requirement: Filter combinations

The inspection filter SHALL support filtering by zone only, occurrence only, and zone plus occurrence.

#### Scenario: User applies supported filter

- **WHEN** the user applies a zone-only, occurrence-only, or zone-and-occurrence filter
- **THEN** the app SHALL request inspection plants using the selected filter values

### Requirement: Empty filter handling

The app SHALL block an empty filter unless the implementation explicitly marks full-orchard inspection as allowed.

#### Scenario: User applies no filter

- **WHEN** the user tries to apply the filter with no zone and no occurrence selected
- **THEN** the app SHALL show a validation message and SHALL NOT request all inspection plants by default

### Requirement: Filtered plant grouping

The app SHALL group `get_inspection_plants` rows by plant before storing or rendering them.

#### Scenario: RPC returns multiple rows for one plant

- **WHEN** multiple returned rows share the same `plant_id`
- **THEN** the app SHALL store and render one plant with an occurrences array containing the open occurrence rows

### Requirement: Local inspection creation after filter

The app SHALL create a local inspection when filtered plants are successfully loaded.

#### Scenario: Filtered plants load successfully

- **WHEN** the app receives filtered inspection plants
- **THEN** it SHALL create a `local_inspections` row and persist matching `local_inspection_loaded_plants` rows

### Requirement: Inspection filters cached plants

The inspection workflow SHALL use only shared SQLite plant snapshots and SHALL NOT request plants remotely when selecting a zone.

#### Scenario: User loads plants for inspection

- **WHEN** the user selects a loaded zone
- **THEN** the modal SHALL NOT show an occurrence field
- **AND** the app SHALL load every cached plant from that zone
- **AND** SHALL start inspection only when the local result is non-empty

