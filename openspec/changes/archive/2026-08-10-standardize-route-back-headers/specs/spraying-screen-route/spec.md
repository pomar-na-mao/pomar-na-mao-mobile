## MODIFIED Requirements

### Requirement: Spraying route hosts the detailed workflow

The `/spraying` route SHALL render a new map-first spraying feature with operation summary, current location, route state, loaded plants, and lifecycle actions, and it SHALL define the standardized in-screen header pattern used by the field-work routes.

#### Scenario: User opens spraying

- **WHEN** the user navigates to `/spraying`
- **THEN** the app SHALL show a standardized in-screen header with a back action consistent with the route's current state
- **AND** it SHALL show the spraying map or spraying list according to the active spraying view
- **AND** it SHALL provide actions to configure, start, finish, simulate, review, and synchronize as allowed by the current lifecycle state
