# inspection-screen-route Specification

## Purpose
TBD - created by archiving change implement-inspection-routine. Update Purpose after archive.
## Requirements
### Requirement: Inspection route hosts inspection

The `/inspection` route SHALL render the inspection feature instead of the legacy routine workflow.

#### Scenario: User opens inspection route

- **WHEN** the user navigates to `/inspection`
- **THEN** the app SHALL show the inspection screen with an empty map, current location state, filter action, nearest-plant details action, and local inspections list

### Requirement: Routine route is removed or retired

The app SHALL remove or retire the legacy `/routine` entrypoint so inspection is not implemented under the old route.

#### Scenario: Developer inspects route files

- **WHEN** the route files are inspected after implementation
- **THEN** `src/app/inspection.tsx` SHALL be the inspection entrypoint and `src/app/routine.tsx` SHALL NOT remain as the active inspection route

### Requirement: Routine implementation is renamed

The app SHALL rename, remove, or replace obsolete routine modules, classes, hooks, functions, and components so the active implementation uses inspection-oriented names.

#### Scenario: Developer reviews active inspection imports

- **WHEN** `src/app/inspection.tsx` is inspected after implementation
- **THEN** it SHALL import inspection-oriented UI/provider modules rather than legacy routine map modules

### Requirement: Local inspection list

The inspection screen SHALL show inspections saved locally with their filter summary, counts, lifecycle status, and sync status.

#### Scenario: Local inspections exist

- **WHEN** the inspection screen loads and local inspections exist in SQLite
- **THEN** the screen SHALL list them with started date, optional finished date, zone name, occurrence name, loaded plant count, changed plant count, status, and sync status

### Requirement: Empty initial map

The inspection screen SHALL NOT automatically load plants before the user applies a filter.

#### Scenario: User enters inspection screen

- **WHEN** no inspection filter has been applied
- **THEN** the map SHALL show no plant markers from inspection data

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

### Requirement: Field-work screen exposes loaded data

The field-work screen SHALL expose a loaded-data card for plant snapshot management and SHALL NOT render the weather card.

#### Scenario: User opens the field-work screen

- **WHEN** the field-work screen renders
- **THEN** it SHALL show the loaded-data card
- **AND** it SHALL NOT show the weather card

