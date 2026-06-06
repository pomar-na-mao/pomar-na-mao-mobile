## MODIFIED Requirements

### Requirement: Field work navigation excludes retired routes

The field-work navigation SHALL keep the inspection entrypoint available, SHALL expose annotation as an active field-work entrypoint, and SHALL NOT expose retired add-plant or spraying entrypoints.

#### Scenario: Developer reviews active field-work routes

- **WHEN** `src/app/field-works.tsx` is inspected after implementation
- **THEN** it SHALL include the inspection route if field-work navigation remains
- **AND** it SHALL include the `/annotation` route
- **AND** it SHALL NOT include `/add-plant` or `/spraying`
