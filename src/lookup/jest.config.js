const path = require("path");

module.exports = {
  roots: ["<rootDir>/test"],
  transform: {
    ".js": "jest-esm-transformer",
    "^.+\\.(ts|tsx)$": "ts-jest",
  },
  globals: {
    "ts-jest": {
      packageJson: "package.json",
    },
  },
  modulePaths: ["./node_modules"],
};
