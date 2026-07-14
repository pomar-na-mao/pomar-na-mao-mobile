## ADDED Requirements

### Requirement: Spraying uses preloaded zones

The spraying route SHALL initialize its zone options from the field-work preload and SHALL NOT repeat the Supabase zone request when the route mounts.

#### Scenario: User opens spraying from a ready card

- **WHEN** the spraying card is ready and the user navigates to `/spraying`
- **THEN** the spraying provider SHALL expose the preloaded zones
- **AND** route startup SHALL NOT request zones again

#### Scenario: User selects a loaded zone

- **WHEN** the user selects a zone whose plants were loaded from the field-work screen
- **THEN** the spraying workflow SHALL read that zone's plants from shared SQLite storage
- **AND** it SHALL NOT request plants from Supabase
