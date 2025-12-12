import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';
import unusedImports from 'eslint-plugin-unused-imports';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    plugins: {
      'unused-imports': unusedImports,
    },
    rules: {
      // TypeScript rules
      '@typescript-eslint/array-type': 'off',
      '@typescript-eslint/consistent-type-definitions': 'off',
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        {
          prefer: 'type-imports',
          fixStyle: 'inline-type-imports',
        },
      ],
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/no-misused-promises': [
        'error',
        {
          checksVoidReturn: { attributes: false },
        },
      ],
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',

      // General rules
      'arrow-body-style': 'off',
      'no-alert': 'off',
      'no-underscore-dangle': 'off',
      'no-void': 'off',
      'object-shorthand': ['error', 'properties'],
      'no-console': [
        'error',
        {
          allow: ['warn', 'error'],
        },
      ],
      'no-restricted-exports': 'off',
      'consistent-return': 'off',
      'jsx-quotes': ['error', 'prefer-double'],

      // React rules
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/jsx-no-target-blank': 2,
      'react/jsx-props-no-spreading': 'off',
      'react/jsx-sort-props': [
        'error',
        {
          shorthandLast: true,
          callbacksLast: true,
          multiline: 'ignore',
          ignoreCase: false,
          noSortAlphabetically: true,
          reservedFirst: ['key', 'ref'],
        },
      ],
      'react/function-component-definition': 'off',
      'react/require-default-props': 'off',
      'react/no-unknown-property': ['error', { ignore: ['tw'] }],

      // Import rules
      'import/extensions': 'off',
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', ['parent', 'sibling'], 'object', 'index', 'type'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
          pathGroups: [
            {
              pattern: '{react,react-dom}',
              group: 'builtin',
              position: 'before',
            },
          ],
          pathGroupsExcludedImportTypes: ['builtin', 'object'],
        },
      ],
      'import/prefer-default-export': 'off',
      'import/no-extraneous-dependencies': 'off',

      // JSX A11y rules
      'jsx-a11y/label-has-associated-control': [
        'error',
        {
          labelComponents: [],
          labelAttributes: [],
          controlComponents: [],
          assert: 'either',
          depth: 25,
        },
      ],

      // Unused imports
      'unused-imports/no-unused-imports': 'error',

      // Next.js rules
      '@next/next/no-img-element': 'off',
    },
  },
  eslintConfigPrettier,
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts', '**/generated/**/*']),
]);

export default eslintConfig;
