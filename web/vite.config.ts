import devServer from "@hono/vite-dev-server";
import { vitePlugin as remix } from "@remix-run/dev";
import esbuild from "esbuild";
import { defineConfig } from "vite";
import checker from "vite-plugin-checker";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	server: {
		port: 3000,
		// https://github.com/remix-run/remix/discussions/8917#discussioncomment-8640023
		warmup: {
			clientFiles: [
				"./app/entry.client.tsx",
				"./app/root.tsx",
				"./app/routes/**/*",
				"!**/*.server.ts",
			],
		},
	},
	// https://github.com/remix-run/remix/discussions/8917#discussioncomment-8640023
	optimizeDeps: {
		include: ["./app/routes/**/*"],
	},
	// Hello 👋 Prisma users, uncomment that. Thanks @AlemTuzlak
	// resolve: {
	//   alias: {
	//     ".prisma/client/index-browser":
	//       "./node_modules/.prisma/client/index-browser.js",
	//   },
	// },
	plugins: [
		devServer({
			injectClientScript: false,
			entry: "server/index.ts", // The file path of your server.
			exclude: [/^\/(app)\/.+/, /^\/@.+$/, /^\/node_modules\/.*/],
		}),
		tsconfigPaths(),
		remix({
			serverBuildFile: "remix.js",
			buildEnd: async () => {
				await esbuild
					.build({
						alias: { "~": "./app" },
						// The final file name
						outfile: "build/server/index.js",
						// Our server entry point
						entryPoints: ["server/index.ts"],
						// Dependencies that should not be bundled
						// We import the remix build from "../build/server/remix.js", so no need to bundle it again
						external: ["./build/server/*"],
						platform: "node",
						format: "esm",
						// Don't include node_modules in the bundle
						packages: "external",
						bundle: true,
						logLevel: "info",
					})
					.catch((error: unknown) => {
						console.error(error);
						process.exit(1);
					});
			},
			future: {
				v3_fetcherPersist: true,
				v3_relativeSplatPath: true,
				v3_throwAbortReason: true,
			},
		}),
		// checker({
		// 	typescript: {
		// 		buildMode: true,
		// 	},
		// }),
	],
});
