import jp from "~/commons/locales/jp";
import type { Field } from "~/components/pages/Dataset/types";
import { logger } from "~/logger";
import type { Asset } from "~/models/asset";
import type { ContentItem } from "~/models/content";
import {
	convertKeyword,
	generateFileNameByTimeStamp,
	getFileTypeFromFileName,
	removeFileExtension,
} from "~/utils/stringUtils";
import {
	type ApiResponse,
	type ErrorResponse,
	GENERAL_ERROR_MESSAGE,
} from "./utils";

export interface GSpatialResponse {
	id?: string;
	status: boolean;
	error?: string;
}

export class GSpatialRepository {
	private G_SPATIAL_ENDPOINT = process.env.G_SPATIAL_ENDPOINT;
	private G_SPATIAL_LICENSE_ID = process.env.G_SPATIAL_LICENSE_ID;
	private G_SPATIAL_OWNER_ORG = process.env.G_SPATIAL_OWNER_ORG;
	private HEADERS: HeadersInit = {
		"Content-Type": "application/json",
		"X-CKAN-API-Key": process.env.G_SPATIAL_API_KEY ?? "",
	};

	async createPackage(
		name: string,
		userUid: string,
		username: string,
		metadata: Field[],
	): Promise<GSpatialResponse | ApiResponse<ErrorResponse>> {
		if (!this.G_SPATIAL_ENDPOINT) {
			logger.error({
				message: "Missing operator endpoint",
				error: "Missing operator endpoint",
			});
			return {
				status: false,
				error: jp.message.common.missingOperatorEndpoint,
			};
		}
		const messageError = jp.message.dataset.createGSpatialPackageFailed;

		try {
			const requestOptions: RequestInit = {
				method: "POST",
				headers: this.HEADERS,
			};
			const endPointDataset = await convertKeyword(name);
			const notes = this.generateNotes(metadata);
			requestOptions.body = JSON.stringify({
				name: `veda-${endPointDataset}`,
				title: `veda-${name}`,
				notes: notes || `veda-${name}`,
				private: true,
				area: "北海道_札幌市",
				author: username,
				maintainer: username,
				author_email: username,
				maintainer_email: username,
				license_id: this.G_SPATIAL_LICENSE_ID,
				owner_org: this.G_SPATIAL_OWNER_ORG,
			});

			logger.info({
				message: "G SPATIAL create package body",
				body: requestOptions.body,
			});

			const endPoint = `${this.G_SPATIAL_ENDPOINT}/package_create`;
			const response = await fetch(endPoint, requestOptions);
			if (!response.ok) {
				const error = await response.json();
				logger.info({
					message: messageError,
					status: response.status,
					url: response.url,
					error: error,
				});
				const errorNameAlphabets = Array.isArray(error?.error?.name)
					? error.error.name[0]
					: undefined;
				return {
					status: false,
					error: errorNameAlphabets ?? messageError,
				} as ErrorResponse;
			}

			const data = await response.json();
			if (!data.success) {
				logger.info({
					message: messageError,
					status: response.status,
					url: response.url,
					error: data,
				});
				return {
					status: false,
					error: messageError,
				} as ErrorResponse;
			}

			return {
				status: true,
				id: data.result.id,
			};
		} catch (error) {
			logger.error({ message: messageError, error: error });
			return { status: false, error: GENERAL_ERROR_MESSAGE } as ErrorResponse;
		}
	}

	async updatePackage(
		id: string,
		name: string,
		userUid: string,
		username: string,
		metadata: Field[],
	): Promise<GSpatialResponse | ApiResponse<ErrorResponse>> {
		if (!this.G_SPATIAL_ENDPOINT) {
			logger.error({
				message: "Missing operator endpoint",
				error: "Missing operator endpoint",
			});
			return {
				status: false,
				error: jp.message.common.missingOperatorEndpoint,
			};
		}
		const messageError = jp.message.dataset.updateGSpatialPackageFailed;

		try {
			const requestOptions: RequestInit = {
				method: "POST",
				headers: this.HEADERS,
			};
			const notes = this.generateNotes(metadata);
			requestOptions.body = JSON.stringify({
				id: id,
				// Uncomment "name" if want to change the url of Dataset on G-spatial
				// name: `veda-${name}`,
				title: `veda-${name}`,
				notes: notes || `veda-${name}`,
				maintainer: username,
				maintainer_email: username,
			});

			logger.info({
				message: "G SPATIAL update package body",
				body: requestOptions.body,
			});

			const endPoint = `${this.G_SPATIAL_ENDPOINT}/package_patch`;
			const response = await fetch(endPoint, requestOptions);

			if (!response.ok) {
				const error = await response.json();
				logger.info({
					message: messageError,
					status: response.status,
					url: response.url,
					error: error,
				});
				return {
					status: false,
					error: error?.error?.name?.[0] ?? messageError,
				} as ErrorResponse;
			}

			const data = await response.json();
			if (!data.success) {
				logger.info({
					message: messageError,
					status: response.status,
					url: response.url,
					error: data,
				});
				return {
					status: false,
					error: messageError,
				} as ErrorResponse;
			}

			return {
				status: true,
				id: data.result.id,
			};
		} catch (error) {
			logger.error({ message: messageError, error: error });
			return { status: false, error: GENERAL_ERROR_MESSAGE } as ErrorResponse;
		}
	}

