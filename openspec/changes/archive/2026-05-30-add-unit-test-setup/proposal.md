## Why

The project currently has no unit test harness, which makes refactors in inspection, repositories, helpers, and UI components harder to validate. Adding a standard Expo-compatible testing setup now gives the app a repeatable way to test pure logic, React Native components, hooks, and network-dependent services without relying on real Supabase calls.

## What Changes

- Add Jest unit test configuration using the `jest-expo` preset.
- Add React Native Testing Library support for rendering and asserting React Native components.
- Add MSW support for mocking HTTP/network behavior in tests.
- Add Jest setup files for React Native/Expo globals, gesture/reanimated-safe mocks where needed, and MSW server lifecycle.
- Add package scripts for normal, watch, and coverage test runs.
- Add at least one smoke/example test proving the configured stack runs successfully.
- Document conventions for test file placement and when to use component tests, helper tests, and MSW-backed service tests.

## Capabilities

### New Capabilities

- `unit-test-setup`: Provides the standard unit test harness and conventions for Jest, React Native Testing Library, `jest-expo`, and MSW.

### Modified Capabilities

- None.

## Impact

- Affected project files:
  - `package.json`
  - `package-lock.json`
  - Jest config file, such as `jest.config.js`
  - Jest setup files, such as `jest.setup.ts`
  - MSW test server files, such as `src/test/msw/server.ts` and `src/test/msw/handlers.ts`
  - Optional shared test utilities, such as `src/test/test-utils.tsx`
- New dev dependencies are expected:
  - `jest`
  - `jest-expo`
  - `@testing-library/react-native`
  - `@testing-library/jest-native` or the current matcher package supported by the selected RNTL/Jest stack
  - `msw`
  - any Jest type/runtime helpers required by the chosen versions
- No app runtime behavior, database schema, Supabase schema, or production navigation behavior should change.
