import { json } from "@remix-run/node";
import jp from "~/commons/locales/jp";
import { ACTION_TYPES_CHAT } from "~/models/chat";
import { ServiceFactory } from "~/services/serviceFactory";

const chatService = ServiceFactory.getChatService();

export const deleteAction = async (formData: URLSearchParams) => {
	const chatIdsJson = formData.get("chatIds");
	const userUid = formData.get("uid") ?? "-1";
	let chatIds: number[] = [];

	if (chatIdsJson) {
		try {
			chatIds = JSON.parse(chatIdsJson).map((id: string) => Number(id));
		} catch (error) {
			return json(
				{ status: false, error: jp.message.chat.invalidChatId },
				{ status: 400 },
			);
		}
	}

	const result = await chatService.deleteChats(chatIds, userUid);

	return json({
		...(await result.json()),
		actionType: ACTION_TYPES_CHAT.DELETE,
	});
};
