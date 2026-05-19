import playwright from "eslint-plugin-playwright";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "node_modules/",
      "playwright-report/",
      "test-results/",
      "blob-report/",
    ],
  },
  ...tseslint.configs.recommended,
  {
    files: ["scripts/**"],
    extends: [playwright.configs["flat/recommended"]],
  },
);
