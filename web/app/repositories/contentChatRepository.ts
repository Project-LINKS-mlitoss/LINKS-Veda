import { CHAT_STATUS } from "~/commons/core.const";
import jp from "~/commons/locales/jp";
import { logger } from "~/logger";
import type { ChatParams, ChatResponse } from "~/models/contentChatModel";
import { prisma } from "~/prisma";
import { BaseRepository } from "~/repositories/baseRepository";
import type { ApiResponse } from "./utils";

export class ContentChatRepository extends BaseRepository<
	typeof prisma.contentChats
> {
	constructor() {
		super(prisma.contentChats);
	}

	async getChats(
		params: ChatParams,
		userId?: string,
	): Promise<ApiResponse<ChatResponse>> {
		const { page, perPage, keyword } = params;

		try {
			const pagination = {
				skip: (page - 1) * perPage,
				take: perPage,
			};

			const filter = {
				AND: [
					...(userId ? [{ userId: userId }] : []),
					{ status: CHAT_STATUS.DONE },
				],
			};

			const [models, totalCount] = await Promise.all([
				prisma.contentChats.findMany({
					where: filter,
					...pagination,
					orderBy: { createdAt: "desc" },
				}),
				prisma.contentChats.count({ where: filter }),
			]);

			const data = models.map((chat) => ({
				...chat,
				...(chat.createdAt && {
					createdAt: new Date(chat.createdAt).toISOString(),
				}),
				updatedAt: chat.updatedAt ? String(chat.updatedAt) : undefined,
				deletedAt: chat.deletedAt ? String(chat.deletedAt) : undefined,
			}));

			return {
				status: true,
				data: {
					models: data,
					page,
					perPage,
					totalCount,
				},
			};
		} catch (error) {
			logger.error({
				message: "Fetch list chat failed",
				err: error,
			});
			console.error("Error fetching chats:", error);
			return { status: false, error: jp.message.chat.fetchChatsError };
		}
	}
}
