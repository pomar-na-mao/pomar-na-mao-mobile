## ADDED Requirements

### Requirement: Occurrence edit modal remains keyboard accessible

The nearest plant occurrence edit modal SHALL keep its editable fields and
primary actions reachable when the on-screen keyboard is visible in deployed
mobile builds.

#### Scenario: Keyboard opens while editing occurrence details

- **WHEN** the user focuses the severity or notes input in the nearest plant
  occurrence modal
- **THEN** the modal SHALL avoid the keyboard using the same platform behavior as
  the spraying setup modal
- **AND** the user SHALL be able to scroll to the final editable fields
- **AND** the close and save actions SHALL remain reachable without dismissing
  the modal content accidentally

#### Scenario: User scrolls while editing occurrence details

- **WHEN** the user drags the nearest plant occurrence modal content while the
  keyboard is visible
- **THEN** the modal SHALL support drag-to-dismiss keyboard behavior
- **AND** taps on dropdown or action controls SHALL still be handled by the
  modal content
