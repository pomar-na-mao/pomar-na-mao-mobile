## MODIFIED Requirements

### Requirement: Inspection filter options

The app SHALL preload zone, occurrence type, and variety options on the field-work screen and SHALL provide the preloaded options to the inspection filter without another option request when the inspection route mounts.

#### Scenario: Filter modal opens after preload

- **WHEN** the user opens the inspection filter modal from a ready inspection route
- **THEN** the app SHALL make the preloaded zones, occurrence types, and varieties available for selection or display
- **AND** it SHALL NOT repeat the Supabase structural-option request on inspection route startup

### Requirement: Inspection filters cached plants

The inspection workflow SHALL use only shared SQLite plant snapshots and SHALL NOT request plants remotely when selecting a zone.

#### Scenario: User loads plants for inspection

- **WHEN** the user selects a loaded zone
- **THEN** the modal SHALL NOT show an occurrence field
- **AND** the app SHALL load every cached plant from that zone
- **AND** SHALL start inspection only when the local result is non-empty
