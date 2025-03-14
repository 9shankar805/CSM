import js from '@eslint/js';
import jestPlugin from 'eslint-plugin-jest';
import nodePlugin from 'eslint-plugin-node';

export default [
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
    plugins: {
      jest: jestPlugin,
      node: nodePlugin,
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
      'semi': ['error', 'always'],
      'quotes': ['error', 'single'],
      'indent': ['error', 2],
      
      // Node.js specific rules
      'node/no-unsupported-features/es-syntax': ['error', {
        version: '>=18.0.0',
        ignores: ['modules']
      }],
      'node/no-missing-import': 'error',
      
      // Jest specific rules
      'jest/no-disabled-tests': 'warn',
      'jest/no-focused-tests': 'error',
      'jest/no-identical-title': 'error',
      'jest/valid-expect': 'error'
    }
  },
  {
    files: ['**/__tests__/**/*.js'],
    rules: {
      'jest/expect-expect': 'error',
      'jest/no-standalone-expect': 'error',
      'jest/valid-describe': 'error'
    }
  }
];
