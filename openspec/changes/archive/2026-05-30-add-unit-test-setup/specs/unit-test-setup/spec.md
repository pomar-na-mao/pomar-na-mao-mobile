## ADDED Requirements

### Requirement: Jest test command is available
The project SHALL provide package scripts for running unit tests with Jest.

#### Scenario: Developer runs the default test command
- **WHEN** a developer runs the default unit test script
- **THEN** Jest SHALL execute the project's unit tests using the Expo-compatible configuration

#### Scenario: Developer runs tests in watch or coverage mode
- **WHEN** a developer runs the watch or coverage test script
- **THEN** Jest SHALL start in the requested mode without requiring a simulator, device, or Expo dev server

### Requirement: Expo-compatible Jest configuration
The project SHALL configure Jest with `jest-expo` and TypeScript/React Native-compatible transforms.

#### Scenario: Test imports app modules through aliases
- **WHEN** a test imports modules using the `@/` alias
- **THEN** Jest SHALL resolve the import to the `src` directory

#### Scenario: Test imports Expo or React Native modules
- **WHEN** a test imports app code that depends on Expo or React Native modules
- **THEN** Jest SHALL use configured transforms or mocks so the test environment starts successfully

### Requirement: React Native component testing is supported
The project SHALL support component tests through React Native Testing Library.

#### Scenario: Component smoke test renders
- **WHEN** a component smoke test renders a React Native component
- **THEN** the test SHALL be able to query rendered output and assert expected content

#### Scenario: Component needs common providers
- **WHEN** a component test needs shared app providers
- **THEN** the test harness SHALL provide or document a reusable render helper for provider wrapping

### Requirement: MSW network mocking is configured
The project SHALL provide MSW setup for Jest tests that need HTTP/network mocks.

#### Scenario: Test starts
- **WHEN** the Jest environment starts
- **THEN** the MSW server SHALL be available before tests run and reset after each test

#### Scenario: Unhandled network request occurs
- **WHEN** a test makes an unhandled network request
- **THEN** the test setup SHALL surface the unhandled request so real network access is not silently used

### Requirement: Test setup is documented
The project SHALL document how to add and run unit tests.

#### Scenario: Developer adds a new test
- **WHEN** a developer reads the test setup documentation
- **THEN** they SHALL know where to place tests, when to use MSW, and which npm scripts to run

### Requirement: Harness verification test exists
The project SHALL include at least one minimal test proving the configured harness works.

#### Scenario: Test suite runs after setup
- **WHEN** the test suite is run immediately after implementation
- **THEN** at least one smoke test SHALL pass without requiring production network access
