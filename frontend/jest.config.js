const nextJest = require("next/jest");
const createJestConfig = nextJest({ dir: "./" });

/** @type {import('jest').Config} */
const config = {
  coverageProvider: "v8",
  testEnvironment: "jsdom",
  setupFilesAfterFramework: ["<rootDir>/jest.setup.js"],
};

module.exports = createJestConfig(config);
