## MODIFIED Requirements

### Requirement: Occurrence edit actions

The nearest plant modal SHALL support adding, updating, removing, resolving, and confirming occurrences, and SHALL validate non-add actions against the effective offline occurrence state for the nearest plant.

#### Scenario: User submits occurrence edit

- **WHEN** the user submits an occurrence edit action
- **THEN** the app SHALL validate the selected occurrence type and save the edit as a local inspection change

#### Scenario: User removes occurrence added offline

- **WHEN** the user adds an occurrence to the nearest plant during an active offline inspection and then submits a remove action for the same occurrence type before synchronizing
- **THEN** the app SHALL save the remove action as a local inspection change without requiring the occurrence to exist in the original loaded plant occurrence snapshot

#### Scenario: User updates occurrence from pending local state

- **WHEN** the user submits an update, remove, or resolve action for an occurrence type represented by pending local changes on the nearest plant
- **THEN** the app SHALL use the locally projected occurrence state as the previous occurrence value for the new local change

#### Scenario: User removes occurrence that does not exist locally

- **WHEN** the user submits a remove, update, or resolve action for an occurrence type that is absent from both the loaded occurrence snapshot and pending local changes for the nearest plant
- **THEN** the app SHALL show the existing validation message and SHALL NOT save a local inspection change
