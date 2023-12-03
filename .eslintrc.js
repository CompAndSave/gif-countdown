module.exports = {
    "env": {
        "browser": true,
        "commonjs": true,
        "es6": true,
        "node": true
    },
    "extends": "eslint:recommended",
    "globals": {
        "Atomics": "readonly",
        "SharedArrayBuffer": "readonly"
    },
    "parser": "@babel/eslint-parser",
    "parserOptions": {
      "requireConfigFile": false,
      "ecmaVersion": 11
    },
    "rules": {
        "no-unused-vars": ["error", { "argsIgnorePattern": "next" }]
    }
};
