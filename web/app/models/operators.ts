import type { JsonValue } from "@prisma/client/runtime/library";
import type { CONTENT_CALLBACK_API_STATUS } from "~/commons/core.const";
import type { MbFile } from "~/repositories/mbRepository";
import type { WorkflowT } from "./templates";

export enum ACTION_TYPES_OPERATOR {
	GENERATE = "generate",
	RENAME = "rename",
	SAVE = "save",
	START_WORKFLOW = "start-workflow",
	SUGGESTION = "suggestion",
}

export enum GENERATE_TYPE {
	DATA_STRUCTURE = "data-structure",
	PREPROCESSING = "preprocessing",
	TEXT_MATCHING = "text-matching",
	CROSS_TAB = "cross-tab",
	SPATIAL_JOIN = "spatial-join",
	SPATIAL_AGGREGATE = "spatial-aggregate",
}
export interface FileItem {
	id: string;
	url: string;
}

export type FilesArray = FileItem[];

export interface Properties {
	[key: string]: {
		type: string;
		title?: string;
		position?: string;
		unit?: string;
		keyword: string;
		description?: string;
	};
}

export interface ContentI {
	type: string;
	properties: Properties;
}

export interface GenSourceItem {
	type: string;
	target: string;
}

export interface ContentConfig {
	id: number;
	assetId: string;
	fileIds: JsonValue;
	configJson: JsonValue;
	ticketId: string;
	modelId: string;
	status: CONTENT_CALLBACK_API_STATUS;
	schemaId: string;
	createdAt: string | Date;
	updatedAt: string | Date | null;
	deletedAt: string | Date | null;
	error?: MbFile[];
	// biome-ignore lint/suspicious/noExplicitAny: FIXME
	workflowDetailExecution?: any;
	workflow?: WorkflowT;
	// biome-ignore lint/suspicious/noExplicitAny: FIXME
	workflowDetailExecutionNextStep?: any;
}

// pre-process
export interface PreprocessContentConfigs {
	id: number;
	inputId: string;
	inputType: string;
	outputType: string;
	configJson: JsonValue;
	ticketId: string;
	modelId: string;
	status: CONTENT_CALLBACK_API_STATUS;
	schemaId: string;
	createdAt: string | Date;
	updatedAt: string | Date | null;
	deletedAt: string | Date | null;
	error?: MbFile[];
	// biome-ignore lint/suspicious/noExplicitAny: FIXME
	workflowDetailExecution?: any;
	workflow?: WorkflowT;
	// biome-ignore lint/suspicious/noExplicitAny: FIXME
	workflowDetailExecutionNextStep?: any;
}

export type InputType = "json" | "shapefile" | "geojson" | "csv";

export type Condition = "comma" | "fullspace" | "halfspace" | "tab";

export type CleansingOp =
	| {
			type: "delete";
			fields: string[];
			target: string;
			condition: Condition;
	  }
	| {
			type: "replace";
			field: string;
			target: string;
			replace: string;
	  }
	| {
			type: "normalize";
			field: string;
			dataType: string;
	  }
	| {
			type: "missing";
			target: string;
	  };

export type MaskingOp =
	| {
			type: "ranking";
			field: string;
			max_rank: number;
			rankRanges?: {
				min?: number | null;
				max?: number | null;
			}[];
	  }
	| {
			type: "masking_id";
			field: string;
			prefix?: string;
	  }
	| {
			type: "masking_address";
			field: string;
	  };

export type Cleansing = CleansingOp[];
export type Masking = MaskingOp[];

export type Geocoding = {
	fields: string[];
};

export enum InputTypeDB {
	ASSET = "asset",
	CONTENT = "content",
}

export interface BodyTypeProPrecess {
	input: string;
	inputType: string;
	normalizeCrs: boolean;
	documentName: string;
	prompt?: string;
	apiEndpoint: string;
	cleansing?: Cleansing;
	geocoding?: Geocoding;
}

export interface BodyTypeProPrecessMasking {
	input: string;
	option: Masking;
	apiEndpoint: string;
}

