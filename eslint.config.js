// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettierPlugin = require('eslint-plugin-prettier');
const typescriptEslintPlugin = require('@typescript-eslint/eslint-plugin');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
    plugins: {
      prettier: prettierPlugin,
      '@typescript-eslint': typescriptEslintPlugin,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-inferrable-types': 'warn',
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      '@typescript-eslint/no-non-null-assertion': 'warn',
      'prettier/prettier': ['error'],
      'react-hooks/exhaustive-deps': 'off',
      'max-len': [
        'warn',
        {
          code: 120,
          ignorePattern: '^import\\s.+\\sfrom\\s.+|^export\\s.+\\sfrom\\s.+|^\\s*\\}?\\s*\\/\\/.*',
        },
      ],
    },
  },
]);
