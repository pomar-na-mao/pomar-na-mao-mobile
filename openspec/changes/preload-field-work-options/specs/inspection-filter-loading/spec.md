## MODIFIED Requirements

### Requirement: Inspection filter options

The app SHALL preload zone, occurrence type, and variety options on the field-work screen and SHALL provide the preloaded options to the inspection filter without another option request when the inspection route mounts.

#### Scenario: Filter modal opens after preload

- **WHEN** the user opens the inspection filter modal from a ready inspection route
- **THEN** the app SHALL make the preloaded zones, occurrence types, and varieties available for selection or display
- **AND** it SHALL NOT repeat the Supabase structural-option request on inspection route startup
