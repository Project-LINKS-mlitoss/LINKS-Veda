import type {
	RESOURCE_PERMISSION_ROLE,
	RESOURCE_PERMISSION_TYPE,
} from "~/commons/core.const";

export interface ResourcePermissionI {
	id?: number;
	userId: string;
	username: string;
	resourceType: RESOURCE_PERMISSION_TYPE;
	resourceId: string;
	role: RESOURCE_PERMISSION_ROLE;
	createdAt?: string;
	updatedAt?: string;
	deletedAt?: string;
}

export interface ResourcePermissionConditions {
	userId?: string;
	resourceType?: RESOURCE_PERMISSION_TYPE;
	resourceId?: string;
	role?: RESOURCE_PERMISSION_ROLE;
}
