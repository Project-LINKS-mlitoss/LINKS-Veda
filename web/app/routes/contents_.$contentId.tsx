import type { ActionFunctionArgs } from "@remix-run/node";
import { json, useLoaderData } from "@remix-run/react";
import { getUserInfo } from "server/cookie.server";
import {
	createAssetAction,
	createAssetVisualizeAction,
	createChatAction,
	patchContentItems,
	publicContentAction,
	publicContentVisualizeAction,
	saveMetadataAction,
} from "~/actions/ContentAction";
import ContentDetailPage from "~/components/pages/Content/ContentDetailPage";
import { contentDetailLoader } from "~/loaders/ContentLoader";
import { ACTION_TYPES_CONTENT, type ContentItem } from "~/models/content";
import type { ApiResponse } from "~/repositories/utils";

export { contentDetailLoader as loader };

export async function action({ params, request }: ActionFunctionArgs) {
	const requestText = await request.text();
	const formData = new URLSearchParams(requestText);
	const intent = formData.get("_action");

	if (!intent) {
		const { renderFields, renderItems, contentDetail, items } =
			JSON.parse(requestText);
		const { contentId } = params;

		if (contentId) {
			return patchContentItems({
				renderFields,
				renderItems,
				contentDetail,
				items,
			});
		}
	} else {
		const { uid, username } = await getUserInfo(request);
		formData.append("uid", uid);
		formData.append("username", username);

		switch (intent) {
			case ACTION_TYPES_CONTENT.CREATE_ASSET:
				return createAssetAction(formData);
			case ACTION_TYPES_CONTENT.PUBLISH:
				return publicContentAction(formData);
			case ACTION_TYPES_CONTENT.CREATE_ASSET_VISUALIZE:
				return createAssetVisualizeAction(formData);
			case ACTION_TYPES_CONTENT.PUBLISH_VISUALIZE:
				return publicContentVisualizeAction(formData);
			case ACTION_TYPES_CONTENT.CREATE_CHAT:
				return createChatAction(formData);
			case ACTION_TYPES_CONTENT.SAVE_METADATA:
				return saveMetadataAction(formData);
			default:
				return json(
					{ status: false, error: "Invalid action type" },
					{ status: 400 },
				);
		}
	}
}

export default function ContentView() {
	const result = useLoaderData<ApiResponse<ContentItem>>();

	if (result.status === false) {
		return <div>Error: {result.error}</div>;
	}

	return <ContentDetailPage data={result?.data} />;
}
