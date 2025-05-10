import { type ActionFunction, json } from "@remix-run/node";
import { METADATA_KEY } from "~/components/pages/Dataset/types";
import { UploadIntent } from "~/models/asset";
import type { ContentItem } from "~/models/content";
import {
	ACTION_TYPES_DATASET,
	type SaveDatasetDatabaseT,
} from "~/models/dataset";
import { ServiceFactory } from "~/services/serviceFactory";
import { getExtension } from "~/utils/file";

const datasetService = ServiceFactory.getDatasetService();
const assetService = ServiceFactory.getAssetService();

export const deleteDatasetAction = async (formData: URLSearchParams) => {
	const datasetIdsJson = formData.get("datasetIds");
	let datasetIds: number[] = [];
	if (datasetIdsJson) {
		datasetIds = JSON.parse(datasetIdsJson);
	}

	const result = await datasetService.deleteDatasets(datasetIds);

	return json({
		...result,
		actionType: ACTION_TYPES_DATASET.DELETE,
	});
};

export const uploadAction = async (formData: URLSearchParams) => {
	const userUid = formData.get("uid") ?? "-1";
	const username = formData.get("username") ?? "";
	const intent = formData.get("intent");
	const metadataKey = formData.get("metadataKey");
	const strItem = formData.get("item");

	if (strItem) {
		const item = JSON.parse(strItem);
		if (intent === UploadIntent.requestSignedUrls) {
			const result = await assetService.generateSignedUrls([item]);

			return json({
				intent: intent,
				status: result?.success,
				data: result.items[0],
				actionType: ACTION_TYPES_DATASET.UPLOADFILE,
			});
		}

		if (intent === UploadIntent.createAsset) {
			const result = await assetService.createAsset(item, userUid, username);
			const fileName = result.asset?.name ?? "";
			const isXlsxFile = getExtension(fileName) === "xlsx";
			if (
				!isXlsxFile ||
				!metadataKey ||
				![METADATA_KEY.METADATA, METADATA_KEY.CONTENT_METADATA].includes(
					metadataKey as METADATA_KEY,
				)
			)
				return json({
					intent: intent,
					error: result?.error,
					status: result?.success,
					data: result?.asset,
					actionType: ACTION_TYPES_DATASET.UPLOADFILE,
				});

			if (result.asset?.url) {
				const convertResult = await datasetService.convertFromXLSXToRDF(
					fileName,
					result.asset,
					{ uid: userUid, username: username },
				);
				return json({
					intent: intent,
					error: convertResult?.error,
					status: convertResult?.status,
					data: convertResult?.asset,
					actionType: ACTION_TYPES_DATASET.UPLOADFILE,
				});
			}
		}
	}

	return json({
		status: false,
		error: "",
		actionType: ACTION_TYPES_DATASET.UPLOADFILE,
	});
};

export const saveDataset: ActionFunction = async ({ request, params }) => {
	const datasetId = params.datasetId;
	const formData = new URLSearchParams(await request.text());
	const {
		userUid,
		username,
		saveDatasetDatabase,
		saveDatasetContentManagementDatabase,
	} = parseDatasetFormData(formData);

	const result = datasetId
		? await datasetService.updateDataset(
				Number(datasetId),
				saveDatasetDatabase,
				saveDatasetContentManagementDatabase,
				userUid,
				username,
			)
		: await datasetService.saveDataset(
				saveDatasetDatabase,
				saveDatasetContentManagementDatabase,
				userUid,
				username,
			);

	return json({
		...result,
		actionType: ACTION_TYPES_DATASET.SAVE,
	});
};

export const publishDataset = async (formData: URLSearchParams) => {
	const {
		userUid,
		username,
		saveDatasetDatabase,
		saveDatasetContentManagementDatabase,
	} = parseDatasetFormData(formData);

	const datasetId = formData.get("datasetId") ?? "";

	const result = await datasetService.updateDataset(
		Number(datasetId),
		saveDatasetDatabase,
		saveDatasetContentManagementDatabase,
		userUid,
		username,
	);

	return json({
		...result,
		actionType: ACTION_TYPES_DATASET.SAVE,
	});
};

function parseDatasetFormData(formData: URLSearchParams) {
	const userUid = formData.get("uid") ?? "-1";
	const username = formData.get("username") ?? "";
	const saveDatasetDatabaseJson = formData.get("saveDatasetDatabase") ?? "";
	const saveDatasetContentManagementDatabaseJson =
		formData.get("saveDatasetContentManagementDatabase") ?? "";

	let saveDatasetDatabase: SaveDatasetDatabaseT = {
		name: "",
		isPublish: false,
		useCaseId: 0,
		metaData: [],
	};
	if (saveDatasetDatabaseJson) {
		saveDatasetDatabase = JSON.parse(saveDatasetDatabaseJson);
	}

	let saveDatasetContentManagementDatabase: ContentItem[] = [];
	if (saveDatasetContentManagementDatabaseJson) {
		saveDatasetContentManagementDatabase = JSON.parse(
			saveDatasetContentManagementDatabaseJson,
		);
	}

	return {
		userUid,
		username,
		saveDatasetDatabase,
		saveDatasetContentManagementDatabase,
	};
}
