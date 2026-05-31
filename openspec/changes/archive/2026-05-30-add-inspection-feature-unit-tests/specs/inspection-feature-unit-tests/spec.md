## ADDED Requirements

### Requirement: Inspection helper files have deterministic unit coverage
The inspection test suite SHALL cover every runtime helper file under `src/ui/inspection/helpers` with deterministic unit tests.

#### Scenario: Nearest plant logic is tested
- **WHEN** nearest plant helper tests run with multiple plant positions, current nearest candidates, and last persisted nearest state
- **THEN** they SHALL verify nearest selection, tie-margin retention, and persistence-threshold behavior

#### Scenario: Simulation route logic is tested
- **WHEN** simulation route helper tests run with complete and incomplete point selections
- **THEN** they SHALL verify empty-route behavior, route interpolation, endpoint preservation, and generated simulation location metadata

#### Scenario: Formatter and device helper logic is tested
- **WHEN** formatter and device helper tests run with missing values and available Expo Constants identifiers
- **THEN** they SHALL verify fallback labels, Brazilian date-time formatting, and device id fallback order

### Requirement: Inspection data layer files have isolated unit coverage
The inspection test suite SHALL cover repository, Supabase service, and SQLite service behavior without calling a real Supabase project or real device database.

#### Scenario: Repository normalization is tested
- **WHEN** repository tests receive duplicated plant rows with occurrence data and rows without occurrences
- **THEN** they SHALL verify grouped plants, de-duplicated occurrences, default flags, normalized filter options, and single-result sync response handling

#### Scenario: Supabase service calls are tested
- **WHEN** Supabase service tests call filter loading, plant loading, and manual sync methods
- **THEN** they SHALL verify the expected table names, selected columns, ordering, RPC names, and RPC payload parameters

#### Scenario: SQLite service state transitions are tested
- **WHEN** SQLite service tests exercise inspection creation, nearest plant updates, occurrence changes, finish, sync status updates, and sync payload building
- **THEN** they SHALL verify the intended SQL calls, transaction usage, row mapping, JSON parsing, changed plant counts, and generated payload shape

### Requirement: Inspection provider/view-model behavior is covered through public context
The inspection test suite SHALL cover `InspectionProvider` and `useInspection` behavior through a test consumer that uses the public context API.

#### Scenario: Provider initial load is tested
- **WHEN** the provider mounts with mocked local cache, pending inspection state, filter repository responses, and Expo Location permission/current position responses
- **THEN** it SHALL refresh inspection list state, restore active inspection state, load filter options, request foreground location permission, and expose the initial region

#### Scenario: Provider field workflows are tested
- **WHEN** tests call public context actions for filters, location updates, occurrence changes, finishing, and syncing
- **THEN** they SHALL verify local service calls, repository calls, nearest plant state, alert/loading side effects, modal state changes, and offline-first sync status handling

#### Scenario: Provider validation paths are tested
- **WHEN** public context actions are called with missing filters, no nearest plant, no active inspection, empty sync payload, denied location permission, or repository errors
- **THEN** they SHALL surface the same alert messages and avoid invalid persistence calls

### Requirement: Inspection UI components have React Native Testing Library coverage
The inspection test suite SHALL cover every runtime component under `src/ui/inspection/components` using React Native Testing Library.

#### Scenario: Screen and list components are tested
- **WHEN** screen and list component tests render active, empty, pending, syncing, synced, and error inspection states
- **THEN** they SHALL verify visible labels, counters, action buttons, and sync/finish callbacks

#### Scenario: Modal components are tested
- **WHEN** filter and nearest plant modal tests render open and closed states and simulate form interactions
- **THEN** they SHALL verify option rendering, submit/cancel callbacks, occurrence action validation, severity/notes input behavior, and selected plant details

#### Scenario: Map and simulation components are tested
- **WHEN** map and nearest-plant simulation component tests render with location, loaded plants, nearest plant, and callback props
- **THEN** they SHALL verify marker/polyline rendering through mocks, nearest plant action callbacks, simulation point selection, simulation start/stop behavior, and location update callbacks

### Requirement: Inspection feature coverage is validated by project commands
The completed change SHALL be validated through the project's existing test, TypeScript, and focused lint commands.

#### Scenario: Test suite validates inspection coverage
- **WHEN** `npm test` runs after the inspection tests are added
- **THEN** all inspection feature tests and existing smoke tests SHALL pass without a simulator, device, Expo dev server, real Supabase network call, or real SQLite database file

#### Scenario: Type and lint validation passes for touched files
- **WHEN** TypeScript validation and focused lint are run for new and touched inspection test files
- **THEN** they SHALL pass without introducing type errors or lint errors in the test harness
