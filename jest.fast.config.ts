import type { Config } from "jest";

const config: Config = {
	preset: "ts-jest",
	testEnvironment: "jsdom",

	// Maximum parallel processing
	maxWorkers: "100%", // Use all available CPU cores
	maxConcurrency: 10, // Higher concurrency for maximum speed

	// Minimal test environment setup
	testEnvironmentOptions: {
		url: "http://localhost",
	},

	// Fastest TypeScript compilation
	transform: {
		"^.+\\.(ts|tsx)$": "ts-jest",
	},

	// Module resolution
	moduleNameMapper: {
		"^(\\.{1,2}/.*)\\.ts$": "$1",
		"^(\\.{1,2}/.*)\\.mjs$": "$1",
	},

	// Test discovery
	testMatch: ["**/__tests__/**/*.ts", "**/?(*.)+(spec|test).ts"],

	// Minimal output for speed
	verbose: false,
	silent: true,

	// Aggressive caching
	cache: true,
	cacheDirectory: "node_modules/.cache/jest-fast",

	// Fast execution settings
	testTimeout: 5000, // Shorter timeout
	collectCoverage: false,

	// Skip unnecessary transforms
	transformIgnorePatterns: ["node_modules/(?!(.*\\.mjs$))"],

	// Disable slower features
	errorOnDeprecated: false,
	clearMocks: true,
	resetMocks: false,
	restoreMocks: false,
};

export default config;
