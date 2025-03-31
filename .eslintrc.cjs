module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: ["airbnb-base", "plugin:vue/recommended"],
  parser: 'vue-eslint-parser',
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: ["vue"],
  rules: {
    // Базовые переопределения правил Airbnb для Vue
    "import/no-unresolved": "off",
    "import/extensions": "off",
    "no-use-before-define": "off",
    "vue/multi-word-component-names": "off",
    "no-underscore-dangle": "off",
    "no-return-await": "off",
    "no-plusplus": "off",
    "max-len": ["error", { code: 140, ignoreUrls: true }],
    "no-param-reassign": ["error", { props: false }],
    "import/prefer-default-export": "off",
    "vue/html-self-closing": [
      "error",
      {
        html: {
          void: "always",
          normal: "never",
          component: "always",
        },
      },
    ],
  },
  settings: {
    "import/resolver": {
      alias: {
        map: [["@", "./src"]],
        extensions: [".js", ".vue"],
      },
    },
  },
};
