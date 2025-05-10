import { type ActionFunctionArgs, json } from "@remix-run/node";
import { CHAT_STATUS } from "~/commons/core.const";
import { logger } from "~/logger";
import { prisma } from "~/prisma";

export async function action({ request }: ActionFunctionArgs) {
	let ticketId = null;
	try {
		if (request.method !== "POST") {
			return json({ status: false, message: "Method not allowed" }, 405);
		}

		const payload = await request.json();
		logger.info({
			message: "API chat callback",
			data: payload,
		});
		const data = payload.data;
		ticketId = payload.ticketId;

		const chat = await prisma.contentChats.findFirst({
			where: { chatId: ticketId },
			select: {
				id: true,
			},
		});

		if (!chat) {
			return json({ status: "error", message: "Chat not found" }, 404);
		}

		const { id } = chat;
		await prisma.contentChats.update({
			where: { id },
			data: {
				status: CHAT_STATUS.DONE,
			},
		});

		return json({ status: "ok", message: "Data was successfully updated" });
	} catch (error) {
		logger.error({
			message: "API chat callback failed",
			err: error,
		});
		await prisma.contentChats.updateMany({
			where: { chatId: ticketId },
			data: {
				status: CHAT_STATUS.FAILED,
			},
		});

		return json({ status: "error", message: "Internal Server Error" }, 500);
	}
}
