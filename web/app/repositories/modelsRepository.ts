import jp from "~/commons/locales/jp";
import { logger } from "~/logger";
import type { ModelItem, ModelParams, ModelResponse } from "~/models/models";
import {
	type ApiResponse,
	type ErrorResponse,
	GENERAL_ERROR_MESSAGE,
	fetchFromApi,
} from "./utils";

export class ModelsRepository {
	private PROJECT_ID = process.env.VITE_PROJECT_ID;

	private async fetchModel(
		params: ModelParams,
	): Promise<ApiResponse<ModelResponse>> {
		if (!this.PROJECT_ID) {
			logger.error({
				message: "Failed model fetch",
				error: "Missing project ID",
			});
			return { status: false, error: jp.message.common.missingProjectId };
		}
		const query = new URLSearchParams({
			page: params.page.toString(),
			perPage: params.perPage.toString(),
			keyword: params.keyword,
			projectId: this.PROJECT_ID,
		});

		const requestUrl = `projects/${this.PROJECT_ID}/models?${query.toString()}`;

		logger.info({ message: "Fetching model", params, url: requestUrl });

		try {
			const response = await fetchFromApi<ModelResponse>(requestUrl, true);

			if (!response.ok) {
				const errorResponse = (await this.handleResponseStatus<ErrorResponse>(
					response,
				)) as ErrorResponse;
				logger.info({
					message: "Failed model fetch",
					status: response.status,
					url: response.url,
					error: errorResponse.error,
				});
				return errorResponse;
			}

			const data: ModelResponse = await response.json();
			logger.info({
				message: "Successful model fetch",
				status: response.status,
				url: response.url,
				data,
			});
			return { status: true, data };
		} catch (error) {
			logger.error({
				message: "Error fetching model",
				err: error,
				url: requestUrl,
			});
			return { status: false, error: GENERAL_ERROR_MESSAGE };
		}
	}

	async getModel(params: ModelParams): Promise<ApiResponse<ModelResponse>> {
		const response = await this.fetchModel(params);

		if (!response.status) {
			return { status: false, error: response.error };
		}

		const models =
			response.data && Array.isArray(response.data.models)
				? response.data.models
				: [];

		return {
			status: true,
			data: {
				models: models,
				page: params.page,
				perPage: params.perPage,
				totalCount: response?.data?.totalCount,
			},
		};
	}

	private async fetchModelDetail(
		modelId: string,
	): Promise<ApiResponse<ModelItem>> {
		const requestUrl = `models/${modelId}}`;

		logger.info({
			message: "Fetching model detail",
			modelId,
			url: requestUrl,
		});

		try {
			const response = await fetchFromApi<ModelItem>(requestUrl, true, "GET");

			if (!response.ok) {
				const errorResponse = (await this.handleResponseStatus<ErrorResponse>(
					response,
				)) as ErrorResponse;
				logger.info({
					message: "Failed model detail fetch",
					status: response.status,
					url: response.url,
					error: errorResponse.error,
				});
				return errorResponse;
			}

			const data: ModelItem = await response.json();
			logger.info({
				message: "Successful model detail fetch",
				status: response.status,
				url: response.url,
				data,
			});
			return { status: true, data };
		} catch (error) {
			logger.error({
				message: "Error fetching model detail",
				err: error,
				url: requestUrl,
			});
			return { status: false, error: GENERAL_ERROR_MESSAGE };
		}
	}

	public async getModelDetail(
		modelId: string,
	): Promise<ApiResponse<ModelItem>> {
		const response = await this.fetchModelDetail(modelId);

		if (!response.status) {
			return { status: false, error: response.error };
		}

		return { status: true, data: response.data };
	}

	private async handleResponseStatus<T>(
		response: Response,
	): Promise<ApiResponse<T>> {
		const errorMessages: Record<number, string> = {
			404: jp.message.content.modelNotFound,
			401: jp.message.content.unauthorizedModelAccess,
			500: jp.message.content.modelServerError,
			503: jp.message.content.modelServiceUnavailable,
		};

		const errorMessage =
			errorMessages[response.status] || GENERAL_ERROR_MESSAGE;
		return { status: false, error: errorMessage };
	}
}
