import { config, configs } from "@ariesclark/eslint-config";
import react from "@ariesclark/eslint-config/react";
import tailwind from "@ariesclark/eslint-config/tailwindcss";
import globals from "globals";

export default config({
  extends: [...configs.recommended, ...react, ...tailwind],
  languageOptions: {
    ecmaVersion: 2020,
    globals: globals.browser
  },
  rules: {
    // What a lazy rule. It just checks for the method name not considering the context.
    "react/no-is-mounted": "off",
    "prettier/prettier": [
      "warn",
      {
        tabWidth: 2,
        useTabs: false,
        semi: true,
        singleQuote: false,
        jsxSingleQuote: false,
        trailingComma: "none"
      },
      {
        usePrettierrc: false
      }
    ]
  }
});
