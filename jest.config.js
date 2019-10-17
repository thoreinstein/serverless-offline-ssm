module.exports = {
  testEnvironment: "node",
  collectCoverage: false,
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
  ],
};
