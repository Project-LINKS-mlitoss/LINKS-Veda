import type { JsonValue } from "@prisma/client/runtime/library";
import type {
	ContentSpatialJoin,
	ContentTextMatching,
	OptionsPreProcessing,
	PREPROCESS_TYPE,
	SettingCrossTab,
	SettingSpatialAggregateDetail,
} from "~/components/pages/Operators/types";
import { routes } from "~/routes/routes";
import type {
	Cleansing,
	ContentI,
	GenSourceItem,
	Geocoding,
	Masking,
	RequestSpatialJoin,
	SettingCrossTabRequest,
	SettingSpatialAggregateRequest,
	SettingTextMatching,
} from "./operators";

export enum ACTION_TYPES_TEMPLATE {
	DELETE = "delete",
	GENERATE = "generate",
	SAVE = "save",
}

export type TemplatesT = {
	id: number;
	name: string;
	operatorType: string | OPERATOR_TYPE;
	configJson: JsonValue;
	createdAt: string | Date;
	updatedAt: string | Date | null;
	deletedAt: string | Date | null;
};

export type WorkflowDetail = {
	id: number;
	workflowId: number;
	step: number;
	operatorType: string;
	configJson: JsonValue;
	createdAt: string | Date;
	updatedAt: string | Date | null;
	deletedAt: string | Date | null;
};

export type WorkflowT = {
	id: number | string;
	name: string;
	workflowDetails?: WorkflowDetail[];
	createdAt: string | Date;
	updatedAt: string | Date | null;
	deletedAt: string | Date | null;
};

export type WorkflowListT = {
	step: number;
	operatorType: string | OPERATOR_TYPE;
	configJson: JsonValue;
};

export type SaveWorkflowDBT = {
	workflowName: string;
	stepWorkflow: WorkflowListT[];
};

export type SaveTemplateDBT = {
	name: string;
	operatorType: string | OPERATOR_TYPE;
	configJson: JsonValue;
};

export type SaveTemplateDataStructureParamsT = {
	templateName: string;
	content: ContentI;
	genSourceName: GenSourceItem[];
	prompt: string;
	typeOutput: string;
};

export type SaveTemplatePreProcessingParamsT = {
	templateName: string;
	cleansing: Cleansing;
	preProcessType: PREPROCESS_TYPE;
	masking: Masking;
	documentName: string;
	geocoding: Geocoding;
	options: OptionsPreProcessing[];
};

export type SaveTemplateTextMatchingParamsT = {
	templateName: string;
	settingTextMatching: SettingTextMatching;
	contents: ContentTextMatching[];
};

export type SaveTemplateCrossTabParamsT = {
	templateName: string;
	settingCrossTabRequest: SettingCrossTabRequest;
	setting: SettingCrossTab;
};

export type SaveTemplateSpatialJoinParamsT = {
	templateName: string;
	requestSpatialJoin: RequestSpatialJoin;
	contents: ContentSpatialJoin[];
};

export type SaveTemplateSpatialAggregationParamsT = {
	templateName: string;
	settingSpatialAggregateRequest: SettingSpatialAggregateRequest;
	settingDetail: SettingSpatialAggregateDetail;
};

export type TemplatesResponse = TemplatesT[];

export interface TemplatesParams {
	keyword?: string;
	operatorType?: string | OPERATOR_TYPE;
}

export interface TemplateItem {
	type: OPERATOR_TYPE;
	icon: string;
	title: string;
	temps: TemplatesT[] | WorkflowT[];
}

export enum OPERATOR_TYPE {
	WORK_FLOW = "workFlow",
	DATA_STRUCTURE = "dataStructure",
	PRE_PROCESSING = "preProcessing",
	TEXT_MATCHING = "textMatching",
	CROSS_TAB = "crossTab",
	SPATIAL_JOIN = "spatialJoin",
	SPATIAL_AGGREGATE = "spatialAggregate",
}

export const OPERATOR_URL = {
	DATA_STRUCTURE: routes.operatorDataStructure,
	PRE_PROCESSING: routes.operatorPreProcessing,
	TEXT_MATCHING: routes.operatorTextMatching,
	CROSS_TAB: routes.operatorCrossTab,
	SPATIAL_JOIN: routes.operatorSpatialJoin,
	SPATIAL_AGGREGATE: routes.operatorSpatialAggregation,
	WORK_FLOW: "create",
} as const;

export const operatorTypeToUrlMap: Record<
	OPERATOR_TYPE,
	(typeof OPERATOR_URL)[keyof typeof OPERATOR_URL]
> = {
	[OPERATOR_TYPE.DATA_STRUCTURE]: OPERATOR_URL.DATA_STRUCTURE,
	[OPERATOR_TYPE.PRE_PROCESSING]: OPERATOR_URL.PRE_PROCESSING,
	[OPERATOR_TYPE.TEXT_MATCHING]: OPERATOR_URL.TEXT_MATCHING,
	[OPERATOR_TYPE.CROSS_TAB]: OPERATOR_URL.CROSS_TAB,
	[OPERATOR_TYPE.SPATIAL_JOIN]: OPERATOR_URL.SPATIAL_JOIN,
	[OPERATOR_TYPE.SPATIAL_AGGREGATE]: OPERATOR_URL.SPATIAL_AGGREGATE,
	[OPERATOR_TYPE.WORK_FLOW]: OPERATOR_URL.WORK_FLOW,
};
