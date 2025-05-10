import type { DatasetT } from "~/models/dataset";

export interface DatasetContentManagementI {
	id?: number;
	contentId: string;
	resourceId?: string;
	datasetId: string;
	contentManagementId: string;
	contentVisualizeId: string;
	createdAt?: string;
	updatedAt?: string;
	deletedAt?: string;
	dataset?: DatasetT;
}
