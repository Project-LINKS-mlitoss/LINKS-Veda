import type { ContentDetails } from "./content";
export interface ModelItem {
	createdAt: string;
	id: string;
	key: string;
	lastModified: string;
	name: string;
	projectId: string;
	schema: ContentDetails;
	schemaId: string;
	updatedAt: string;
}
export interface ModelParams {
	page: number;
	perPage: number;
	sort: string;
	keyword: string;
}
export interface ModelResponse {
	models: ModelItem[];
	page: number;
	perPage: number;
	totalCount: number;
}
export enum ACTION_TYPES_MODEL {
	DELETE = "delete",
	RENAME = "rename",
	SAVE = "save",
}
