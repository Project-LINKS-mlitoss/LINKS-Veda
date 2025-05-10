import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, useLoaderData } from "@remix-run/react";
import { deleteAction } from "~/actions/ChatAction";
import jp from "~/commons/locales/jp";
import ChatPage from "~/components/pages/Chat";
import { chatLoader } from "~/loaders/ChatLoader";
import { ACTION_TYPES_CHAT } from "~/models/chat";
import type { ChatResponse } from "~/models/contentChatModel";
import type { ApiResponse } from "~/repositories/utils";
import { getUserInfo } from "../../server/cookie.server";

export const meta: MetaFunction = () => {
	return [{ title: "Chat" }, { name: "chat", content: "" }];
};

export { chatLoader as loader };

export async function action({ request }: ActionFunctionArgs) {
	const formData = new URLSearchParams(await request.text());
	const _action = formData.get("_action");
	const { uid } = await getUserInfo(request);
	formData.append("uid", uid);
	switch (_action) {
		case ACTION_TYPES_CHAT.DELETE: {
			return deleteAction(formData);
		}
		default: {
			return json(
				{ status: false, error: jp.message.common.invalidActionType },
				{ status: 400 },
			);
		}
	}
}

export default function Chat() {
	const result = useLoaderData<ApiResponse<ChatResponse>>();

	if (result.status === false) {
		return <div>Error: {result.error}</div>;
	}
	return <ChatPage data={result.data} />;
}
