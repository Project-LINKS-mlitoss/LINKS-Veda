import type { JsonValue } from "@prisma/client/runtime/library";
import type { ContentItem } from "./content";

export enum ACTION_TYPES_DATASET {
	DELETE = "delete",
	SAVE = "save",
	UPLOADFILE = "upload-file",
}

export type DatasetT = {
	id: number;
	name: string;
	isPublish: boolean;
	useCaseId: number;
	packageId?: string | null;
	metaData: JsonValue;
	assetId?: string | null;
	assetUrl?: string | null;
	resourceMarkdownId?: string | null;
	createdAt: string | Date;
	updatedAt?: string | Date | null;
	deletedAt?: string | Date | null;
	contents?: (ContentItem | null)[];
	datasetContentManagements?: DatasetContentManagementT[] | [];
};

export type DatasetContentManagementT = {
	id: number;
	contentId: string;
	contentManagementId: number | null;
	contentVisualizeId: number | null;
	datasetId: number;
	resourceId?: string | null;
	createdAt: string | Date;
	updatedAt?: string | Date | null;
	deletedAt?: string | Date | null;
};

export type SaveDatasetDatabaseT = {
	name: string;
	isPublish: boolean;
	useCaseId: number;
	packageId?: string | null;
	metaData: JsonValue;
};

export type DatasetResponse = { data: DatasetT[]; totalCount: number };

export interface DatasetParams {
	keyword?: string;
	page?: number;
	perPage?: number;
}
