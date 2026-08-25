module.exports = {
  root: true,
  env: { browser: true, es2022: true, node: true },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  settings: { react: { version: 'detect' } },
  ignorePatterns: ['dist', 'data/catalog.js', 'node_modules'],
  rules: {
    // The app passes plain objects around rather than typed props; PropTypes
    // would be noise without adding a real check.
    'react/prop-types': 'off',
    'no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],
  },
  overrides: [
    {
      files: ['src/test/**/*.js'],
      env: { node: true },
      globals: { describe: 'readonly', it: 'readonly', expect: 'readonly' },
    },
  ],
};
