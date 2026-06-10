## ADDED Requirements

### Requirement: Annotation route hosts annotation workflow

The `/annotation` route SHALL render the active annotation feature with a map-first field-work screen.

#### Scenario: User opens annotation route

- **WHEN** the user navigates to `/annotation`
- **THEN** the app SHALL show an annotation screen with a map background, current location state, annotation summary, and bottom actions for selecting annotation data, finalizing, synchronizing, and clearing local annotations

### Requirement: Annotation data modal

The annotation screen SHALL let the user open a modal to select and confirm annotation data before saving a local annotation.

#### Scenario: User opens annotation modal

- **WHEN** the user taps the annotation data action
- **THEN** the app SHALL show a modal with occurrence type selection, current GPS position details, optional severity, optional notes, and save/cancel actions

#### Scenario: Required data is missing

- **WHEN** the user attempts to save without a required occurrence type or annotation location
- **THEN** the app SHALL block the save and show validation state without creating a local annotation

### Requirement: Annotation summary

The annotation screen SHALL summarize the local annotation work performed in the current annotation flow.

#### Scenario: Local annotations exist

- **WHEN** one or more annotations have been saved locally
- **THEN** the screen SHALL show total unsynced annotations and sync state counts for pending and error annotations

#### Scenario: Local annotations are fully synchronized

- **WHEN** all local annotations have been synchronized successfully
- **THEN** the screen SHALL reset the visible total, pending, and error counters to zero

### Requirement: Annotation lifecycle actions

The annotation screen SHALL expose finalize and synchronize actions for the current local annotation flow.

#### Scenario: User finalizes annotation work

- **WHEN** the user taps finalize after saving local annotations
- **THEN** the app SHALL mark the local annotation operation as finished and keep unsynced annotations available for synchronization

#### Scenario: User syncs annotations

- **WHEN** the user taps synchronize with pending annotations
- **THEN** the app SHALL attempt to synchronize pending annotations and update the summary from local sync results

#### Scenario: User clears annotations

- **WHEN** the user taps the clear annotations action
- **THEN** the app SHALL remove local annotation rows and refresh the visible summary
