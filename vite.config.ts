import { defineConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
	base: "/tetris/",
	build: {
		outDir: "dist",
		assetsDir: "assets",
		emptyOutDir: true,
	},
	plugins: [
		viteStaticCopy({
			targets: [{ src: "resources", dest: "" }],
		}),
	],
});
