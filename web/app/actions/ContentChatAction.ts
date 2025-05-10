import { json } from "@remix-run/node";
import { ACTION_TYPES_CONTENT_CHAT } from "~/models/contentChatModel";
import { ServiceFactory } from "~/services/serviceFactory";

const contentService = ServiceFactory.getContentService();
export const sendMessageAction = async (formData: URLSearchParams) => {
	const targetIds = formData.get("targetIds") ?? "";
	const message = formData.get("message") ?? "";
	// TODO: replace when specs clear
	const category = formData.get("category") ?? "UC1";
	const result = await contentService.sendMessage(
		targetIds.split(","),
		message,
		category,
	);
	return json({
		...result,
		actionType: ACTION_TYPES_CONTENT_CHAT.SEND_MESSAGE,
	});
};
