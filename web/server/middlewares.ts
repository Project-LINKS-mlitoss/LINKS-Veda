import http2 from "node:http2";
import { createMiddleware } from "hono/factory";
import { defaultAuthorizedPage, routes } from "~/routes/routes";
import { commitSession, destroySession, getSession } from "./cookie.server";

/**
 * Cache middleware
 *
 * @param seconds - The number of seconds to cache
 */
export function cache(seconds: number) {
	return createMiddleware(async (c, next) => {
		if (!c.req.path.match(/\.[a-zA-Z0-9]+$/) || c.req.path.endsWith(".data")) {
			return next();
		}
		await next();
		if (c.res.ok) {
			c.res.headers.set("cache-control", `public, max-age=${seconds}`);
		}
	});
}

export function authenticate() {
	return createMiddleware(async (c, next) => {
		const getHeader = (name: string): string | null => {
			if (c.req.raw instanceof http2.Http2ServerRequest) {
				const header = c.req.raw.headers[name.toLowerCase()];
				if (Array.isArray(header)) {
					return header.join(", ");
				}
				return header ?? null;
			}
			return c.req.header(name) ?? null;
		};

		if (c.req.path.startsWith("/api")) {
			return next();
		}

		const cookieHeader = getHeader("Cookie") ?? "";
		const session = await getSession(cookieHeader);
		const userId = session.get("userId");
		const isAuthorized = !!userId;
		if (!c.req.path.startsWith(routes.login) && !isAuthorized) {
			const loginUrl = routes.login;

			if (getHeader("Accept")?.includes("text/html")) {
				const cookie = await destroySession(session);

				return new Response(null, {
					status: 302,
					headers: {
						Location: loginUrl,
						"Set-Cookie": cookie,
					},
				});
			}
			return new Response(null, {
				status: 204,
				statusText: "No Content",
				headers: {
					"X-Remix-Redirect": loginUrl,
					"X-Remix-Status": "302",
				},
			});
		}

		if (c.req.path.startsWith(routes.login) && isAuthorized) {
			return c.redirect(defaultAuthorizedPage);
		}
		await next();

		if (!c.finalized && isAuthorized) {
			const updatedCookie = await commitSession(session);
			c.header("Set-Cookie", updatedCookie);
		}
		return c.res;
	});
}
