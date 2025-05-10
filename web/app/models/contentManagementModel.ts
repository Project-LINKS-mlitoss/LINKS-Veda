import type { CONTENT_MANAGEMENT_STATUS } from "~/commons/core.const";

export interface ContentManagementI {
	id?: number;
	assetId: string | null;
	assetUrl: string | null;
	parentContentId: string | null;
	name?: string;
	contentId: string;
	status?: string;
	username?: string;
	userId?: string;
	publicStatus?: CONTENT_MANAGEMENT_STATUS;
	createdAt?: Date | null | string;
	updatedAt?: Date | null | string;
	deletedAt?: Date | null | string;
}
