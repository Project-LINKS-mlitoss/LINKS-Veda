import { type ActionFunction, json } from "@remix-run/node";
import {
	type ContentSpatialJoin,
	type ContentTextMatching,
	type OptionsPreProcessing,
	PREPROCESS_TYPE,
	SETTING_TYPE_CROSS_TAB,
	type SettingCrossTab,
	type SettingSpatialAggregateDetail,
} from "~/components/pages/Operators/types";
import {
	ACTION_TYPES_OPERATOR,
	type Cleansing,
	type ContentI,
	type GenSourceItem,
	type Geocoding,
	type Masking,
	type RequestSpatialJoin,
	type SettingCrossTabRequest,
	type SettingSpatialAggregateRequest,
	type SettingTextMatching,
} from "~/models/operators";
import { ACTION_TYPES_TEMPLATE, type WorkflowListT } from "~/models/templates";
import { ServiceFactory } from "~/services/serviceFactory";

const templateService = ServiceFactory.getTemplateService();

export const deleteTemplateAction = async (formData: URLSearchParams) => {
	const templateId = formData.get("templateId");
	const isWorkflow = JSON.parse(formData.get("isWorkflow") ?? "");

	const result = isWorkflow
		? await templateService.deleteWorkflow(Number(templateId))
		: await templateService.deleteTemplate(Number(templateId));
	return json({
		...result,
		actionType: ACTION_TYPES_TEMPLATE.DELETE,
	});
};

export const saveWorkflow: ActionFunction = async ({ request, params }) => {
	const workflowId = params.workflowId;
	const formData = new URLSearchParams(await request.text());
	const workflowName = formData.get("workflowName") ?? "";
	const stepWorkflowJson = formData.get("stepWorkflow") ?? "";

	let stepWorkflow: WorkflowListT[] = [];
	if (stepWorkflowJson) stepWorkflow = JSON.parse(stepWorkflowJson);

	const data = {
		workflowName,
		stepWorkflow,
	};

	const result = workflowId
		? await templateService.updateWorkflow(Number(workflowId), data)
		: await templateService.saveWorkflow(data);

	return json({
		...result,
		actionType: ACTION_TYPES_OPERATOR.SAVE,
	});
};

export const saveTemplateDataStructure: ActionFunction = async ({
	request,
}) => {
	const formData = new URLSearchParams(await request.text());
	const templateId = formData.get("templateId") ?? "";
	const templateName = formData.get("templateName") ?? "";
	const prompt = formData.get("prompt") ?? "";
	const typeOutput = formData.get("typeOutput") ?? "";
	const contentJson = formData.get("content") ?? "";
	const genSourceNameJson = formData.get("genSourceName") ?? "";

	let content: ContentI = { type: "", properties: {} };
	let genSourceName: GenSourceItem[] = [];

	if (contentJson) content = JSON.parse(contentJson);
	if (genSourceNameJson) genSourceName = JSON.parse(genSourceNameJson);

	const templateData = {
		templateName,
		content,
		genSourceName,
		prompt,
		typeOutput,
	};

	const result = templateId
		? await templateService.updateTemplateDataStructure(
				Number(templateId),
				templateData,
			)
		: await templateService.saveTemplateDataStructure(templateData);

	return json({
		...result,
		actionType: ACTION_TYPES_OPERATOR.SAVE,
	});
};

export const saveTemplatePreProcessing: ActionFunction = async ({
	request,
}) => {
	const formData = new URLSearchParams(await request.text());
	const templateId = formData.get("templateId") ?? "";
	const templateName = formData.get("templateName") ?? "";
	const cleansingJson = formData.get("cleansing") ?? "";
	const preProcessType =
		(formData.get("preProcessType") as PREPROCESS_TYPE) ??
		PREPROCESS_TYPE.CLEANING;
	const maskingJson = formData.get("masking") ?? "";
	const documentName = formData.get("documentName") ?? "";
	const geocodingJson = formData.get("geocoding") ?? "";
	const optionsJson = formData.get("options") ?? "";

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

	const templateData = {
		templateName,
		cleansing,
		preProcessType,
		masking,
		documentName,
		geocoding,
		options,
	};

	const result = templateId
		? await templateService.updateTemplatePreProcessing(
				Number(templateId),
				templateData,
			)
		: await templateService.saveTemplatePreProcessing(templateData);

	return json({
		...result,
		actionType: ACTION_TYPES_OPERATOR.SAVE,
	});
};

