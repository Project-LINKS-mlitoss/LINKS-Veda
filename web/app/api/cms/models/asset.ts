/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type asset = {
	id: string;
	projectId: string;
	name?: string;
	url: string;
	contentType?: string;
	previewType?:
		| "image"
		| "image_svg"
		| "geo"
		| "geo_3d_Tiles"
		| "geo_mvt"
		| "model_3d"
		| "csv"
		| "unknown";
	totalSize?: number;
	archiveExtractionStatus?: "pending" | "in_progress" | "done" | "failed";
	file?: any;
	createdAt: string;
	updatedAt: string;
};
