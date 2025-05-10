import jp from "~/commons/locales/jp";
import type { ContentItem } from "~/models/content";

export interface AssetTableRecord {
	key: string;
	asset: string;
	uploadTime: string;
	type: string;
	uploader: string;
}

export interface ContentTableRecord {
	key: string;
	content: string;
	updateTime: string;
	updateBy: string;
}

export type OptionColumnsT = {
	label: string;
	value: string;
};

export interface AdditionalAttributes {
	position: string;
	unit: string;
	keyword: string;
	description: string;
}

export interface ColumnData {
	id: string;
	name: string;
	type: string;
	additionalAttributes: AdditionalAttributes;
}

export interface TemplateColumnData {
	name: string;
	type: string;
	additionalAttributes: AdditionalAttributes;
}

export type ColumnConfident = {
	[key: string]: number;
};

export enum TYPE_OUTPUT {
	ARRAY = "array",
	OBJECT = "object",
}

// pre-process
export interface OptionBase {
	id: number;
	text: string;
	type: string;
	checked?: boolean;
	input1?: string;
	input2?: string;
	input3?: string;
	select?: string;
}

export interface DeleteOption extends OptionBase {
	type: "delete";
	text: "削除";
	isFirstOption: boolean;
	checked: boolean;
	input1: string;
	select: string;
	input2: string;
}

export interface ReplaceOption extends OptionBase {
	type: "replace";
	text: "置換";
	checked: boolean;
	input1: string;
	input2: string;
	input3: string;
}

export interface NormalizationOption extends OptionBase {
	type: "normalize";
	text: "表記ゆれの正規化";
	checked: boolean;
	input1: string;
	select: string;
}

export interface MissingOption extends OptionBase {
	type: "missing";
	text: "欠損値の処理";
	checked: boolean;
	input1: string;
	select: string;
	input2: string;
}

export interface DocumentNameOption extends OptionBase {
	type: "documentName";
	text: "資料名作成";
	input1: string;
}

export interface GeocodingOption extends OptionBase {
	type: "geocoding";
	text: "ジオコーディング";
	input1: string;
}

export interface RankingOption extends OptionBase {
	type: "ranking";
	text: "階層化・偏差値化";
	input1: string;
	select1: string;
	select2: number;
	rankRanges?: {
		min?: number | null;
		max?: number | null;
	}[];
}

export interface MaskingIdOption extends OptionBase {
	type: "maskingId";
	text: "新規ID付与";
	input1: string;
	input2: string;
}

export interface MaskingAddressOption extends OptionBase {
	type: "maskingAddress";
	text: "住所秘匿";
	input1: string;
}

export type OptionsPreProcessing =
	| DeleteOption
	| ReplaceOption
	| NormalizationOption
	| MissingOption
	| DocumentNameOption
	| GeocodingOption
	| RankingOption
	| MaskingIdOption
	| MaskingAddressOption;

export enum PreprocessOptions {
	DELETE = "delete",
	REPLACE = "replace",
	NORMALIZE = "normalize",
	MISSING = "missing",
	GEOCODING = "geocoding",
	DOCUMENT_NAME = "documentName",
	RANKING = "ranking",
	MASKING_ID = "maskingId",
	MASKING_ADDRESS = "maskingAddress",
}

export const MaskingTypes = [
	PreprocessOptions.RANKING,
	PreprocessOptions.MASKING_ID,
	PreprocessOptions.MASKING_ADDRESS,
];

export enum PREPROCESS_TYPE {
	CLEANING = "cleaning",
	MAKING = "making",
}

export const rankingTypeOptions = [
	{
		label: "自動採番",
		value: "自動採番",
	},
	{
		label: "手動採番",
		value: "手動採番",
	},
];

export const rankingRangeOptions = [
	{
		label: "2",
		value: 2,
	},
	{
		label: "3",
		value: 3,
	},
	{
		label: "4",
		value: 4,
	},
	{
		label: "5",
		value: 5,
	},
	{
		label: "6",
		value: 6,
	},
	{
		label: "7",
		value: 7,
	},
	{
		label: "8",
		value: 8,
	},
	{
		label: "9",
		value: 9,
	},
	{
		label: "10",
		value: 10,
	},
];

// text matching
export type ContentTextMatching = {
	content: ContentItem;
	column: {
		key: string;
		value: string;
	}[];
};

// cross tab
export type SettingDataType = {
	columnUnit: {
		id: number;
		value: string;
	}[];
	columnTarget: {
		id: number;
		name: string;
		cnt: boolean;
		sum: boolean;
		avg: boolean;
	}[];
};

export enum SETTING_TYPE_CROSS_TAB {
	TOTAL_AVERAGE = "TotalAverage",
	COUNT = "Count",
}

export type TotalAverage = {
	type: SETTING_TYPE_CROSS_TAB.TOTAL_AVERAGE;
	data: SettingDataType;
};

export type Count = {
	type: SETTING_TYPE_CROSS_TAB.COUNT;
	data: SettingDataType;
};

export type SettingCrossTab = TotalAverage | Count;

// spatial join
export enum SETTING_TYPE_SPATIAL_JOIN {
	NEAREST = "nearest",
	INTERSECTS = "intersects",
}

export type Nearest = {
	op: SETTING_TYPE_SPATIAL_JOIN.NEAREST;
	distance: number;
};

export type Intersects = {
	op: SETTING_TYPE_SPATIAL_JOIN.INTERSECTS;
	distance: null;
};

export type ContentSpatialJoin = {
	content: ContentItem;
	setting: Nearest | Intersects;
	column: {
		key: string;
		value: string;
	}[];
};

// Spatial Aggregate
export type SettingSpatialAggregateDetail = {
	content: ContentItem | undefined;
	setting: SettingCrossTab;
};

export const columnSelectedInput = [
	{
		title: jp.common.id,
		dataIndex: "id",
		key: "id",
	},
	{
		title: jp.asset.fileNameContent,
		dataIndex: "fileName",
		key: "fileName",
	},
	{
		title: jp.common.size,
		dataIndex: "size",
		key: "size",
	},
];

export enum ITEM_TYPE_COLLAPSE {
	COLUMN = "COLUMN",
	CONTEXT = "CONTEXT",
}

export const optionNormalize = [
	{
		value: "address",
		label: "住所",
	},
	{
		value: "datetime",
		label: "日時",
	},
	{
		value: "unitnum",
		label: "単位",
	},
];

export type OptionsSuggest = {
	value: string;
	label: string;
	description: string;
	type: string;
}[];

export enum VALID_TYPES {
	STRING = "string",
	NUMBER = "number",
	BOOLEAN = "boolean",
}

export const ValidType = Object.values(VALID_TYPES);
