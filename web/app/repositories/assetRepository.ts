import jp from "~/commons/locales/jp";
import { logger } from "~/logger";
import {
	Asset,
	type AssetItem,
	type AssetParams,
	type AssetsResponse,
	type CreateAssetRequest,
	type GcsModel,
	toCreateAssetRequest,
} from "~/models/asset";
import {
	type ApiResponse,
	type ErrorResponse,
	GENERAL_ERROR_MESSAGE,
	fetchFromApi,
} from "./utils";

export class AssetRepository {
	private ACCESS_TOKEN = process.env.VITE_ACCESS_TOKEN;
	private CMS_API_URL = process.env.VITE_CMS_API_URL;
	private PROJECT_ID = process.env.VITE_PROJECT_ID;

	private async fetchAssets(
		params: AssetParams,
	): Promise<ApiResponse<AssetsResponse>> {
		if (!this.PROJECT_ID) {
			return { status: false, error: jp.message.common.missingProjectId };
		}
		const { page, perPage, sort, dir, keyword } = params;

		const query = new URLSearchParams({
			page: page.toString(),
			perPage: perPage.toString(),
			sort,
			dir,
			keyword,
			projectId: this.PROJECT_ID,
		});

		const requestUrl = `projects/${this.PROJECT_ID}/assets?${query.toString()}`;

		logger.info({ message: "Fetching assets", params, url: requestUrl });

		try {
			const response = await fetchFromApi<AssetsResponse>(requestUrl, true);
			const responseData = await response.json();

			if (response.ok) {
				logger.info({
					message: "Successful assets fetch",
					status: response.status,
					url: response.url,
					responseData,
				});
				return { status: true, data: responseData };
			}
			const errorResponse = await this.handleErrorResponseStatus(response);
			logger.info({
				message: "Failed assets fetch",
				status: response.status,
				url: response.url,
				error: errorResponse.error,
			});
			return errorResponse;
		} catch (error) {
			logger.error({
				message: "Error fetching assets",
				err: error,
				url: requestUrl,
			});
			return {
				status: false,
				error: GENERAL_ERROR_MESSAGE,
			};
		}
	}

	async getAssets(params: AssetParams): Promise<ApiResponse<AssetsResponse>> {
		const response = await this.fetchAssets(params);

		if (!response.status) {
			logger.error({
				message: "Failed to get assets",
				err: response.error,
			});
			return { status: false, error: response.error };
		}

		const assets =
			response.data && Array.isArray(response.data.items)
				? response.data.items.map((asset) => this.toModel(asset))
				: [];

		return {
			status: true,
			data: {
				items: assets,
				page: params.page,
				perPage: params.perPage,
				totalCount: response?.data?.totalCount,
			},
		};
	}

	public async fetchAssetDetail(
		assetId: string,
	): Promise<ApiResponse<AssetItem>> {
		const requestUrl = `assets/${assetId}`;

		logger.info({ message: "Fetching asset detail", assetId, url: requestUrl });

		try {
			const response = await fetchFromApi<AssetItem>(requestUrl, true);

			if (!response.ok) {
				const errorResponse = await this.handleErrorResponseStatus(response);
				logger.info({
					message: "Failed asset detail fetch",
					status: response.status,
					url: response.url,
					error: errorResponse.error,
				});
				return errorResponse;
			}

			const data: AssetItem = await response.json();
			logger.info({
				message: "Successful asset detail fetch",
				status: response.status,
				url: response.url,
				data,
			});
			return { status: true, data };
		} catch (error) {
			logger.error({
				message: "Error fetching asset detail",
				err: error,
				url: requestUrl,
			});
			return {
				status: false,
				error: GENERAL_ERROR_MESSAGE,
			};
		}
	}

	public async getAssetDetail(assetId: string): Promise<ApiResponse<Asset>> {
		const response = await this.fetchAssetDetail(assetId);

		if (!response.status) {
			logger.error({
				message: "Failed to get asset detail",
				err: response.error,
			});
			return { status: false, error: response.error };
		}

		return { status: true, data: this.toModel(response.data) };
	}

