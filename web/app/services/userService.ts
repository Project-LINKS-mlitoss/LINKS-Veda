import { Prisma } from "@prisma/client";
import type {
	AuthResponse,
	ResetPasswordResponse,
	SignOutResponse,
	UserItem,
	UserParams,
	VerifyUserTokenResponse,
} from "app/models/userModel";
import type { UserRepository } from "app/repositories/userRepository";
import { FirebaseError } from "firebase/app";
import { ROLE } from "~/commons/core.const";
import jp from "~/commons/locales/jp";
import { logger } from "~/logger";
import type { AccountManagementI } from "~/models/accountManagementModel";
import type { AccountManagementRepository } from "~/repositories/accountManagementRepository";
import type { UseCaseRepository } from "~/repositories/useCaseRepository";
import { type ApiResponse, GENERAL_ERROR_MESSAGE } from "~/repositories/utils";
import { validate, validateV2 } from "./utils";

export class UserService {
	private userRepository: UserRepository;
	private accountManagementRepository: AccountManagementRepository;
	private useCaseRepository: UseCaseRepository;

	constructor(
		userRepository: UserRepository,
		accountManagementRepository: AccountManagementRepository,
		useCaseRepository: UseCaseRepository,
	) {
		this.userRepository = userRepository;
		this.accountManagementRepository = accountManagementRepository;
		this.useCaseRepository = useCaseRepository;
	}

	async authUser(email: string, password: string): Promise<AuthResponse> {
		try {
			const response = await this.userRepository.signIn(email, password);
			const { user } = response;
			const idToken = await user.getIdToken();
			const userModel = this.userRepository.toUserModel(user, idToken);

			return Promise.resolve({
				success: true,
				user: userModel,
				error: undefined,
			});
		} catch (e) {
			let errorMessage = jp.message.common.internalServerError;
			if (e instanceof FirebaseError) {
				errorMessage = e.message;
			}

			return Promise.resolve({
				success: false,
				user: undefined,
				error: errorMessage,
			});
		}
	}

	async signOutUser(): Promise<SignOutResponse> {
		try {
			await this.userRepository.signOut();

			return Promise.resolve({
				success: true,
				error: undefined,
			});
		} catch (e) {
			let errorMessage = jp.message.common.internalServerError;
			if (e instanceof FirebaseError) {
				errorMessage = e.message;
			}

			return Promise.resolve({
				success: false,
				error: errorMessage,
			});
		}
	}

	async requestResetPassword(email: string): Promise<ResetPasswordResponse> {
		try {
			const methodCount = await this.userRepository.getSignInMethodCount(email);

			if (methodCount > 0) {
				const response = await this.userRepository.sendResetLink(email);

				return Promise.resolve({ success: true, error: undefined });
			}

			return Promise.resolve({ success: false, error: "Email does not exist" });
		} catch (e) {
			let errorMessage = jp.message.common.internalServerError;
			if (e instanceof FirebaseError) {
				errorMessage = e.message;
			}
			return Promise.resolve({ success: false, error: errorMessage });
		}
	}

	async verifyToken(token: string): Promise<VerifyUserTokenResponse> {
		try {
			const currentUser = await this.userRepository.verifyToken(token);
			if (currentUser) {
				return Promise.resolve({
					success: true,
					error: undefined,
					uid: currentUser.uid,
					email: currentUser.email ?? "",
				});
			}

			return Promise.resolve({
				success: false,
				error: "No user found or token expired",
				uid: undefined,
				email: undefined,
			});
		} catch (e) {
			let errorMessage = jp.message.common.internalServerError;
			if (e instanceof FirebaseError) {
				errorMessage = e.message;
			}
			return Promise.resolve({
				success: false,
				error: errorMessage,
				uid: undefined,
				email: undefined,
			});
		}
	}

	async deleteUser(userId: string): Promise<ApiResponse<null>> {
		const validationError = validate(!userId, "User ID is required");
		if (validationError) {
			return validationError;
		}
		return this.userRepository.deleteUser(userId);
	}

	async deleteUsers(userIds: string[]) {
		const validationError = validateV2(
			userIds.length === 0,
			"User IDs are required",
		);
		if (validationError) {
			return validationError;
		}

		return await this.userRepository.updateDisableUsers(userIds);
	}

	async updatePermission(userId: string, role: ROLE) {
		try {
			const account = await this.accountManagementRepository.upsertNonUnique(
				{ userId: userId, role: role },
				"userId",
			);
			return {
				status: true,
				data: account,
			};
		} catch (e) {
			logger.error({
				message: "Update permission failed",
				err: e,
				userId: userId,
				role: role,
			});
			return {
				status: false,
				error: GENERAL_ERROR_MESSAGE,
			};
		}
	}

	async updateUc(userId: string, useCaseIds: string) {
		try {
			let account = await this.getUserPermission(userId);
			if (account) {
				account = await this.accountManagementRepository.update(account.id, {
					useCaseIds: JSON.parse(useCaseIds).length
						? useCaseIds
						: Prisma.DbNull,
				});
			} else {
				account = await this.accountManagementRepository.create({
					userId: userId,
					useCaseIds: useCaseIds,
				});
			}
			return {
				status: true,
				data: account,
			};
		} catch (e) {
			logger.error({
				message: "Update usecase failed",
				err: e,
				userId: userId,
				useCaseIds: useCaseIds,
			});
			return {
				status: false,
				error: GENERAL_ERROR_MESSAGE,
			};
		}
	}

	async listUser(params: UserParams) {
		let allUsers: UserItem[] = [];
		let pageToken: string | undefined = undefined;

		do {
			const response = await this.userRepository.listUser({
				perPage: params.perPage,
				pageToken: pageToken,
			});
			if (response.status) {
				const filteredUsers = response.data.items.users.filter(
					(user) =>
						!user.disabled &&
						user.email?.toLowerCase().includes(params?.keyword ?? ""),
				);
				allUsers = allUsers.concat(filteredUsers);
				pageToken = response.data.pageToken ?? undefined;
			}
		} while (pageToken);

		const userIds = allUsers.map((user) => user.uid);
		const accountManagements = await this.accountManagementRepository.find(
			{ userId: { in: userIds } },
			{
				role: true,
				userId: true,
				useCaseIds: true,
			},
		);
		const useCaseIdSet = new Set<string>();
		const accountManagementMap: Map<string, AccountManagementI> = new Map();

		for (const account of accountManagements) {
			const useCaseIds = JSON.parse(account.useCaseIds ?? "[]");
			for (const id of useCaseIds) {
				useCaseIdSet.add(id);
			}

			if (account.userId) {
				accountManagementMap.set(account.userId, account);
			}
		}

		const useCaseIds = Array.from(useCaseIdSet);
		const useCases = await this.useCaseRepository.find({
			id: { in: useCaseIds },
		});

		const useCaseMap = new Map(
			useCases.map((useCase: { id: number; name: string }) => [
				useCase.id,
				useCase.name,
			]),
		);

		return allUsers.map((user) => {
			const account = accountManagementMap.get(user.uid);

			const role = account?.role ?? ROLE.VIEW;
			const useCaseIds = account?.useCaseIds
				? JSON.parse(account.useCaseIds)
				: [];
			const useCases = useCaseIds.map(
				(id: number) => useCaseMap.get(id) || "N/A",
			);

			return {
				...user,
				role,
				useCaseIds,
				useCases,
			};
		});
	}

	async getUserPermission(userId: string) {
		return await this.accountManagementRepository.findFirst(
			{ userId: userId },
			{
				id: true,
				role: true,
				userId: true,
				useCaseIds: true,
			},
		);
	}
}
