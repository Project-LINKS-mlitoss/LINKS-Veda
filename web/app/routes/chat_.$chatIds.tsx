import {
	type ActionFunctionArgs,
	type MetaFunction,
	json,
} from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { sendMessageAction } from "~/actions/ContentChatAction";
import jp from "~/commons/locales/jp";
import ChatPageDetail from "~/components/pages/Chat/Detail";
import { chatDetailLoader } from "~/loaders/ChatLoader";
import {
	ACTION_TYPES_CONTENT_CHAT,
	type ContentChatI,
} from "~/models/contentChatModel";
import type { ApiResponse } from "~/repositories/utils";

export const meta: MetaFunction = () => {
	return [{ title: "Chat" }, { name: "chat", content: "" }];
};

export { chatDetailLoader as loader };
export async function action({ request }: ActionFunctionArgs) {
	const formData = new URLSearchParams(await request.text());
	const intent = formData.get("_action");
	switch (intent) {
		case ACTION_TYPES_CONTENT_CHAT.SEND_MESSAGE: {
			return sendMessageAction(formData);
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
	const result = useLoaderData<ApiResponse<ContentChatI[]>>();

	if (result.status === false) {
		return <div>Error: {result.error}</div>;
	}
	return <ChatPageDetail data={result.data} />;
}
