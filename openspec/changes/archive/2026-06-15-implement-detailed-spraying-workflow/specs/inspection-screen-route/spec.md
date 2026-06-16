## MODIFIED Requirements

### Requirement: Field work navigation excludes retired routes

The field-work navigation SHALL keep inspection and annotation available, SHALL expose spraying as an active field-work entrypoint, and SHALL NOT expose the retired add-plant entrypoint.

#### Scenario: Developer reviews active field-work routes

- **WHEN** `src/app/field-works.tsx` is inspected after implementation
- **THEN** it SHALL include `/inspection`, `/annotation`, and `/spraying`
- **AND** it SHALL NOT include `/add-plant`
