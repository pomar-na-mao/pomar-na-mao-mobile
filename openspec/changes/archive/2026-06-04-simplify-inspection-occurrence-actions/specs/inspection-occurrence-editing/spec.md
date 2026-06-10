## MODIFIED Requirements

### Requirement: Occurrence edit actions

The nearest plant modal SHALL support only adding and removing occurrences.

#### Scenario: User submits occurrence edit

- **WHEN** the user submits an add or remove occurrence action
- **THEN** the app SHALL validate the selected occurrence type and save the edit as a local inspection change

#### Scenario: User selects occurrence action

- **WHEN** the nearest plant modal renders the action dropdown
- **THEN** the dropdown SHALL expose only `add_occurrence` and `remove_occurrence` actions

#### Scenario: Unsupported occurrence action is unavailable

- **WHEN** the nearest plant modal is used during inspection
- **THEN** the user SHALL NOT be able to select update or resolve occurrence actions
