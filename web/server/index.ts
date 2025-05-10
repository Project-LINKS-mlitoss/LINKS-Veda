import { createServer } from "node:http2";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import type { AppLoadContext, ServerBuild } from "@remix-run/node";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { remix } from "remix-hono/handler";
import { authenticate, cache } from "server/middlewares";
import { importDevBuild } from "./server";

const mode =
	process.env.NODE_ENV === "test" ? "development" : process.env.NODE_ENV;

const isProductionMode = mode === "production";

const app = new Hono();

/**
 * Serve assets files from build/client/assets
 */
app.use(
	"/assets/*",
	cache(60 * 60 * 24 * 365), // 1 year
	serveStatic({ root: "./build/client" }),
);

/**
 * Serve public files
 */
app.use(
	"*",
	cache(60 * 60),
	serveStatic({ root: isProductionMode ? "./build/client" : "./public" }),
); // 1 hour

/**
 * Add logger middleware
 */
app.use("*", logger());

app.use("*", authenticate());

/**
 * Add remix middleware to Hono server
 */
app.use(async (c, next) => {
	const build = (isProductionMode
		? // eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			// eslint-disable-next-line import/no-unresolved -- this expected until you build the app
			await import("../build/server/remix.js")
		: await importDevBuild()) as unknown as ServerBuild;

	return remix({
		build,
		mode,
		getLoadContext() {
			return {
				appVersion: isProductionMode ? build.assets.version : "dev",
			} satisfies AppLoadContext;
		},
	})(c, next);
});

/**
 * Start the server with HTTP/2 (H2C) and HTTP/1 fallback
 */

if (isProductionMode) {
	const port = Number(process.env.PORT) || 3000;
	const server = serve({
		fetch: app.fetch,
		createServer,
		port,
	});

	console.log(
		`🚀 Server is running with HTTP/1 and H2C on http://localhost:${port}`,
	);

	server.on("error", (err: Error) => {
		console.error("HTTP/2 Server Error:", err);
	});
}

export default app;

/**
 * Declare our loaders and actions context type
 */
declare module "@remix-run/node" {
	interface AppLoadContext {
		/**
		 * The app version from the build assets
		 */
		readonly appVersion: string;
	}
}
