import type {
	CONTENT_IMPORT_STRATEGY_TYPE,
	CONTENT_MANAGEMENT_PUBLISH,
	CONTENT_MANAGEMENT_STATUS_TYPE,
} from "~/commons/core.const";
import type { ContentChatI } from "~/models/contentChatModel";
import type { ContentManagementI } from "~/models/contentManagementModel";
import type { ContentMetadataI } from "~/models/contentMetadataModel";
import type { ContentVisualizeI } from "~/models/contentVisualizesModel";
import type { DatasetContentManagementI } from "~/models/datasetContentManagementModel";
import type { PREPROCESSING_TYPE_FOLLOW_OPERATOR_TYPE } from "~/models/processingStatus";
import type { WorkflowT } from "~/models/templates";

export interface ContentField {
	id: string;
	type: string;
	key: string;
	required: boolean;
	multiple: boolean;
	// biome-ignore lint/suspicious/noExplicitAny: FIXME
	value?: any;
}

export interface ContentDetails {
	id: string;
	projectId: string;
	fields: ContentField[];
	TitleField?: string;
	createdAt: string;
}

export interface ContentItem {
	createdAt: string;
	createdBy?: string;
	description: string;
	id: string;
	key: string;
	lastModified: string;
	metadataSchemaId: string;
	metadataSchema: ContentDetails;
	visualize?: ContentVisualizeI;
	datasets?: DatasetContentManagementI[];
	name: string;
	projectId: string;
	public: boolean;
	schemaId: string;
	contentId: string;
	schema: ContentDetails;
	updatedAt: string;
	management?: ContentManagementI;
	workflowAndOperator?: WorkflowAndOperatorType | null;
	duplicateContent?: ContentManagementI;
	chat?: ContentChatI;
	metadata?: ContentMetadataI;
	types?: CONTENT_MANAGEMENT_STATUS_TYPE[];
}

export interface WorkflowAndOperatorType {
	workflow?: WorkflowT;
	operatorType: PREPROCESSING_TYPE_FOLLOW_OPERATOR_TYPE;
}

export interface ContentItemDetail {
	createdAt?: string;
	fields?: ContentField[];
	id?: string;
	isMetadata?: boolean;
	modelId?: string;
	parents?: string[];
	// biome-ignore lint/suspicious/noExplicitAny: FIXME
	referencedItems?: any;
	refs?: string[];
	updatedAt?: string;
	version?: string;
}

export interface ContentItemsResponse {
	items: ContentItemDetail[];
	page: number;
	perPage: number;
	totalCount: number;
}

export interface ContentResponse {
	models: ContentItem[];
	page: number;
	perPage: number;
	totalCount: number;
}

export class Content {
	createdAt: string;
	description: string;
	id: string;
	contentId: string;
	key: string;
	lastModified: string;
	metadataSchemaId: string;
	metadataSchema: ContentDetails;
	name: string;
	projectId: string;
	public: boolean;
	schemaId: string;
	schema: ContentDetails;
	updatedAt: string;

	constructor(props: ContentItem) {
		this.createdAt = props.createdAt;
		this.description = props.description;
		this.id = props.id;
		this.contentId = props.id;
		this.key = props.key;
		this.lastModified = props.lastModified;
		this.metadataSchemaId = props.metadataSchemaId;
		this.metadataSchema = props.metadataSchema;
		this.name = props.name;
		this.projectId = props.projectId;
		this.public = props.public;
		this.schemaId = props.schemaId;
		this.schema = props.schema;
		this.updatedAt = props.updatedAt;
	}
}

export interface ContentParams {
	page: number;
	perPage: number;
	keyword?: string;
	statusVisualize?: CONTENT_MANAGEMENT_PUBLISH;
	maxRecord?: boolean;
	operatorTypes?: string[];
	workflows?: string[];
}

export interface Feature {
	type: "Feature";
	// biome-ignore lint/suspicious/noExplicitAny: FIXME
	geometry: any;
	// biome-ignore lint/suspicious/noExplicitAny: FIXME
	properties: Record<string, any>;
}

export interface FeatureCollection {
	type: "FeatureCollection";
	features: Feature[];
	name: string;
	// biome-ignore lint/suspicious/noExplicitAny: FIXME
	crs: any;
}

export enum ACTION_TYPES_CONTENT {
	DELETE = "delete",
	RENAME = "rename",
	SAVE = "save",
	CREATE_ASSET = "create_asset",
	PUBLISH = "publish",
	CREATE_ASSET_VISUALIZE = "create_asset_visualize",
	PUBLISH_VISUALIZE = "publish_visualize",
	CREATE_CHAT = "create_chat",
	DUPLICATE = "duplicate",
	SAVE_METADATA = "save_metadata",
}

export enum CONTENT_ASSET_TYPE {
	VISUALIZE = "visualize",
	MANAGEMENT = "management",
}

export type ImportOptions = {
	format: "geojson" | "json";
	strategy: CONTENT_IMPORT_STRATEGY_TYPE;
	mutateSchema: boolean;
	geometryFieldKey?: string;
	assetId: string;
	asBackground?: boolean;
};
