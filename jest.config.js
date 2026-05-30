const expoPreset = require('jest-expo/jest-preset');

const babelJestTransform = expoPreset.transform['\\.[jt]sx?$'];
const transformModules = [
  '(jest-)?react-native',
  '@react-native(-community)?',
  'expo(nent)?',
  '@expo(nent)?/.*',
  '@expo/.*',
  'expo-.*',
  '@unimodules/.*',
  'unimodules',
  'react-native-svg',
  'react-native-reanimated',
  'react-native-gesture-handler',
  '@testing-library/react-native',
  'msw',
  '@mswjs',
  '@open-draft',
  'until-async',
  'headers-polyfill',
  'strict-event-emitter',
  'outvariant',
  'is-node-process',
  'path-to-regexp',
  'cookie',
  'rettime',
  'type-fest',
].join('|');

module.exports = {
  ...expoPreset,
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts', '!src/test/**'],
  moduleNameMapper: {
    ...expoPreset.moduleNameMapper,
    '^@/(.*)$': '<rootDir>/src/$1',
    '^msw/node$': '<rootDir>/node_modules/msw/lib/node/index.js',
  },
  setupFiles: [...expoPreset.setupFiles, '<rootDir>/jest.polyfills.js'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testMatch: ['**/?(*.)+(test|spec).ts', '**/?(*.)+(test|spec).tsx'],
  testPathIgnorePatterns: ['/node_modules/', '/.expo/'],
  transform: {
    ...expoPreset.transform,
    '\\.mjs$': babelJestTransform,
  },
  transformIgnorePatterns: [`node_modules/(?!(${transformModules})/)`],
};
