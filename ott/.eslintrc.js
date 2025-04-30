module.exports = {
  env: {
    browser: true,
    es2024: true, // ESLint 9.x 버전에 맞춤
    node: true,
  },
  extends: [
    "airbnb",
    "airbnb/hooks",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:prettier/recommended",
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: ["react", "prettier", "import-helpers"],
  settings: {
    react: {
      version: "detect",
    },
    "import/resolver": {
      node: {
        extensions: [".js", ".jsx"],
      },
    },
  },
  rules: {
    "prettier/prettier": ["error", { endOfLine: "auto" }],
    "react/react-in-jsx-scope": "off", // React 19 사용
    "react/prop-types": "off",
    "react/jsx-filename-extension": [1, { extensions: [".jsx"] }],
    "import/prefer-default-export": "off",
    "import-helpers/order-imports": [
      "error",
      {
        newlinesBetween: "always",
        groups: ["/^react/", "module", "/^@/", ["parent", "sibling"], "index"],
        alphabetize: { order: "asc", ignoreCase: true },
      },
    ],
    "no-console": process.env.NODE_ENV === "production" ? "error" : "warn",
    "no-debugger": process.env.NODE_ENV === "production" ? "error" : "warn",
    "import/extensions": [
      "error",
      "ignorePackages",
      {
        js: "never",
        jsx: "never",
      },
    ],
  },
};
