## 1. Dependencies And Scripts

- [x] 1.1 Add Jest, `jest-expo`, React Native Testing Library, MSW, and required matcher/type helper dev dependencies
- [x] 1.2 Add `test`, `test:watch`, and `test:coverage` scripts to `package.json`
- [x] 1.3 Confirm installed versions are compatible with the current Expo SDK and React Native version

## 2. Jest Configuration

- [x] 2.1 Add a Jest config using the `jest-expo` preset
- [x] 2.2 Configure test matching for `*.test.ts`, `*.test.tsx`, `*.spec.ts`, and `*.spec.tsx`
- [x] 2.3 Configure module alias resolution for `@/` to point at `src`
- [x] 2.4 Configure transform ignore patterns needed for Expo, React Native, and project dependencies
- [x] 2.5 Configure setup files for Jest matchers, native module mocks, and MSW lifecycle

## 3. Test Harness Files

- [x] 3.1 Add a Jest setup file for matchers and stable React Native/Expo mocks
- [x] 3.2 Add MSW server and handler files under `src/test/msw`
- [x] 3.3 Add a shared React Native Testing Library render helper under `src/test`
- [x] 3.4 Document how tests should use MSW handlers and render helpers

## 4. Verification Tests

- [x] 4.1 Add a minimal pure helper or utility smoke test
- [x] 4.2 Add a minimal React Native component smoke test using React Native Testing Library
- [x] 4.3 Add or document a minimal MSW-backed network mock example

## 5. Validation

- [x] 5.1 Run `npm test` and fix configuration/runtime failures
- [x] 5.2 Run TypeScript validation and fix type issues introduced by test config files
- [x] 5.3 Run focused lint on new and touched test config files
- [x] 5.4 Update project documentation if the test command or conventions need to be discoverable outside the config files
