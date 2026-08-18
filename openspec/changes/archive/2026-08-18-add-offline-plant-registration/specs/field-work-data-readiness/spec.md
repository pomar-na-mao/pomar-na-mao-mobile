## ADDED Requirements

### Requirement: Plant registration readiness uses structural options only

The plant-registration card SHALL become ready when non-empty variety and zone options are available and SHALL NOT depend on a loaded plant snapshot.

#### Scenario: Varieties and zones are preloaded online

- **WHEN** the field-work screen has loaded at least one variety and one zone
- **THEN** the plant-registration card SHALL be enabled
- **AND** activating it SHALL reuse those preloaded options without repeating the Supabase option requests on route mount

#### Scenario: Persisted options are available offline

- **WHEN** the device is offline and persisted variety and zone collections are both non-empty
- **THEN** the plant-registration card SHALL remain enabled
- **AND** the registration form SHALL use the persisted options

#### Scenario: A required option collection is unavailable

- **WHEN** varieties or zones are missing, empty, or unresolved without a usable cache
- **THEN** the plant-registration card SHALL remain disabled
- **AND** it SHALL communicate loading or unavailable state consistently with the other field-work cards

