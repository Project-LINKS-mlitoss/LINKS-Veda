import { type ActionFunction, json } from "@remix-run/node";
import {
	type ContentSpatialJoin,
	type ContentTextMatching,
	type OptionsPreProcessing,
	type PREPROCESS_TYPE,
	SETTING_TYPE_CROSS_TAB,
	type SettingCrossTab,
	type SettingSpatialAggregateDetail,
} from "~/components/pages/Operators/types";
import { logger } from "~/logger";
import {
	ACTION_TYPES_OPERATOR,
	type Cleansing,
	type ContentI,
	type FilesArray,
	type GenSourceItem,
	type Geocoding,
	type InputType,
	type Masking,
	type RequestSpatialJoin,
	type SettingCrossTabRequest,
	type SettingSpatialAggregateRequest,
	type SettingTextMatching,
} from "~/models/operators";
import type { WorkflowDetail } from "~/models/templates";
import { ServiceFactory } from "~/services/serviceFactory";
import { getUserInfo } from "../../server/cookie.server";

const operatorsService = ServiceFactory.getOperatorService();

export const startWorkflowAction: ActionFunction = async ({ request }) => {
	const formData = new URLSearchParams(await request.text());
	const workflowDetailsJson = formData.get("workflowDetails") ?? "";
	const inputJson = formData.get("input") ?? "";
	const { uid, username } = await getUserInfo(request);

	let workflowDetails: WorkflowDetail[] = [];
	// biome-ignore lint/suspicious/noExplicitAny: FIXME
	let input: any | string;

	if (workflowDetailsJson) {
		workflowDetails = JSON.parse(workflowDetailsJson);
	}
	if (inputJson) {
		input = JSON.parse(inputJson);
	}

	const result = await operatorsService.createWorkflowDetailExecutions(
		workflowDetails,
		input,
		uid,
		username,
	);
	return json({
		...result,
		actionType: ACTION_TYPES_OPERATOR.START_WORKFLOW,
	});
};

export const generateAction: ActionFunction = async ({ request }) => {
	const formData = new URLSearchParams(await request.text());
	const assetId = formData.get("assetId") ?? "";
	const filesJson = formData.get("files") ?? "";
	const contentJson = formData.get("content") ?? "";
	const genSourceNameJson = formData.get("genSourceName") ?? "";
	const prompt = formData.get("prompt") ?? "";
	const typeOutput = formData.get("typeOutput") ?? "";
	const { uid, username } = await getUserInfo(request);

	let files: FilesArray = [];
	let content: ContentI = {
		type: "",
		properties: {},
	};
	let genSourceName: GenSourceItem[] = [];

	if (filesJson) {
		files = JSON.parse(filesJson);
	}
	if (contentJson) {
		content = JSON.parse(contentJson);
	}
	if (genSourceNameJson) {
		genSourceName = JSON.parse(genSourceNameJson);
	}

	const result = await operatorsService.generate(
		assetId as string,
		files as FilesArray,
		content as ContentI,
		genSourceName as GenSourceItem[],
		uid,
		username,
		prompt,
		typeOutput,
	);
	return json({
		...result,
		actionType: ACTION_TYPES_OPERATOR.GENERATE,
	});
};

export const generatePreProcessingAction: ActionFunction = async ({
	request,
}) => {
	const formData = new URLSearchParams(await request.text());
	const assetId = formData.get("assetId") ?? "";
	const contentId = formData.get("contentId") ?? "";
	const input = formData.get("input") ?? "";
	const inputType = formData.get("inputType") ?? "";
	const cleansingJson = formData.get("cleansing") ?? "";
	const preProcessType = formData.get("preProcessType") ?? "";
	const maskingJson = formData.get("masking") ?? "";
	const documentName = formData.get("documentName") ?? "";
	const geocodingJson = formData.get("geocoding") ?? "";
	const optionsJson = formData.get("options") ?? "";
	const { uid, username } = await getUserInfo(request);

	let cleansing: Cleansing = [];
	let masking: Masking = [];
	let geocoding: Geocoding = {
		fields: [],
	};
	let options: OptionsPreProcessing[] = [];

	if (cleansingJson) {
		cleansing = JSON.parse(cleansingJson);
	}
	if (maskingJson) {
		masking = JSON.parse(maskingJson);
	}
	if (geocodingJson) {
		geocoding = JSON.parse(geocodingJson);
	}
	if (optionsJson) {
		options = JSON.parse(optionsJson);
	}

	const result = await operatorsService.generatePreProcessing(
		assetId as string,
		contentId as string,
		input as string,
		inputType as InputType,
		cleansing,
		preProcessType as PREPROCESS_TYPE,
		masking,
		documentName,
		geocoding,
		options,
		uid,
		username,
	);
	return json({
		...result,
		actionType: ACTION_TYPES_OPERATOR.GENERATE,
	});
};

