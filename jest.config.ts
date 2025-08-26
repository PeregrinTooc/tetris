import type { Config } from "jest";

const config: Config = {
	preset: "ts-jest",
	testEnvironment: "jsdom",
	
	// Parallel processing optimizations
	maxWorkers: "50%", // Use 50% of available CPU cores
	maxConcurrency: 5, // Run up to 5 tests concurrently within a worker
	
	// Performance optimizations
	testEnvironmentOptions: {
		url: "http://localhost"
	},
	
	// Faster TypeScript compilation
	transform: {
		"^.+\\.(ts|tsx)$": ["ts-jest", {
			isolatedModules: true, // Faster compilation, skip type checking
			tsconfig: {
				compilerOptions: {
					sourceMap: false // Skip source maps for faster builds
				}
			}
		}]
	},
	
	// Module resolution optimizations
	moduleNameMapper: {
		"^(\\.{1,2}/.*)\\.ts$": "$1",
		"^(\\.{1,2}/.*)\\.mjs$": "$1"
	},
	
	// Test discovery
	testMatch: [
		"**/__tests__/**/*.ts",
		"**/?(*.)+(spec|test).ts"
	],
	
	// Performance monitoring
	verbose: false, // Reduce console output for faster execution
	silent: false,
	
	// Cache optimizations
	cache: true,
	cacheDirectory: "node_modules/.cache/jest",
	
	// Faster test execution
	testTimeout: 10000, // 10 second timeout per test
	
	// Skip collecting coverage by default for faster runs
	collectCoverage: false,
	
	// Only transform what we need
	transformIgnorePatterns: [
		"node_modules/(?!(.*\\.mjs$))"
	]
};

export default config;