	async deleteAsset(assetId: string): Promise<ApiResponse<null>> {
		const requestUrl = `assets/${assetId}`;

		logger.info({ message: "Deleting asset", assetId, url: requestUrl });

		try {
			const response = await fetchFromApi<null>(requestUrl, true, "DELETE");

			if (!response.ok) {
				const errorResponse = await this.handleErrorResponseStatus(response);
				logger.info({
					message: "Failed asset delete",
					status: response.status,
					url: response.url,
					error: errorResponse.error,
				});
				return errorResponse;
			}

			logger.info({
				message: "Successful asset delete",
				status: response.status,
				url: response.url,
			});
			return { status: true, data: null };
		} catch (error) {
			logger.error({
				message: "Error deleting asset",
				err: error,
				url: requestUrl,
			});
			return {
				status: false,
				error: GENERAL_ERROR_MESSAGE,
			};
		}
	}

	async prepareUpload(
		name: string,
		contentLength: number,
		cursor = "",
	): Promise<GcsModel> {
		if (!this.ACCESS_TOKEN) {
			throw new Error(jp.message.common.missingAccessToken);
		}

		if (!this.PROJECT_ID) {
			throw new Error("Missing project ID");
		}

		const requestBody = {
			name,
			contentEncoding: "gzip",
		};
		const requestUrl = `projects/${this.PROJECT_ID}/assets/uploads`;
		logger.info({
			message: "Generate signed URL asset",
			requestBody,
			url: requestUrl,
		});
		try {
			const response = await fetchFromApi<null>(
				requestUrl,
				true,
				"POST",
				requestBody,
			);
			if (!response.ok) {
				const errorResponse = await this.handleErrorResponseStatus(response);
				logger.info({
					message: "Failed to generate asset singed URL",
					status: response.status,
					url: response.url,
					error: errorResponse.error,
				});
				throw new Error("Failed to get Google Cloud Storage information");
			}

			logger.info({
				message: "Successful generate asset signed URL",
				status: response.status,
				url: response.url,
			});
			return await response.json();
		} catch (error) {
			logger.error({
				message: "Error generate asset signed URL",
				err: error,
				url: requestUrl,
			});
			throw new Error("Failed to get Google Cloud Storage information");
		}
	}

	async createAsset(url: string, token: string, skip: boolean): Promise<Asset> {
		if (!this.ACCESS_TOKEN) {
			throw new Error(jp.message.common.missingAccessToken);
		}

		if (!this.PROJECT_ID) {
			throw new Error("Missing project ID");
		}

		const requestBody: CreateAssetRequest = toCreateAssetRequest(
			url,
			token,
			skip,
		);

		const response = await fetch(
			`${this.CMS_API_URL}/projects/${this.PROJECT_ID}/assets`,
			{
				method: "POST",
				body: JSON.stringify(requestBody),
				headers: {
					Authorization: `Bearer ${this.ACCESS_TOKEN}`,
					Accept: "application/json",
					"Content-Type": "application/json",
				},
			},
		);

		if (!response.ok) {
			throw new Error("Failed to create asset");
		}

		const data: Asset = await response.json();
		return data;
	}

	private async handleErrorResponseStatus(
		response: Response,
	): Promise<ErrorResponse> {
		const errorMessages: Record<number, string> = {
			404: jp.message.asset.assetNotFound,
			401: jp.message.asset.unauthorizedAccessAsset,
			500: jp.message.asset.internalServerError,
			503: jp.message.asset.assetServiceUnavailable,
		};

		const errorMessage =
			errorMessages[response.status] || GENERAL_ERROR_MESSAGE;
		return { status: false, error: errorMessage };
	}

	private toModel(asset: AssetItem): Asset {
		return new Asset({
			id: asset.id,
			name: asset.name,
			archiveExtractionStatus: asset.archiveExtractionStatus,
			contentType: asset.contentType,
			createdAt: asset.createdAt,
			file: asset.file,
			previewType: asset.previewType,
			projectId: asset.projectId,
			totalSize: asset.totalSize ?? 0,
			updatedAt: asset.updatedAt,
			url: asset.url,
		});
	}
}