// text matching
export type SettingTextMatching = {
	where: {
		leftField: string;
		rightField: string;
	}[];
	keepRightFields?: string[];
};

export interface TextMatchingContentConfigs {
	id: number;
	leftContentId: string;
	rightContentId: string;
	configJson: JsonValue;
	ticketId: string;
	modelId: string;
	schemaId: string;
	status: number;
	createdAt: string | Date;
	updatedAt: string | Date | null;
	deletedAt: string | Date | null;
	error?: MbFile[];
	// biome-ignore lint/suspicious/noExplicitAny: FIXME
	workflowDetailExecution?: any;
	workflow?: WorkflowT;
	// biome-ignore lint/suspicious/noExplicitAny: FIXME
	workflowDetailExecutionNextStep?: any;
}

// spatial join
export interface SpatialJoinContentConfigs {
	id: number;
	leftContentId: string;
	rightContentId: string;
	configJson: JsonValue;
	ticketId: string;
	modelId: string;
	schemaId: string;
	status: number;
	createdAt: string | Date;
	updatedAt: string | Date | null;
	deletedAt: string | Date | null;
	error?: MbFile[];
	// biome-ignore lint/suspicious/noExplicitAny: FIXME
	workflowDetailExecution?: any;
	workflow?: WorkflowT;
	// biome-ignore lint/suspicious/noExplicitAny: FIXME
	workflowDetailExecutionNextStep?: any;
}

export type RequestSpatialJoin = {
	inputLeft: string;
	inputRight: string;
	op: "intersects" | "nearest";
	distance?: number | null;
	keepRightFields?: string[];
};

// cross tab
export type SettingCrossTabRequest = {
	keyFields: string[];
	fields: FieldsCrossTabToMB[];
};

export interface CrossTabContentConfigs {
	id: number;
	inputContentId: string;
	outputType: string | null;
	configJson: JsonValue;
	ticketId: string;
	modelId: string;
	schemaId: string;
	status: number;
	createdAt: string | Date;
	updatedAt: string | Date | null;
	deletedAt: string | Date | null;
	error?: MbFile[];
	// biome-ignore lint/suspicious/noExplicitAny: FIXME
	workflowDetailExecution?: any;
	workflow?: WorkflowT;
	// biome-ignore lint/suspicious/noExplicitAny: FIXME
	workflowDetailExecutionNextStep?: any;
}

export type FieldsCrossTabToMB = {
	name: string;
	sum: boolean;
	avg: boolean;
	cnt: boolean;
};

export type RequestCrossTabToMB = {
	input: string;
	keyFields: string[];
	fields: FieldsCrossTabToMB[];
	apiEndpoint: string;
};

// Spatial Aggregate
export interface SpatialAggregationContentConfigs {
	id: number;
	leftContentId: string;
	rightContentId: string;
	configJson: JsonValue;
	ticketId: string;
	modelId: string;
	schemaId: string;
	status: number;
	createdAt: string | Date;
	updatedAt: string | Date | null;
	deletedAt: string | Date | null;
	error?: MbFile[];
	// biome-ignore lint/suspicious/noExplicitAny: FIXME
	workflowDetailExecution?: any;
	workflow?: WorkflowT;
	// biome-ignore lint/suspicious/noExplicitAny: FIXME
	workflowDetailExecutionNextStep?: any;
}

export type SettingSpatialAggregateRequest = {
	inputLeft: string;
	inputRight: string;
	keyFields: string[];
	fields: FieldsCrossTabToMB[];
};

export interface ContentItemConfidenceI {
	id: number;
	itemId: string;
	fieldId: string;
	confidence: number;
	createdAt: string | Date;
	updatedAt: string | Date | null;
	deletedAt: string | Date | null;
}

export enum OPERATOR_TYPE_JAPAN {
	contentConfigs = "データ構造化",
	preprocessContentConfigs = "結合前処理",
	textMatchingContentConfigs = "テキストマッチング",
	crossJoinContentConfigs = "クロス集計",
	spatialJoinContentConfigs = "空間結合処理",
	spatialAggregateContentConfigs = "空間集計処理",
}
