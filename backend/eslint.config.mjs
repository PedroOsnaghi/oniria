import { defineConfig } from "eslint/config";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default defineConfig([
  // Ignorar carpetas comunes
  {
    ignores: ["node_modules/**", "dist/**", "build/**", "coverage/**"],
  },
  // Reglas JS recomendadas
  js.configs.recommended,
  {
    extends: compat.extends("plugin:@typescript-eslint/recommended"),
    files: ["**/*.ts"],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2022,
      sourceType: "module",
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
    },

    rules: {
      "@typescript-eslint/explicit-member-accessibility": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/interface-name-prefix": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/ban-types": "off",
      "@typescript-eslint/no-var-requires": "off",
      "@typescript-eslint/no-empty-function": "off",
      "@typescript-eslint/no-unsafe-declaration-merging": "off",
      "no-multiple-empty-lines": ["warn", { max: 1, maxEOF: 0 }],
      "no-trailing-spaces": "warn",
    },
  },
]);
