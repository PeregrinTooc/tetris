import type { Config } from "jest";

const config: Config = {
	preset: "ts-jest",
	testEnvironment: "jsdom",
	transform: {
		"^.+\\.(ts|tsx)$": "ts-jest"
	},
	moduleNameMapper: {
		"^(\\.{1,2}/.*)\\.ts$": "$1",
		"^(\\.{1,2}/.*)\\.mjs$": "$1"
	},
	testMatch: [
		"**/__tests__/**/*.ts",
		"**/?(*.)+(spec|test).ts"
	]
};

export default config;