export const generateTextMatchingAction: ActionFunction = async ({
	request,
}) => {
	const formData = new URLSearchParams(await request.text());
	const contentIdLeft = formData.get("contentIdLeft") ?? "";
	const contentIdRight = formData.get("contentIdRight") ?? "";
	const settingTextMatchingJson = formData.get("settingTextMatching") ?? "";
	const contentJson = formData.get("contents") ?? "";
	const { uid, username } = await getUserInfo(request);

	let settingTextMatching: SettingTextMatching = {
		where: [],
	};
	if (settingTextMatchingJson) {
		settingTextMatching = JSON.parse(settingTextMatchingJson);
	}
	let content: ContentTextMatching[] = [];
	if (contentJson) {
		content = JSON.parse(contentJson);
	}

	const result = await operatorsService.generateTextMatching(
		contentIdLeft as string,
		contentIdRight as string,
		settingTextMatching,
		content,
		uid,
		username,
	);

	logger.info({
		message: "generateTextMatchingAction",
		error: JSON.stringify(result),
	});
	return json({
		...result,
		actionType: ACTION_TYPES_OPERATOR.GENERATE,
	});
};

export const generateSpatialJoinAction: ActionFunction = async ({
	request,
}) => {
	const formData = new URLSearchParams(await request.text());
	const requestSpatialJoinJson = formData.get("requestSpatialJoin") ?? "";
	const contentJson = formData.get("contents") ?? "";
	const { uid, username } = await getUserInfo(request);

	let requestSpatialJoin: RequestSpatialJoin = {
		inputLeft: "",
		inputRight: "",
		op: "nearest",
	};
	if (requestSpatialJoinJson) {
		requestSpatialJoin = JSON.parse(requestSpatialJoinJson);
	}
	let content: ContentSpatialJoin[] = [];
	if (contentJson) {
		content = JSON.parse(contentJson);
	}

	const result = await operatorsService.generateSpatialJoin(
		requestSpatialJoin,
		content,
		uid,
		username,
	);

	logger.info({
		message: "generateTextMatchingAction",
		error: JSON.stringify(result),
	});
	return json({
		...result,
		actionType: ACTION_TYPES_OPERATOR.GENERATE,
	});
};

export const generateCrossTabAction: ActionFunction = async ({ request }) => {
	const formData = new URLSearchParams(await request.text());
	const inputId = formData.get("inputId") ?? "";
	const settingCrossTabRequestJson =
		formData.get("settingCrossTabRequest") ?? "";
	const settingJson = formData.get("setting") ?? "";
	const { uid, username } = await getUserInfo(request);

	let settingCrossTabRequest: SettingCrossTabRequest = {
		keyFields: [],
		fields: [],
	};
	if (settingCrossTabRequestJson) {
		settingCrossTabRequest = JSON.parse(settingCrossTabRequestJson);
	}
	let setting: SettingCrossTab = {
		type: SETTING_TYPE_CROSS_TAB.TOTAL_AVERAGE,
		data: {
			columnUnit: [],
			columnTarget: [],
		},
	};
	if (settingJson) {
		setting = JSON.parse(settingJson);
	}

	const result = await operatorsService.generateCrossTab(
		inputId as string,
		settingCrossTabRequest,
		setting,
		uid,
		username,
	);
	return json({
		...result,
		actionType: ACTION_TYPES_OPERATOR.GENERATE,
	});
};

export const generateSpatialAggregationAction: ActionFunction = async ({
	request,
}) => {
	const formData = new URLSearchParams(await request.text());
	const settingDetailJson = formData.get("settingDetail") ?? "";
	const settingSpatialAggregateRequestJson =
		formData.get("settingSpatialAggregateRequest") ?? "";
	const { uid, username } = await getUserInfo(request);

	let settingSpatialAggregateRequest: SettingSpatialAggregateRequest = {
		keyFields: [],
		fields: [],
		inputLeft: "",
		inputRight: "",
	};
	if (settingSpatialAggregateRequestJson) {
		settingSpatialAggregateRequest = JSON.parse(
			settingSpatialAggregateRequestJson,
		);
	}
	let setting: SettingSpatialAggregateDetail = {
		content: undefined,
		setting: {
			type: SETTING_TYPE_CROSS_TAB.TOTAL_AVERAGE,
			data: {
				columnUnit: [],
				columnTarget: [],
			},
		},
	};
	if (settingDetailJson) {
		setting = JSON.parse(settingDetailJson);
	}

	const result = await operatorsService.generateSpatialAggregate(
		settingSpatialAggregateRequest,
		setting,
		uid,
		username,
	);
	return json({
		...result,
		actionType: ACTION_TYPES_OPERATOR.GENERATE,
	});
};

export const renameContentAction = async (formData: URLSearchParams) => {
	const contentId = formData.get("contentId");
	const name = formData.get("name");
	const operatorType = formData.get("operatorType");
	const operatorId = formData.get("operatorId");
	const result = await operatorsService.editContentName(
		contentId as string,
		name as string,
		operatorType as string,
		Number(operatorId),
	);
	return json({
		...result,
		actionType: ACTION_TYPES_OPERATOR.RENAME,
	});
};

export const suggestionAction: ActionFunction = async ({ request }) => {
	const formData = new URLSearchParams(await request.text());
	const input = formData.get("input") ?? "";

	const result = await operatorsService.suggestion(input);
	return json({
		...result,
		actionType: ACTION_TYPES_OPERATOR.SUGGESTION,
	});
};
