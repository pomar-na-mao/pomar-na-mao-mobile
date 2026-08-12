## MODIFIED Requirements

### Requirement: Annotation route hosts annotation workflow

The `/annotation` route SHALL render the active annotation feature with a map-first field-work screen, and it SHALL expose an in-screen header with the same back-button pattern used by `/spraying`.

#### Scenario: User opens annotation route

- **WHEN** the user navigates to `/annotation`
- **THEN** the app SHALL show a standardized in-screen header with a back action to the field-work screen
- **AND** it SHALL show an annotation screen with a map background, current location state, annotation summary, and bottom actions for selecting annotation data, finalizing, synchronizing, and clearing local annotations
