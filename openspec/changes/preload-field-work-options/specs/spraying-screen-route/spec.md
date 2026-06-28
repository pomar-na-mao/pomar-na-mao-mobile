## ADDED Requirements

### Requirement: Spraying uses preloaded zones

The spraying route SHALL initialize its zone options from the field-work preload and SHALL NOT repeat the Supabase zone request when the route mounts.

#### Scenario: User opens spraying from a ready card

- **WHEN** the spraying card is ready and the user navigates to `/spraying`
- **THEN** the spraying provider SHALL expose the preloaded zones
- **AND** route startup SHALL NOT request zones again

#### Scenario: User selects a preloaded zone

- **WHEN** the user selects a preloaded spraying zone and requests its plants
- **THEN** the spraying workflow SHALL continue to load the active plants for that zone
