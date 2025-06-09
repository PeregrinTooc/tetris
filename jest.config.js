export default {
    transform: {},
    moduleNameMapper: {
        "^(\\.{1,2}/.*)\\.js$": "$1",
        "^(\\.{1,2}/.*)\\.mjs$": "$1"
    },
    testEnvironment: "jsdom",
    testMatch: [
        "**/__tests__/**/*.js",
        "**/?(*.)+(spec|test).js"
    ],
    setupFilesAfterEnv: ["./jest.setup.js"]
}