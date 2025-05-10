export enum INPUT_TYPE {
	ASSET = "asset",
	SCHEMA = "schema",
	JSON = "json",
	GEOJSON = "geojson",
}
export enum OUTPUT_TYPE {
	JSON = "json",
	GEOJSON = "geojson",
}

export enum CONTENT_IMPORT_STRATEGY_TYPE {
	INSERT = "insert",
	UPDATE = "update",
	UPSERT = "upsert",
}

export enum CONTENT_FIELD_TYPE {
	GEO = "geometryObject",
}

export const DEFAULT_GEOMETRY_FIELD_KEY = "geometry";

export const DEFAULT_GEOMETRY_CRS = {
	type: "name",
	properties: { name: "urn:ogc:def:crs:OGC:1.3:CRS84" },
};

export enum CONTENT_CALLBACK_API_STATUS {
	CREATED = 1,
	IN_PROGRESS = 2,
	DONE = 3,
	SAVED = 4,
	FAILED = -1,
	PENDING_PROCESS = 5,
}

export const CONTENT_CALLBACK_API_STATUSES_NO_REFETCH = [
	CONTENT_CALLBACK_API_STATUS.FAILED,
	CONTENT_CALLBACK_API_STATUS.DONE,
	CONTENT_CALLBACK_API_STATUS.SAVED,
];

export enum MB_FILE_PROCESS_STATUS {
	COMPLETED = "Completed",
	PROCESSING = "Processing",
	PENDING = "Pending",
	FAILED = "Failed",
}

export enum MB_FILE_PROCESS_FUNCTION {
	STRUCTURE = "structure",
}

export enum RESOURCE_PERMISSION_ROLE {
	EDIT = 1,
	VIEW = 2,
}

export enum RESOURCE_PERMISSION_TYPE {
	ASSET = "asset",
	CONTENT = "content",
	OPERATOR = "operator",
}

export enum BATCH_SIZE {
	SMALL = 5,
	MEDIUM = 10,
	LARGE = 20,
}

export enum WORKFLOW_STATUS {
	CREATED = 1,
	IN_PROGRESS = 2,
	DONE = 3,
	FAILED = -1,
}

export enum CONTENT_MANAGEMENT_STATUS {
	IN_PROGRESS = 1,
}

export enum CONTENT_MANAGEMENT_STATUS_TYPE {
	PUBLIC = "public",
	CHAT = "chat",
	VISUALIZE = "visualize",
}

export enum CONTENT_MANAGEMENT_PUBLISH {
	PUBLISH = "publish",
	UN_PUBLISH = "un_publish",
}

export enum PROCESSING_STATUS {
	CREATED = 1,
	IN_PROGRESS = 2,
	DONE = 3,
	SAVED = 4,
	PENDING = 5,
	FAILED = -1,
}

export const OPERATOR_FETCH_TIMEOUT = 5000; // unit: millisecond

export type SelectRowIdT = { id: string; timestamp: number };

export const DEFAULT_SIZE = 100 / 3;
export const DEFAULT_SIZE_TOTAL = 100;
export const DEFAULT_SIZE_LEFT = 70;
export const DEFAULT_SIZE_RIGHT = 30;
export const DEFAULT_SIZE_LEFT_THIRD = 50;
export const DEFAULT_SIZE_CENTER_THIRD = 35;
export const DEFAULT_SIZE_RIGHT_THIRD = 15;

export const MIN_WIDTH_LEFT_CENTER = 200;
export const MIN_WIDTH_LEFT_CENTER_LARGE = 400;
export const MIN_WIDTH_RIGHT = 150;
export const MIN_WIDTHS = {
	minWidthLeftCenter: 0,
	minWidthRight: 0,
};

export enum ROLE {
	ADMIN = 1,
	VIEW = 2,
}

export enum CHAT_STATUS {
	CREATED = 1,
	IN_PROGRESS = 2,
	DONE = 3,
	FAILED = -1,
}

export const CHAT_CALLBACK_API_STATUSES_NO_REFETCH = [
	CHAT_STATUS.FAILED,
	CHAT_STATUS.DONE,
];

export const MAX_DISPLAY_FIELD = 50;

export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 50;

export const DEFAULT_REGION = "Asia/Tokyo";

export enum SORT_DIRECTION {
	ASC = "asc",
	DESC = "desc",
}
