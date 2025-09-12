import { defineConfig } from "cypress";

export default defineConfig({
	projectId: 'ye442y',
	e2e: {
		baseUrl: "http://localhost:5173",
		supportFile: "cypress/support/e2e.ts",
		setupNodeEvents(on, config) {
			// Browser launch optimizations
			on('before:browser:launch', (browser, launchOptions) => {
				if (browser.family === 'chromium' && browser.name !== 'electron') {
					launchOptions.args.push(
						'--disable-dev-shm-usage',
						'--disable-gpu',
						'--no-sandbox',
						'--disable-web-security',
						'--disable-background-timer-throttling',
						'--disable-backgrounding-occluded-windows',
						'--disable-renderer-backgrounding',
						'--memory-pressure-off',
						'--autoplay-policy=no-user-gesture-required',
						'--mute-audio'
					);
				}


				return launchOptions;
			});
			return config;
		},
		video: false,
		screenshotOnRunFailure: false,
		experimentalStudio: true,

		// Parallel execution optimizations
		experimentalRunAllSpecs: true, // Run all specs in parallel

		// Performance optimizations  
		defaultCommandTimeout: 2000, // Even faster timeouts
		pageLoadTimeout: 15000,
		requestTimeout: 2000,
		responseTimeout: 15000,
		taskTimeout: 60000,

		// Memory and execution optimizations
		numTestsKeptInMemory: 1, // Minimal memory usage
		experimentalMemoryManagement: true,
		chromeWebSecurity: false,

		// Viewport optimizations
		viewportWidth: 1000, // Smaller viewport for speed
		viewportHeight: 1000,

		// Test isolation for parallel safety
		testIsolation: true,

		// Spec pattern for organized execution
		specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
	},
});
