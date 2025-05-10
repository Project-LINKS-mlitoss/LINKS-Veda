import type { ROLE } from "~/commons/core.const";

export interface AccountManagementI {
	id?: number;
	userId?: string;
	role?: ROLE;
	useCaseIds?: string;
	createdAt?: string;
	updatedAt?: string;
	deletedAt?: string;
}
