import type { ContentAssetCreationLogI } from "~/models/contentAssetCreationLogModel";
import type { Asset } from "./asset";
import type { Content } from "./content";
import type {
	ContentConfig,
	CrossTabContentConfigs,
	PreprocessContentConfigs,
	SpatialAggregationContentConfigs,
	SpatialJoinContentConfigs,
	TextMatchingContentConfigs,
} from "./operators";

export type ProcessingStatusResponse = {
	contentConfigs: ContentConfig[];
	preprocessContentConfigs: PreprocessContentConfigs[];
	textMatchingContentConfigs: TextMatchingContentConfigs[];
	crossJoinContentConfigs: CrossTabContentConfigs[];
	spatialJoinContentConfigs: SpatialJoinContentConfigs[];
	spatialAggregateContentConfigs: SpatialAggregationContentConfigs[];
	contentAssetCreationLogs: ContentAssetCreationLogI[];
};

export enum PREPROCESSING_TYPE {
	CONTENT_CONFIGS = "contentConfigs",
	PREPROCESS_CONTENT_CONFIGS = "preprocessContentConfigs",
	TEXT_MATCHING_CONTENT_CONFIGS = "textMatchingContentConfigs",
	CROSS_JOIN_CONTENT_CONFIGS = "crossJoinContentConfigs",
	SPATIAL_JOIN_CONTENT_CONFIGS = "spatialJoinContentConfigs",
	SPATIAL_AGGREGATE_CONTENT_CONFIGS = "spatialAggregateContentConfigs",
	CONTENT_CREATION = "contentCreation",
}

export enum PREPROCESSING_TYPE_FOLLOW_OPERATOR_TYPE {
	dataStructure = "contentConfigs",
	preProcessing = "preprocessContentConfigs",
	textMatching = "textMatchingContentConfigs",
	crossTab = "crossJoinContentConfigs",
	spatialJoin = "spatialJoinContentConfigs",
	spatialAggregate = "spatialAggregateContentConfigs",
}

export enum OPERATOR_TYPE_FOLLOW_PREPROCESSING_TYPE {
	contentConfigs = "dataStructure",
	preprocessContentConfigs = "preProcessing",
	textMatchingContentConfigs = "textMatching",
	crossJoinContentConfigs = "crossTab",
	spatialJoinContentConfigs = "spatialJoin",
	spatialAggregateContentConfigs = "spatialAggregate",
}

export enum PREPROCESSING_TYPE_JAPAN {
	contentConfigs = "データ構造化",
	preprocessContentConfigs = "結合前処理",
	textMatchingContentConfigs = "テキストマッチング",
	crossJoinContentConfigs = "クロス集計",
	spatialJoinContentConfigs = "空間結合処理",
	spatialAggregateContentConfigs = "空間集計処理",
	contentCreation = "データ作成",
}

export type ProcessingStatusTypeAnd = {
	operatorType: PREPROCESSING_TYPE;
	inputDetail: Asset | Content;
	createdBy?: string;
};

export type ProcessingStatusType =
	| ContentConfig
	| PreprocessContentConfigs
	| TextMatchingContentConfigs
	| CrossTabContentConfigs
	| SpatialJoinContentConfigs
	| SpatialAggregationContentConfigs
	| ContentAssetCreationLogI;

export type DataTableProcessingStatusType = ProcessingStatusType &
	ProcessingStatusTypeAnd;

export type DataTableProcessingStatusTypeArray = {
	data: DataTableProcessingStatusType[];
	totalCount: number;
};
export interface ProcessingStatusParams {
	page?: number;
	perPage?: number;
	keyword?: string;
}

export enum CONTENT_ASSET_TYPE {
	OPEN_DATA = "open-data",
	VISUALIZE = "visualize",
}
