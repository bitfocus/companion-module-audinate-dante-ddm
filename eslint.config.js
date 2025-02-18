import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

export default [
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
    },
  },
  {
    rules: {
      ...tsPlugin.configs.recommended.rules, // Include @typescript-eslint recommended rules
    },
  },
];