import { defineConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
	base: "/tetris/",
	server: {
		host: true,
		port: 5173,
	},
	build: {
		outDir: "dist",
		assetsDir: "assets",
		emptyOutDir: true,
	},
	define: {
		"import.meta.env.VITE_BUILD_VERSION": JSON.stringify(
			process.env.VITE_BUILD_VERSION || "dev"
		),
	},
	plugins: [
		viteStaticCopy({
			targets: [{ src: "resources", dest: "" }],
		}),
	],
});
