## MODIFIED Requirements

### Requirement: Inspection route hosts inspection

The `/inspection` route SHALL render the inspection feature instead of the legacy routine workflow, and it SHALL expose an in-screen header with the same back-button pattern used by `/spraying`.

#### Scenario: User opens inspection route

- **WHEN** the user navigates to `/inspection`
- **THEN** the app SHALL show a standardized in-screen header with a back action to the field-work screen
- **AND** it SHALL show the inspection screen with an empty map, current location state, filter action, nearest-plant details action, and local inspections list
