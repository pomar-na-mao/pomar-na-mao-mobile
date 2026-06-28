## ADDED Requirements

### Requirement: Annotation uses preloaded structural options

The annotation route SHALL initialize its zone and occurrence-type options from the field-work preload and SHALL NOT repeat those Supabase option requests when the route mounts.

#### Scenario: User opens annotation from a ready card

- **WHEN** the annotation card is ready and the user navigates to `/annotation`
- **THEN** the annotation provider SHALL expose the preloaded zones and occurrence types
- **AND** route startup SHALL NOT request those structural options again
