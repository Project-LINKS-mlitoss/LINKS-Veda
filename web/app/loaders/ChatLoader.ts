import type { LoaderFunctionArgs } from "@remix-run/node";
import { ServiceFactory } from "~/services/serviceFactory";
import { getListParams } from "~/utils/request";
import { getUserInfo } from "../../server/cookie.server";

const chatService = ServiceFactory.getChatService();
export async function chatLoader({ request }: LoaderFunctionArgs) {
	const { page, perPage, keyword } = getListParams(request);
	const { uid } = await getUserInfo(request);

	return chatService.listChat({ page, perPage, keyword }, uid);
}

export async function chatDetailLoader({
	params,
	request,
}: LoaderFunctionArgs) {
	const { chatIds } = params;
	const { uid } = await getUserInfo(request);
	const data = (chatIds ?? "")
		.split(",")
		.map((id) => Number(id))
		.filter((id) => !Number.isNaN(id));

	return await chatService.getChatDetail(data, uid);
}

export async function chatStatusLoader({
	params,
	request,
}: LoaderFunctionArgs) {
	const { chatId } = params;

	return await chatService.syncChatStatus(chatId ?? "");
}
