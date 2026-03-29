import path from "node:path";
import { fileURLToPath } from "node:url";

import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  resolvePluginsRelativeTo: __dirname,
  recommendedConfig: js.configs.recommended,
});

export default [
  // Equivalent to .eslintignore
  {
    ignores: ["dist/", "node_modules/", "coverage/"],
  },
  // Load the old .eslintrc configuration
  ...compat.config({
    root: true,
    parser: "@typescript-eslint/parser",
    parserOptions: {
      sourceType: "module",
      ecmaVersion: 2022,
      project: "./tsconfig.json",
    },
    plugins: ["@typescript-eslint", "simple-import-sort"],
    extends: [
      "eslint:recommended",
      "plugin:@typescript-eslint/strict-type-checked",
      "plugin:@typescript-eslint/stylistic-type-checked",
      "plugin:prettier/recommended",
      "plugin:unicorn/recommended",
      "plugin:node/recommended",
    ],
    rules: {
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
      "unicorn/prefer-module": "off",
      "unicorn/prefer-top-level-await": "off",
      "unicorn/prevent-abbreviations": "off",
      "no-console": "warn",
      "node/no-missing-import": "off",
      "node/no-unsupported-features/es-syntax": [
        "error",
        { ignores: ["modules"] },
      ],
      "node/no-unpublished-import": "off",
      "no-process-exit": "off",
      "@typescript-eslint/restrict-template-expressions": [
        "error",
        { allowNumber: true },
      ],
    },
    overrides: [
      {
        files: ["*.ts"],
        rules: {
          "simple-import-sort/imports": [
            "error",
            {
              groups: [
                [
                  "^(assert|buffer|child_process|cluster|console|constants|crypto|dgram|dns|domain|events|fs|http|https|module|net|os|path|punycode|querystring|readline|repl|stream|string_decoder|sys|timers|tls|tty|url|util|vm|zlib|freelist|v8|process|async_hooks|http2|perf_hooks)(/.*|$)",
                ],
                [
                  String.raw`^node:.*\u0000$`,
                  String.raw`^@?\w.*\u0000$`,
                  String.raw`^[^.].*\u0000$`,
                  String.raw`^\..*\u0000$`,
                ],
                [String.raw`^\u0000`],
                ["^node:"],
                [String.raw`^@?\w`],
                ["^@/tests(/.*|$)"],
                ["^@/src(/.*|$)"],
                ["^@/app(/.*|$)"],
                ["^@/shared(/.*|$)"],
                ["^@/contexts(/.*|$)"],
                ["^"],
                [String.raw`^\.`],
              ],
            },
          ],
        },
      },
      {
        files: ["*.js", "*.mjs", "*.cjs"],
        extends: ["plugin:@typescript-eslint/disable-type-checked"],
      },
      {
        files: ["*.module.ts"],
        rules: {
          "@typescript-eslint/no-extraneous-class": "off",
        },
      },
      {
        files: ["scripts/**"],
        rules: {
          "no-console": "off",
        },
      },
      {
        files: ["tests/**"],
        plugins: ["vitest"],
        extends: ["plugin:vitest/recommended"],
        rules: {
          "@typescript-eslint/unbound-method": "off",
          "vitest/expect-expect": "off",
          "vitest/no-standalone-expect": "off",
        },
      },
      {
        files: ["tests/performance/**"],
        rules: {
          "unicorn/numeric-separators-style": "off",
          "unicorn/no-anonymous-default-export": "off",
          "@typescript-eslint/no-unsafe-call": "off",
          "@typescript-eslint/no-unsafe-assignment": "off",
          "@typescript-eslint/no-unsafe-member-access": "off",
          "no-undef": "off",
        },
      },
    ],
    env: {
      node: true,
    },
  }),
];
