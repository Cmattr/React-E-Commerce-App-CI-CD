module.exports = {
    transform: {
      "^.+\\.(js|jsx)?$": "babel-jest",
    },
    moduleFileExtensions: ["js", "jsx"],
    testEnvironment: "jsdom",
    verbose: true,
    transformIgnorePatterns: ["/node_modules/"], 
  };
  