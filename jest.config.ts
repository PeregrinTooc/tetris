import type { Config } from "jest";

const config: Config = {
	preset: "ts-jest",
	testEnvironment: "jsdom",

	// Performance optimizations
	maxWorkers: "50%",
	maxConcurrency: 5,
	cache: true,

	// Module and test settings
	transform: {
		"^.+\\.(ts|tsx)$": "ts-jest"
	},
	moduleNameMapper: {
		"^(\\.{1,2}/.*)\\.ts$": "$1",
		"^(\\.{1,2}/.*)\\.mjs$": "$1",
		"^./src/(.*)$": "<rootDir>/src/$1",
		"^../src/(.*)$": "<rootDir>/src/$1"
	},
	testMatch: [
		"**/__tests__/**/*.ts",
		"**/?(*.)+(spec|test).ts"
	],

	// Fast execution
	verbose: false,
	testTimeout: 10000,
	collectCoverage: false
};

export default config;