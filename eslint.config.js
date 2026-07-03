const angular = require("@angular-eslint/eslint-plugin");
const typescript = require("@typescript-eslint/eslint-plugin");
const parser = require("@typescript-eslint/parser");

module.exports = [
  {
    files: ["**/*.ts"],
    plugins: {
      "@angular-eslint": angular,
      "@typescript-eslint": typescript,
    },
    languageOptions: {
      parser: parser,
      parserOptions: {
        project: ["tsconfig.json"],
        createDefaultProgram: true,
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": "warn",
    },
  },
  {
    files: ["**/*.html"],
    plugins: {
      "@angular-eslint": angular,
    },
    rules: {},
  },
];