export const saveTemplateTextMatching: ActionFunction = async ({ request }) => {
	const formData = new URLSearchParams(await request.text());
	const templateId = formData.get("templateId") ?? "";
	const templateName = formData.get("templateName") ?? "";

	const settingTextMatchingJson = formData.get("settingTextMatching") ?? "";
	const contentJson = formData.get("contents") ?? "";

	let settingTextMatching: SettingTextMatching = {
		where: [],
	};
	if (settingTextMatchingJson) {
		settingTextMatching = JSON.parse(settingTextMatchingJson);
	}
	let contents: ContentTextMatching[] = [];
	if (contentJson) {
		contents = JSON.parse(contentJson);
	}

	const templateData = {
		templateName,
		settingTextMatching,
		contents,
	};

	const result = templateId
		? await templateService.updateTemplateTextMatching(
				Number(templateId),
				templateData,
			)
		: await templateService.saveTemplateTextMatching(templateData);

	return json({
		...result,
		actionType: ACTION_TYPES_OPERATOR.SAVE,
	});
};

export const saveTemplateCrossTab: ActionFunction = async ({ request }) => {
	const formData = new URLSearchParams(await request.text());
	const templateId = formData.get("templateId") ?? "";
	const templateName = formData.get("templateName") ?? "";

	const settingCrossTabRequestJson =
		formData.get("settingCrossTabRequest") ?? "";
	const settingJson = formData.get("setting") ?? "";

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

	const templateData = {
		templateName,
		settingCrossTabRequest,
		setting,
	};

	const result = templateId
		? await templateService.updateTemplateCrossTab(
				Number(templateId),
				templateData,
			)
		: await templateService.saveTemplateCrossTab(templateData);

	return json({
		...result,
		actionType: ACTION_TYPES_OPERATOR.SAVE,
	});
};

export const saveTemplateSpatialJoin: ActionFunction = async ({ request }) => {
	const formData = new URLSearchParams(await request.text());
	const templateId = formData.get("templateId") ?? "";
	const templateName = formData.get("templateName") ?? "";

	const requestSpatialJoinJson = formData.get("requestSpatialJoin") ?? "";
	const contentsJson = formData.get("contents") ?? "";

	let requestSpatialJoin: RequestSpatialJoin = {
		inputLeft: "",
		inputRight: "",
		op: "nearest",
	};
	if (requestSpatialJoinJson) {
		requestSpatialJoin = JSON.parse(requestSpatialJoinJson);
	}
	let contents: ContentSpatialJoin[] = [];
	if (contentsJson) {
		contents = JSON.parse(contentsJson);
	}

	const templateData = {
		templateName,
		requestSpatialJoin,
		contents,
	};

	const result = templateId
		? await templateService.updateTemplateSpatialJoin(
				Number(templateId),
				templateData,
			)
		: await templateService.saveTemplateSpatialJoin(templateData);

	return json({
		...result,
		actionType: ACTION_TYPES_OPERATOR.SAVE,
	});
};

export const saveTemplateSpatialAggregation: ActionFunction = async ({
	request,
}) => {
	const formData = new URLSearchParams(await request.text());
	const templateId = formData.get("templateId") ?? "";
	const templateName = formData.get("templateName") ?? "";

	const settingDetailJson = formData.get("settingDetail") ?? "";
	const settingSpatialAggregateRequestJson =
		formData.get("settingSpatialAggregateRequest") ?? "";

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
	let settingDetail: SettingSpatialAggregateDetail = {
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
		settingDetail = JSON.parse(settingDetailJson);
	}

	const templateData = {
		templateName,
		settingSpatialAggregateRequest,
		settingDetail,
	};

	const result = templateId
		? await templateService.updateTemplateSpatialAggregation(
				Number(templateId),
				templateData,
			)
		: await templateService.saveTemplateSpatialAggregation(templateData);

	return json({
		...result,
		actionType: ACTION_TYPES_OPERATOR.SAVE,
	});
};
