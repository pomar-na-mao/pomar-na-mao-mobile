## Context

The project is an Expo/React Native app using Expo Router, React 19, React Native 0.81, TypeScript, Supabase, React Query, SQLite, maps, sensors, and several native Expo modules. It currently has lint and typecheck workflows but no Jest test configuration, no test setup files, and no test scripts.

The test setup must work with the existing Expo runtime assumptions and path alias imports such as `@/ui/...`. It should support pure helper tests, component rendering tests, hook/provider tests, and service/repository tests with mocked network calls.

## Goals / Non-Goals

**Goals:**

- Add a repeatable unit test command to `package.json`.
- Configure Jest with the `jest-expo` preset.
- Configure React Native Testing Library for component tests.
- Configure MSW for network mocks used by service/repository tests.
- Add setup files for Jest matchers, native module mocks, and MSW lifecycle.
- Add a smoke test proving the test stack runs in this project.
- Document conventions for where tests and test helpers live.

**Non-Goals:**

- Do not add end-to-end testing.
- Do not require a device, simulator, Expo dev server, or real Supabase project to run unit tests.
- Do not change production code behavior except where tiny testability seams are necessary.
- Do not create broad test coverage for every feature in this change; only prove the harness works.

## Decisions

1. Use `jest-expo` as the Jest preset.

   `jest-expo` is the safest baseline for this app because it aligns Jest transforms and mocks with Expo projects. The alternative was a plain `react-native` preset, but that usually needs more manual Expo module mocking and is easier to misconfigure in an Expo Router app.

2. Use React Native Testing Library for UI tests.

   RNTL encourages tests that assert rendered output and user behavior instead of component internals. This fits the existing component structure and avoids coupling tests to implementation details.

3. Use MSW's Node server in Jest.

   Unit tests run in Node, so MSW should be configured through `setupServer`. Test handlers should live under a shared test folder and be reset between tests. This allows Supabase or fetch-based service tests to avoid real network calls.

4. Keep test utilities under `src/test`.

   Shared test utilities, MSW handlers, and render wrappers should live in `src/test` so feature tests can import a common setup without mixing test-only helpers into production modules.

5. Keep mocks explicit and minimal.

   The setup should mock only native modules that break Jest startup or common component rendering. Feature-specific mocks should live beside tests unless they become shared.

## Risks / Trade-offs

- [Risk] Dependency versions drift from Expo's supported stack -> Mitigation: install Expo-compatible versions and verify with `npm test` and `npx expo install --check` when feasible.
- [Risk] Reanimated, gesture-handler, maps, SQLite, or Expo native modules fail in Jest -> Mitigation: add targeted setup mocks only for modules exercised by tests.
- [Risk] MSW does not intercept Supabase internals if the client uses a non-fetch transport -> Mitigation: configure global fetch and prefer repository/service tests around code paths that use fetch-compatible requests; fall back to module mocks where transport-level mocking is not reliable.
- [Risk] Tests become brittle by asserting implementation details -> Mitigation: document conventions favoring user-visible output, behavior, and pure function results.
- [Risk] Full lint still fails from unrelated files -> Mitigation: validate touched test config files and report unrelated failures separately.