	async deletePackage(
		packageId: string,
	): Promise<GSpatialResponse | ApiResponse<ErrorResponse>> {
		if (!this.G_SPATIAL_ENDPOINT) {
			logger.error({
				message: "Missing operator endpoint",
				error: "Missing operator endpoint",
			});
			return {
				status: false,
				error: jp.message.common.missingOperatorEndpoint,
			};
		}

		try {
			const requestOptions: RequestInit = {
				method: "POST",
				headers: this.HEADERS,
			};
			requestOptions.body = JSON.stringify({
				id: packageId,
			});

			logger.info({
				message: "G SPATIAL delete package body",
				body: requestOptions.body,
			});

			const endPoint = `${this.G_SPATIAL_ENDPOINT}/package_delete`;
			const response = await fetch(endPoint, requestOptions);
			if (!response.ok) {
				logger.info({
					message: "Delete G SPATIAL package failed",
					status: response.status,
					url: response.url,
					error: await response.json(),
				});
				return await this.handleResponseStatus<ErrorResponse>(response);
			}

			const data = await response.json();
			if (!data.success) {
				logger.info({
					message: "Delete G SPATIAL package failed",
					status: response.status,
					url: response.url,
					error: data,
				});
				return {
					status: false,
					error: "Delete G SPATIAL package failed",
				} as ErrorResponse;
			}

			return {
				status: true,
			};
		} catch (error) {
			logger.error({
				message: "Delete G SPATIAL package failed",
				error: error,
			});
			return { status: false, error: GENERAL_ERROR_MESSAGE } as ErrorResponse;
		}
	}

	async createResource(
		packageId: string,
		item: ContentItem | Asset,
		isMd = false,
	): Promise<GSpatialResponse | ApiResponse<ErrorResponse>> {
		if (!this.G_SPATIAL_ENDPOINT) {
			logger.error({
				message: "Missing operator endpoint",
				error: "Missing operator endpoint",
			});
			return {
				status: false,
				error: jp.message.common.missingOperatorEndpoint,
			};
		}

		try {
			const assetUrl = this.getAssetUrl(item);
			const name = isMd
				? removeFileExtension(item.name)
				: generateFileNameByTimeStamp(item.name);
			const requestOptions: RequestInit = {
				method: "POST",
				headers: this.HEADERS,
				body: JSON.stringify({
					url: assetUrl,
					format: getFileTypeFromFileName(assetUrl ?? ""),
					name,
					package_id: packageId,
				}),
			};

			logger.info({
				message: "G SPATIAL create resource request",
				body: requestOptions.body,
			});

			const endPoint = `${this.G_SPATIAL_ENDPOINT}/resource_create`;
			const response = await fetch(endPoint, requestOptions);

			if (!response.ok) {
				logger.info({
					message: "Create GSpatial resource failed",
					status: response.status,
					url: response.url,
					error: await response.json(),
				});
				return await this.handleResponseStatus<ErrorResponse>(response);
			}

			const data = await response.json();
			if (!data.success) {
				logger.info({
					message: "Create GSpatial resource failed",
					status: response.status,
					url: response.url,
					error: data,
				});
				return {
					status: false,
					error: "Create G SPATIAL resource failed",
				} as ErrorResponse;
			}

			return {
				status: true,
				id: data.result.id,
			} as GSpatialResponse;
		} catch (error) {
			console.log("Create GSpatial resource failed", error);
			return { status: false, error: GENERAL_ERROR_MESSAGE } as ErrorResponse;
		}
	}

	async deleteResource(
		resourceId: string,
	): Promise<GSpatialResponse | ApiResponse<ErrorResponse>> {
		if (!this.G_SPATIAL_ENDPOINT) {
			logger.error({
				message: "Missing operator endpoint",
				error: "Missing operator endpoint",
			});
			return {
				status: false,
				error: jp.message.common.missingOperatorEndpoint,
			};
		}

		try {
			const requestOptions: RequestInit = {
				method: "POST",
				headers: this.HEADERS,
			};
			requestOptions.body = JSON.stringify({
				id: resourceId,
			});
			logger.info({
				message: "G SPATIAL delete resource body G SPATIAL",
				body: requestOptions.body,
			});
			const endPoint = `${this.G_SPATIAL_ENDPOINT}/resource_delete`;
			const response = await fetch(endPoint, requestOptions);
			if (!response.ok) {
				logger.info({
					message: "Delete gspatial resource failed",
					status: response.status,
					url: response.url,
					error: await response.json(),
				});
				return await this.handleResponseStatus<ErrorResponse>(response);
			}

			return {
				status: true,
			};
		} catch (error) {
			console.log("Delete gspatial resource failed", error);
			return { status: false, error: GENERAL_ERROR_MESSAGE } as ErrorResponse;
		}
	}

	private async handleResponseStatus<T>(
		response: Response,
	): Promise<ApiResponse<T>> {
		const errorMessages: Record<number, string> = {
			400: jp.message.dataset.resourceNotFound,
			404: jp.message.dataset.resourceNotFound,
			401: jp.message.common.unauthorized,
			500: jp.message.common.internalServerError,
			503: jp.message.common.operatorServiceUnavailable,
		};

		const errorMessage =
			errorMessages[response.status] || GENERAL_ERROR_MESSAGE;
		return { status: false, error: errorMessage };
	}

	private getAssetUrl(item: ContentItem | Asset): string | undefined {
		return "url" in item
			? item.url
			: item.management?.assetUrl ??
					item.duplicateContent?.assetUrl ??
					undefined;
	}

	private generateNotes(metadata: Field[]): string {
		let notes = "> # メタデータ  \n>  \n";
		for (const item of metadata) {
			const value = item.value ? item.value : "";
			notes += `> - **${item.label}**: ${value}  \n`;
		}

		return notes;
	}
}
