## MODIFIED Requirements

### Requirement: User review is authoritative

The map review UI SHALL distinguish affected plants from unaffected plants through individual markers or cluster summaries and SHALL let the user add or remove individual plants by tapping individually rendered map markers before synchronization.

#### Scenario: User removes an automatic candidate

- **WHEN** an affected `auto_matched` plant is individually rendered and the user taps it to mark it as not treated
- **THEN** it SHALL be excluded from confirmed plants
- **AND** the override SHALL persist across screen reloads and repeated simulation

#### Scenario: User manually adds a plant

- **WHEN** a non-candidate zone plant is individually rendered and the user taps it as treated
- **THEN** it SHALL be stored as confirmed with `match_source = 'manual_added'`

#### Scenario: Dense spraying plants are clustered

- **WHEN** the current viewport contains more spraying plants than the render budget
- **THEN** the map SHALL cluster nearby plants and indicate clusters containing affected plants
- **AND** pressing a cluster SHALL zoom toward its plants without changing review state

#### Scenario: User confirms review

- **WHEN** the user accepts the reviewed selection
- **THEN** the operation SHALL become `reviewed`
- **AND** only the confirmed plant set SHALL be eligible for synchronization
