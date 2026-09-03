module.exports = {
  root: true,
  env: { browser: true, es2020: true, node: true },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
    'plugin:tailwindcss/recommended'
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs', 'vite.config.js', 'tailwind.config.js', '*.css'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: { jsx: true }
  },
  settings: {
    react: { version: '18.2.0' },
    'import/resolver': {
      alias: {
        map: [
          ['@', './src'],
          ['@components', './src/components'],
          ['@pages', './src/pages'],
          ['@hooks', './src/hooks'],
          ['@services', './src/services'],
          ['@store', './src/store'],
          ['@utils', './src/utils'],
          ['@styles', './src/styles'],
          ['@test', './src/test']
        ],
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.json']
      }
    }
  },
  plugins: ['react-refresh', 'tailwindcss'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true }
    ],
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'comma-dangle': ['warn', 'always-multiline'],
    'object-curly-spacing': ['warn', 'always'],
    'semi': ['warn', 'always'],
    'tailwindcss/classnames-order': 'warn',
    'tailwindcss/no-custom-classname': 'warn'
  }
}
