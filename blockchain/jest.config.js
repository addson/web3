module.exports = {
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.[jt]sx?$',

  collectCoverageFrom: [
    '<rootDir>/src/lib/**/*.ts',
    '<rootDir>/src/server/**/*.ts',
  ],
};
