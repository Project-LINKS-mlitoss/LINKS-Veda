import { json } from "@remix-run/node";
import jp from "~/commons/locales/jp";
import { UploadIntent, type UploadQueueItem } from "~/models/asset";
import { ServiceFactory } from "~/services/serviceFactory";

const assetService = ServiceFactory.getAssetService();

export const deleteAction = async (formData: URLSearchParams) => {
	const assetIdsJson = formData.get("assetIds");
	const userUid = formData.get("uid") ?? "-1";
	let assetIds: string[] = [];
	if (assetIdsJson) {
		try {
			assetIds = JSON.parse(assetIdsJson);
		} catch (error) {
			return json(
				{ status: false, error: jp.message.asset.invalidAssetId },
				{ status: 400 },
			);
		}
	}

	return await assetService.deleteAssets(assetIds, userUid);
};

export const uploadAction = async (formData: URLSearchParams) => {
	const intent = formData.get("intent");
	const userUid = formData.get("uid") ?? "-1";
	const username = formData.get("username") ?? "";
	const strItems = formData.get("items");
	if (strItems) {
		const items = JSON.parse(strItems);
		if (intent === UploadIntent.requestSignedUrls) {
			const result = await assetService.generateSignedUrls(items);

			return json({ intent: intent, data: result.items });
		}

		if (intent === UploadIntent.createAsset) {
			await Promise.all(
				items.map(async (item: UploadQueueItem) => {
					const result = await assetService.createAsset(
						item,
						userUid,
						username,
					);
				}),
			);
			return json({ intent: intent, status: true, data: items });
		}
	}

	return json({ success: false, data: undefined });
};
