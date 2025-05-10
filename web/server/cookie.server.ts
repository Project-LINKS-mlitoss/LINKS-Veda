import crypto from "node:crypto";
import { createSessionStorage } from "@remix-run/node";
import { prisma } from "~/prisma";

const sessionSecret = process.env.VITE_SECRECT ?? "your-session-secret";
const ONE_DAY = 60 * 60 * 1000 * 24;

function createDatabaseSessionStorage({ cookie }) {
	return createSessionStorage({
		cookie,

		async createData(data, _expires) {
			const sessionId = crypto.randomUUID();
			const userId = data.userId ?? "";
			const username = data.username ?? "";
			const expiresAt = new Date(Date.now() + ONE_DAY);

			await prisma.userSession.create({
				data: {
					sessionId,
					userId,
					username,
					expiresAt,
				},
			});

			return sessionId;
		},

		async readData(sessionId) {
			if (typeof sessionId !== "string") {
				return null;
			}
			const now = new Date();
			await prisma.userSession.deleteMany({
				where: {
					expiresAt: { lte: now },
				},
			});

			const session = await prisma.userSession.findUnique({
				where: { sessionId },
			});

			if (!session) return null;

			return {
				id: session.id,
				sessionId: session.sessionId,
				userId: session.userId,
				username: session.username,
				expiresAt: session.expiresAt,
			};
		},

		async updateData(sessionId, data, _expires) {
			if (typeof sessionId !== "string") {
				return;
			}
			const expiresAt = new Date(Date.now() + ONE_DAY);
			const userId = data.userId ?? "";
			const username = data.username ?? "";
			await prisma.userSession.update({
				where: { sessionId },
				data: {
					userId,
					username,
					expiresAt,
				},
			});
		},

		async deleteData(sessionId) {
			try {
				await prisma.userSession.delete({
					where: { sessionId },
				});
			} catch (error: unknown) {
				if (
					error instanceof Error &&
					Object.prototype.hasOwnProperty.call(error, "code") &&
					(error as { code?: string }).code !== "P2025"
				) {
					throw error;
				}
			}
		},
	});
}

export const { getSession, commitSession, destroySession } =
	createDatabaseSessionStorage({
		cookie: {
			name: "session",
			secure: process.env.NODE_ENV === "production",
			secrets: [sessionSecret],
			sameSite: "lax",
			path: "/",
			httpOnly: true,
			maxAge: 86400,
		},
	});

export const getUserInfo = async (request: Request) => {
	const session = await getSession(request.headers.get("Cookie") ?? "");
	return {
		uid: session.get("userId") || "",
		username: session.get("username") || "",
	};
};
