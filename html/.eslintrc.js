module.exports = {
  "env": {
    "browser": true,
    "es2021": true,
    "jquery":true
  },
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "overrides": [],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  "plugins": [
    "@typescript-eslint"
  ],
  "rules": {
    "no-alert":0,
    "no-console":2,
    "no-extra-parens":2,//禁止非必要的括号
    "no-extra-semi":2,//禁止多余冒号
    "no-unused-vars": "off"
  }
}