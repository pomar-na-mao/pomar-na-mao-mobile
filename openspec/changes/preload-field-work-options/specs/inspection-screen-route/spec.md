## MODIFIED Requirements

### Requirement: Field work navigation excludes retired routes

The field-work navigation SHALL keep the inspection, annotation, and spraying entries visible, SHALL gate navigation by each feature's structural-data readiness, and SHALL NOT expose the retired add-plant entrypoint.

#### Scenario: Developer reviews active field-work routes

- **WHEN** `src/app/field-works.tsx` is inspected after implementation
- **THEN** it SHALL include `/inspection`, `/annotation`, and `/spraying`
- **AND** it SHALL NOT include `/add-plant`

#### Scenario: User selects a ready field-work card

- **WHEN** a field-work card has all of its required structural data and the user presses it
- **THEN** the app SHALL navigate to that card's active route

#### Scenario: User selects a non-ready field-work card

- **WHEN** a field-work card is loading or unavailable and the user presses it
- **THEN** the app SHALL remain on the field-work screen
