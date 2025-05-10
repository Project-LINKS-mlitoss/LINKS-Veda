export interface ContentAssetCreationLogI {
	id?: number;
	assetId: string | null;
	assetUrl: string | null;
	contentId?: string;
	status?: number;
	username?: string;
	userId?: string;
	createdAt?: Date | null | string;
	updatedAt?: Date | null | string;
	deletedAt?: Date | null | string;
}
