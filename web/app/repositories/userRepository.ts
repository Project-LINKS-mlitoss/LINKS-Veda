import type { User, UserCredential } from "firebase/auth";
import {
	fetchSignInMethodsForEmail,
	getAuth,
	sendPasswordResetEmail,
	signInWithEmailAndPassword,
} from "firebase/auth";
import { logger } from "~/logger";

import type {
	DeleteUsersResponse,
	UserItems,
	UserModel,
	UserParams,
	VerifyIdTokenResponse,
} from "app/models/userModel";
import jp from "~/commons/locales/jp";
import { adminAuth, clientAuth } from "~/utils/firebase";
import { type ApiResponse, GENERAL_ERROR_MESSAGE } from "./utils";

export class UserRepository {
	async signIn(email: string, password: string): Promise<UserCredential> {
		try {
			logger.info({
				message: "Signing in user",
				email,
			});

			const userCredential = await signInWithEmailAndPassword(
				clientAuth,
				email,
				password,
			);

			logger.info({
				message: "User signed in successfully",
				email,
				uid: userCredential.user.uid,
			});

			return userCredential;
		} catch (error) {
			logger.error({
				message: "Failed to sign in user",
				email,
				err: error,
			});
			throw error;
		}
	}

	async signOut(): Promise<void> {
		try {
			logger.info({
				message: "Signing out user",
				uid: clientAuth.currentUser?.uid,
			});

			await clientAuth.signOut();
			logger.info({
				message: "User signed out successfully",
			});
		} catch (error) {
			logger.error({
				message: "Failed to sign out user",
				uid: clientAuth.currentUser?.uid,
				err: error,
			});
			throw error;
		}
	}

	async getSignInMethodCount(email: string): Promise<number> {
		try {
			logger.info({
				message: "Fetching sign-in methods for email",
				email,
			});

			const auth = getAuth();
			const signMethodList = await fetchSignInMethodsForEmail(auth, email);

			logger.info({
				message: "Fetched sign-in methods successfully",
				email,
				methodCount: signMethodList.length,
			});

			return signMethodList.length;
		} catch (error) {
			logger.error({
				message: "Failed to fetch sign-in methods",
				email,
				err: error,
			});
			throw error;
		}
	}

	async sendResetLink(email: string): Promise<void> {
		try {
			logger.info({
				message: "Sending password reset link",
				email,
			});

			await sendPasswordResetEmail(clientAuth, email);

			logger.info({
				message: "Password reset link sent successfully",
				email,
			});
		} catch (error) {
			logger.error({
				message: "Failed to send password reset link",
				email,
				err: error,
			});
			throw error;
		}
	}

	async verifyToken(token: string): Promise<VerifyIdTokenResponse | null> {
		try {
			const currentUser = adminAuth.verifyIdToken(token, true);
			logger.info({
				message: "Fetching current user",
				currentUser: currentUser,
			});
			return currentUser;
		} catch (error) {
			logger.error({
				message: "Failed to fetch current user",
				err: error,
			});
			throw error;
		}
	}

	async listUser(params: UserParams): Promise<ApiResponse<UserItems>> {
		try {
			const users = await adminAuth.listUsers(params.perPage, params.pageToken);

			return {
				status: true,
				data: {
					items: users,
					pageToken: users.pageToken ?? null,
					perPage: params.perPage,
					totalCount: users.users.length,
				},
			};
		} catch (error) {
			logger.error({
				message: "Failed to fetch list user",
				err: error,
			});
			return {
				status: false,
				error: jp.message.user.failedToUsers,
			};
		}
	}

	toUserModel(user: User, token: string): UserModel {
		return {
			email: user.email ?? "",
			name: user.displayName ?? "",
			role: "",
			token: token,
			uid: user.uid,
		};
	}

	private async handleResponseStatus<T>(
		response: Response,
	): Promise<ApiResponse<T>> {
		const errorMessages: Record<number, string> = {
			400: jp.message.common.invalidRequest,
			404: jp.message.user.userNotFound,
			401: jp.message.user.unauthorizedAccessUser,
			500: jp.message.user.internalServerError,
			503: jp.message.user.userServiceUnavailable,
		};

		const errorMessage =
			errorMessages[response.status] || GENERAL_ERROR_MESSAGE;
		return { status: false, error: errorMessage };
	}

	async deleteUser(userId: string): Promise<ApiResponse<null>> {
		try {
			await adminAuth.deleteUser(userId);
			logger.info({
				message: "Successful user delete",
				userId: userId,
			});
			return { status: true, data: null };
		} catch (error) {
			logger.error({
				message: "Error deleting user",
				err: error,
				uuid: userId,
			});
			return { status: false, error: GENERAL_ERROR_MESSAGE };
		}
	}

	async updateDisableUsers(
		userIds: string[],
		isDisable = true,
	): Promise<DeleteUsersResponse> {
		try {
			const failUsers: { index: number; userId: string; reason: string }[] = [];
			let successCount = 0;

			for (const [index, userId] of userIds.entries()) {
				try {
					await adminAuth.updateUser(userId, { disabled: isDisable });
					successCount++;
				} catch (error) {
					failUsers.push({
						index,
						userId,
						reason: error instanceof Error ? error.message : "Unknown error",
					});
				}
			}

			const failCount = failUsers.length;
			if (failCount) {
				logger.error({
					message: "Error during user disable process",
					err: failUsers,
				});
				return {
					status: false,
					data: null,
					error: failUsers[0].reason,
				};
			}

			logger.info({
				message: "User disable process completed",
				successCount,
				failCount,
				failUsers,
			});

			return {
				status: true,
				data: {
					successCount,
					failCount,
					failUsers,
				},
			};
		} catch (error) {
			logger.error({
				message: "Error during user disable process",
				err: error,
			});

			return {
				status: false,
				data: null,
				error: jp.message.user.failedDisableUsers,
			};
		}
	}
}
