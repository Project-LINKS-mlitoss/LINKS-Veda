import type { ROLE } from "~/commons/core.const";
import type { AccountManagementI } from "~/models/accountManagementModel";

export type UserModel = {
	email: string;
	name: string;
	role: string;
	token: string;
	uid: string;
};

export type UserInfo = {
	username: string;
	uid: string;
};

export type AuthResponse = {
	success: boolean;
	error: string | undefined;
	user: UserModel | undefined;
};

export type SignOutResponse = {
	success: boolean;
	error: string | undefined;
};

export type ResetPasswordResponse = {
	success: boolean;
	error: string | undefined;
};

export type VerifyUserTokenResponse = {
	success: boolean;
	error: string | undefined;
	uid: string | undefined;
	email: string | undefined;
};

export type VerifyIdTokenResponse = {
	uid: string | undefined;
	email?: string | undefined;
};

export interface UserParams {
	pageToken?: string;
	perPage: number;
	keyword?: string;
}

export interface Metadata {
	lastSignInTime?: string;
	creationTime: string;
	lastRefreshTime?: string | null;
}

export interface ProviderData {
	uid: string;
	email: string;
	providerId: string;
}

export interface UserItem {
	id?: number;
	uid: string;
	email?: string;
	emailVerified: boolean;
	metadata: Metadata;
	tokensValidAfterTime?: string;
	disabled?: boolean;
	role?: ROLE;
	useCaseIds?: number[];
	useCases?: string[];
	providerData: ProviderData[];
}

export interface User {
	users: UserItem[];
}

export interface UserItems {
	items: User;
	pageToken: string | null;
	perPage: number;
	totalCount: number;
}

export interface UsersResponse {
	data: UserItems;
	currentUser: AccountManagementI;
	status: boolean;
}

export interface UserResponse {
	data: UserItem;
	error?: string;
	status: boolean;
}

export interface DeleteUsersResponse {
	status: boolean;
	data: {
		successCount: number;
		failCount: number;
		failUsers: {
			index: number;
			userId: string;
			reason: string;
		}[];
	} | null;
	error?: string;
}

export enum ACTION_TYPES_USER {
	DELETE = "delete",
	SWITCH_ROLE = "switch_role",
	ADD_UC = "add_uc",
}
