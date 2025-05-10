import {
	type ActionFunctionArgs,
	type MetaFunction,
	json,
} from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
	createAssetAction,
	createAssetVisualizeAction,
	createChatAction,
	deleteContentAction,
	duplicateContentAction,
	publicContentAction,
	publicContentVisualizeAction,
	renameContentAction,
	saveMetadataAction,
} from "~/actions/ContentAction";
import jp from "~/commons/locales/jp";
import ContentsPage from "~/components/pages/Content";
import { contentLoader } from "~/loaders/ContentLoader";
import { shouldRevalidate } from "~/loaders/ContentShouldRevalidate";
import { ACTION_TYPES_CONTENT, type ContentResponse } from "~/models/content";
import type { ApiResponse } from "~/repositories/utils";
import { getUserInfo } from "../../server/cookie.server";

export const meta: MetaFunction = () => {
	return [{ title: "Contents" }, { name: "contents", content: "" }];
};

export { contentLoader as loader, shouldRevalidate };

export async function action({ request }: ActionFunctionArgs) {
	const { uid, username } = await getUserInfo(request);
	const formData = new URLSearchParams(await request.text());
	const intent = formData.get("_action");
	formData.append("uid", uid);
	formData.append("username", username);
	switch (intent) {
		case ACTION_TYPES_CONTENT.RENAME: {
			return renameContentAction(formData);
		}
		case ACTION_TYPES_CONTENT.DELETE: {
			return deleteContentAction(formData);
		}
		case ACTION_TYPES_CONTENT.CREATE_ASSET: {
			return createAssetAction(formData);
		}
		case ACTION_TYPES_CONTENT.PUBLISH: {
			return publicContentAction(formData);
		}
		case ACTION_TYPES_CONTENT.CREATE_ASSET_VISUALIZE: {
			return createAssetVisualizeAction(formData);
		}
		case ACTION_TYPES_CONTENT.PUBLISH_VISUALIZE: {
			return publicContentVisualizeAction(formData);
		}
		case ACTION_TYPES_CONTENT.CREATE_CHAT: {
			return createChatAction(formData);
		}
		case ACTION_TYPES_CONTENT.DUPLICATE: {
			return duplicateContentAction(formData);
		}
		case ACTION_TYPES_CONTENT.SAVE_METADATA: {
			return saveMetadataAction(formData);
		}
		default: {
			return json(
				{ status: false, error: jp.message.common.invalidActionType },
				{ status: 400 },
			);
		}
	}
}

export default function ContentPage() {
	const result = useLoaderData<ApiResponse<ContentResponse>>();
	if (result.status === false) {
		return <div>Error: {result.error}</div>;
	}

	return <ContentsPage data={result.data} />;
}
