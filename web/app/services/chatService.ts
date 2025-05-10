import { json } from "@remix-run/node";
import { CHAT_STATUS, ROLE } from "~/commons/core.const";
import jp from "~/commons/locales/jp";
import type { ChatParams, ContentChatI } from "~/models/contentChatModel";
import type { AccountManagementRepository } from "~/repositories/accountManagementRepository";
import type { ContentChatRepository } from "~/repositories/contentChatRepository";
import type { ContentRepository } from "~/repositories/contentRepository";
import type { MbRepository } from "~/repositories/mbRepository";
import { validate } from "./utils";

export class ChatService {
	private contentChatRepository: ContentChatRepository;
	private contentRepository: ContentRepository;
	private accountManagementRepository: AccountManagementRepository;
	private mbRepository: MbRepository;

	constructor(
		contentChatRepository: ContentChatRepository,
		contentRepository: ContentRepository,
		accountManagementRepository: AccountManagementRepository,
		mbRepository: MbRepository,
	) {
		this.contentChatRepository = contentChatRepository;
		this.contentRepository = contentRepository;
		this.accountManagementRepository = accountManagementRepository;
		this.mbRepository = mbRepository;
	}

	async listChat(params: ChatParams, userId: string) {
		const isAdminRole = await this.isAdminRole(userId);
		const result = await this.contentChatRepository.getChats(
			params,
			isAdminRole ? undefined : userId,
		);

		if (result.status) {
			const keyword = params.keyword?.toLowerCase() || "";
			const filteredChats = [];

			for (const chat of result.data.models) {
				const content = await this.contentRepository.getContentDetail(
					chat.contentId ?? "",
				);
				chat.contentName = content.status ? content.data.name : "N/A";
				if (!keyword || chat.contentName.toLowerCase().includes(keyword)) {
					filteredChats.push(chat);
				}
			}

			result.data.models = filteredChats;
		}

		return json(result);
	}

	async getChatDetail(chatIds: number[], userId: string) {
		try {
			const validationError = validate(
				!chatIds,
				jp.message.chat.chatIdRequired,
			);
			if (validationError) {
				return validationError;
			}
			const isAdminRole = await this.isAdminRole(userId);
			// biome-ignore lint/suspicious/noExplicitAny: FIXME
			let conditions: { id: any; userId?: string; status: CHAT_STATUS } = {
				id: { in: chatIds },
				status: CHAT_STATUS.DONE,
			};

			if (!isAdminRole) {
				conditions = {
					...conditions,
					userId,
				};
			}

			const result = await this.contentChatRepository.find(conditions);
			if (!result.length) {
				return json({
					status: false,
					error: jp.message.chat.chatNotFound,
				});
			}

			await Promise.all(
				result.map(async (chat: ContentChatI) => {
					const content = await this.contentRepository.getContentDetail(
						chat.contentId ?? "",
					);
					chat.contentName = content.status ? content.data.name : "N/A";
				}),
			);

			return json({
				status: true,
				data: result,
			});
		} catch (e) {
			return json({
				status: false,
				error: e,
			});
		}
	}

	async isAdminRole(userId: string) {
		const user = await this.accountManagementRepository.findFirst(
			{ userId: userId },
			{
				id: true,
				role: true,
			},
		);
		return user && user.role === ROLE.ADMIN;
	}

	async syncChatStatus(chatId: string) {
		let chat = await this.contentChatRepository.findFirst({ chatId: chatId });
		if (!chat)
			return json({
				status: false,
				error: "Chat not found",
			});

		const chatStatus = chat.status;
		if (
			chatStatus &&
			![CHAT_STATUS.DONE, CHAT_STATUS.FAILED].includes(chatStatus)
		) {
			const mbResult = await this.mbRepository.checkTicketStatus(chatId);
			if (mbResult.status) {
				if ("ticketStatus" in mbResult) {
					if (chatStatus !== mbResult.ticketStatus) {
						chat = await this.contentChatRepository.update(chat.id, {
							status: mbResult.ticketStatus,
						});
					}
				}
			} else {
				chat = await this.contentChatRepository.update(chat.id, {
					status: CHAT_STATUS.FAILED,
				});
			}
		}

		return json({
			status: true,
			data: chat,
		});
	}

	async deleteChats(chatIds: number[], userId: string) {
		const isAdminRole = await this.isAdminRole(userId);
		// biome-ignore lint/suspicious/noExplicitAny: FIXME
		let conditions: { id: any; userId?: string; status: CHAT_STATUS } = {
			id: { in: chatIds },
			status: CHAT_STATUS.DONE,
		};

		if (!isAdminRole) {
			conditions = {
				...conditions,
				userId,
			};
		}
		const chats = await this.contentChatRepository.find(conditions);
		if (!chats.length)
			return json({
				status: false,
				error: jp.message.chat.chatNotFound,
			});

		const deleteChatIds = chats.map((chat: ContentChatI) => chat.id);
		await this.contentChatRepository.deleteByConditions(
			{ id: { in: deleteChatIds } },
			false,
		);

		return json({
			status: true,
		});
	}
}
