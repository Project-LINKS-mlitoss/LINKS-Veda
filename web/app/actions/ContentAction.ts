import { json } from "@remix-run/node";
import { CONTENT_MANAGEMENT_PUBLISH } from "~/commons/core.const";
import jp from "~/commons/locales/jp";
import type {
	RenderContentField,
	TableItem,
} from "~/components/pages/Content/types";
import {
	ACTION_TYPES_CONTENT,
	CONTENT_ASSET_TYPE,
	type ContentItem,
} from "~/models/content";
import type { ItemModel } from "~/models/items";
import { ServiceFactory } from "~/services/serviceFactory";

const contentService = ServiceFactory.getContentService();

export const deleteContentAction = async (formData: URLSearchParams) => {
	const contentIdsJson = formData.get("contentIds");
	const userUid = formData.get("uid") ?? "-1";
	let contentIds: string[] = [];
	if (contentIdsJson) {
		try {
			contentIds = JSON.parse(contentIdsJson);
		} catch (error) {
			return json(
				{ status: false, error: jp.message.content.invalidContentId },
				{ status: 400 },
			);
		}
	}
	const result = await contentService.deleteContents(contentIds, userUid);
	return json({
		...result,
		actionType: ACTION_TYPES_CONTENT.DELETE,
	});
};

export const renameContentAction = async (formData: URLSearchParams) => {
	const contentId = formData.get("contentId");
	const name = formData.get("name");
	const result = await contentService.editContentName(
		contentId as string,
		name as string,
	);
	return json({
		...result,
		actionType: ACTION_TYPES_CONTENT.RENAME,
	});
};

export const patchContentItems = async ({
	renderFields,
	renderItems,
	contentDetail,
	items,
}: {
	renderFields: RenderContentField[];
	renderItems: TableItem[];
	contentDetail: ContentItem;
	items: ItemModel[];
}) => {
	const result = await contentService.patchContentItems({
		renderFields,
		renderItems,
		contentDetail: contentDetail,
		items,
	});
	return json({
		...result,
		actionType: ACTION_TYPES_CONTENT.SAVE,
	});
};

export const createAssetAction = async (formData: URLSearchParams) => {
	const contentId = formData.get("contentId") ?? "";
	const uid = formData.get("uid") ?? "";
	const username = formData.get("username") ?? "";
	const metaData = JSON.parse(formData.get("metaData") ?? "");
	const result = await contentService.createContentAsset(
		contentId,
		metaData,
		uid,
		username,
		CONTENT_ASSET_TYPE.MANAGEMENT,
	);
	return json({
		...result,
		actionType: ACTION_TYPES_CONTENT.CREATE_ASSET,
	});
};

export const publicContentAction = async (formData: URLSearchParams) => {
	const contentId = formData.get("contentId") ?? "";
	const isPublish =
		formData.get("isPublish") ?? CONTENT_MANAGEMENT_PUBLISH.PUBLISH;
	const result = await contentService.publishContent(
		contentId,
		isPublish as CONTENT_MANAGEMENT_PUBLISH,
		CONTENT_ASSET_TYPE.MANAGEMENT,
	);
	return json({
		...result,
		actionType: ACTION_TYPES_CONTENT.PUBLISH,
	});
};

export const createAssetVisualizeAction = async (formData: URLSearchParams) => {
	const contentId = formData.get("contentId") ?? "";
	const uid = formData.get("uid") ?? "";
	const username = formData.get("username") ?? "";
	const metaData = JSON.parse(formData.get("metaData") ?? "");
	const result = await contentService.createContentAsset(
		contentId,
		metaData,
		uid,
		username,
		CONTENT_ASSET_TYPE.VISUALIZE,
	);
	return json({
		...result,
		actionType: ACTION_TYPES_CONTENT.CREATE_ASSET_VISUALIZE,
	});
};

export const publicContentVisualizeAction = async (
	formData: URLSearchParams,
) => {
	const contentId = formData.get("contentId") ?? "";
	const isPublish =
		formData.get("isPublish") ?? CONTENT_MANAGEMENT_PUBLISH.PUBLISH;
	const result = await contentService.publishContent(
		contentId,
		isPublish as CONTENT_MANAGEMENT_PUBLISH,
		CONTENT_ASSET_TYPE.VISUALIZE,
	);
	return json({
		...result,
		actionType: ACTION_TYPES_CONTENT.PUBLISH_VISUALIZE,
	});
};

export const createChatAction = async (formData: URLSearchParams) => {
	const contentId = formData.get("contentId") ?? "";
	const uid = formData.get("uid") ?? "";
	const username = formData.get("username") ?? "";
	const result = await contentService.createContentChat(contentId, {
		uid,
		username,
	});
	return json({
		...result,
		actionType: ACTION_TYPES_CONTENT.CREATE_CHAT,
	});
};

export const duplicateContentAction = async (formData: URLSearchParams) => {
	const contentId = formData.get("contentId") ?? "";
	const name = formData.get("name") ?? "";
	const uid = formData.get("uid") ?? "";
	const username = formData.get("username") ?? "";
	const result = await contentService.duplicateContent(contentId, name, {
		uid,
		username,
	});
	return json({
		...result,
		actionType: ACTION_TYPES_CONTENT.DUPLICATE,
	});
};

export const saveMetadataAction = async (formData: URLSearchParams) => {
	const contentId = formData.get("contentId") ?? "";
	const uid = formData.get("uid") ?? "";
	const username = formData.get("username") ?? "";
	const metaData = JSON.parse(formData.get("metaData") ?? "");
	const result = await contentService.saveMetadata(
		contentId,
		metaData,
		uid,
		username,
	);
	return json({
		...result,
		actionType: ACTION_TYPES_CONTENT.SAVE_METADATA,
	});
};
