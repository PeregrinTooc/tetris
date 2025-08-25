import { defineConfig } from "cypress";

export default defineConfig({
  projectId: 'ye442y',
	e2e: {
		baseUrl: "http://localhost:5173",
		supportFile: false,
		video: false,
		screenshotOnRunFailure: true
	},
});
