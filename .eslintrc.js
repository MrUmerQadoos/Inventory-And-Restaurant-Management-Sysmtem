module.exports = {
  extends: ['next/core-web-vitals', 'plugin:import/recommended', 'prettier'],
  rules: {
    // Turn off accessibility-related and React-specific rules
    'import/no-unresolved': 'off',
    'jsx-a11y/alt-text': 'off',
    'react/display-name': 'off',
    'react/no-children-prop': 'off',
    '@next/next/no-img-element': 'off',
    '@next/next/no-page-custom-font': 'off',
    'react-hooks/exhaustive-deps': 'off',

    // Turn off rules related to padding lines between statements
    'padding-line-between-statements': 'off',

    // Turn off rule for newline before return statement
    'newline-before-return': 'off',

    // Turn off rules related to import order
    'import/newline-after-import': 'off',
    'import/order': 'off'

    // Other custom rules can be added here if needed
  },
  settings: {
    react: {
      version: 'detect'
    },
    'import/parsers': {},
    'import/resolver': {
      node: {},
      typescript: {
        project: './jsconfig.json'
      }
    }
  },
  overrides: []
}
