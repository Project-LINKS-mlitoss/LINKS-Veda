import jp from "~/commons/locales/jp";
import { DefaultCurrent, DefaultPageSize } from "~/components/molecules/Common";
import { logger } from "~/logger";
import {
	type Item,
	ItemModel,
	type ItemParams,
	type ItemsRequest,
	type ItemsResponse,
} from "~/models/items";
import { prisma } from "~/prisma";
import {
	type ApiResponse,
	type ErrorResponse,
	GENERAL_ERROR_MESSAGE,
	fetchFromApi,
} from "./utils";

export class ItemsRepository {
	private async fetchItems(
		params: ItemParams,
	): Promise<ApiResponse<ItemsResponse>> {
		const {
			modelId,
			sort,
			dir,
			page,
			perPage,
			ref,
			asset,
			query,
			confident,
			useCase,
			ufn,
			startTime,
			finishTime,
			seaArea,
			shipCapacity,
			shipQuality,
			shipTonnage,
			shipUsage,
			visibility,
			visibilityOP,
			waveHeight,
			waveHeightOP,
			windSpeed,
			windSpeedOP,
		} = params;

		if (!modelId) {
			const errorMsg = "Missing model ID";
			logger.error({ message: "Failed to fetch items", err: errorMsg });
			return { status: false, error: errorMsg };
		}

		const queryParams = new URLSearchParams({
			sort: sort || "",
			dir: dir || "",
			ref: ref || "",
			asset: asset || "",
			query: query || "",
			...(page ? { page: page.toString() } : {}),
			...(perPage ? { perPage: perPage.toString() } : {}),
			useCase: useCase || "",
			ufn: ufn || "",
			startTime: startTime || "",
			finishTime: finishTime || "",
			seaArea: seaArea?.toString() || "",
		});

		const requestUrl = `models/${modelId}/items?${queryParams.toString()}`;
		logger.info({ message: "Fetching items", params, url: requestUrl });

		try {
			const response = await fetchFromApi<ItemsResponse>(requestUrl, true);

			if (!response.ok) {
				const errorResponse = (await this.handleResponseStatus<ErrorResponse>(
					response,
				)) as ErrorResponse;
				logger.info({
					message: "Failed to fetch items",
					status: response.status,
					url: response.url,
					error: errorResponse.error,
				});
				return errorResponse;
			}

			const data: ItemsResponse = await response.json();
			logger.info({
				message: "Successful fetch items",
				status: response.status,
				url: response.url,
				data,
			});

			if (confident) {
				const itemIds = data?.items?.map((item) => item?.id);

				const confidentData = await prisma.contentItemConfidence.findMany({
					where: {
						itemId: {
							in: itemIds,
						},
					},
				});

				const itemsWithConfident = data.items.map((item) => {
					const confident = confidentData.find(
						(conf) => conf.itemId === item.id,
					);
					return {
						...item,
						confident:
							confident && typeof confident.metadata === "string"
								? JSON.parse(confident.metadata)
								: null,
					};
				});

				data.items = itemsWithConfident;
			}

			return { status: true, data };
		} catch (error) {
			logger.error({
				message: "Error fetching items",
				err: error,
				url: requestUrl,
			});
			return { status: false, error: GENERAL_ERROR_MESSAGE };
		}
	}

	async getItems(params: ItemParams): Promise<ApiResponse<ItemsResponse>> {
		const response = await this.fetchItems(params);

		if (!response.status) {
			return { status: false, error: response.error };
		}

		const items = response.data.items?.map((item) => this.toModel(item)) || [];
		return {
			status: true,
			data: {
				items,
				page: params.page ?? DefaultCurrent,
				perPage: params.perPage ?? DefaultPageSize,
				totalCount: response.data.totalCount,
			},
		};
	}

	private async fetchItemDetail(itemId: string): Promise<ApiResponse<Item>> {
		const requestUrl = `items/${itemId}`;
		logger.info({ message: "Fetching item detail", itemId, url: requestUrl });

		try {
			const response = await fetchFromApi<Item>(requestUrl);

			if (!response.ok) {
				const errorResponse = (await this.handleResponseStatus<ErrorResponse>(
					response,
				)) as ErrorResponse;
				logger.info({
					message: "Failed to fetch item detail",
					status: response.status,
					url: response.url,
					error: errorResponse.error,
				});
				return errorResponse;
			}

			const data: Item = await response.json();
			logger.info({
				message: "Successful fetch item detail",
				status: response.status,
				url: response.url,
				data,
			});
			return { status: true, data };
		} catch (error) {
			logger.error({
				message: "Error fetching item detail",
				err: error,
				url: requestUrl,
			});
			return { status: false, error: GENERAL_ERROR_MESSAGE };
		}
	}

	async getItemDetail(itemId: string): Promise<ApiResponse<ItemModel>> {
		const response = await this.fetchItemDetail(itemId);

		if (!response.status) {
			return { status: false, error: response.error };
		}

		return { status: true, data: this.toModel(response.data) };
	}

	async deleteItem(itemId: string): Promise<ApiResponse<null>> {
		const requestUrl = `items/${itemId}`;
		logger.info({ message: "Deleting item", itemId, url: requestUrl });

		try {
			const response = await fetchFromApi<null>(requestUrl, true, "DELETE");

			if (!response.ok) {
				const errorResponse = (await this.handleResponseStatus<ErrorResponse>(
					response,
				)) as ErrorResponse;
				logger.info({
					message: "Failed to delete item",
					status: response.status,
					url: response.url,
					error: errorResponse.error,
				});
				return errorResponse;
			}

			logger.info({
				message: "Successful delete item",
				status: response.status,
				url: response.url,
			});
			return { status: true, data: null };
		} catch (error) {
			logger.error({
				message: "Error deleting item",
				err: error,
				url: requestUrl,
			});
			return { status: false, error: GENERAL_ERROR_MESSAGE };
		}
	}

	async createItems(
		modelId: string,
		data: ItemsRequest,
	): Promise<ApiResponse<Item>> {
		const requestUrl = `models/${modelId}/items`;
		logger.info({ message: "Creating items", modelId, data, url: requestUrl });

		try {
			const response = await fetchFromApi<Item>(requestUrl, true, "POST", {
				...data,
			});

			if (!response.ok) {
				const errorResponse = (await this.handleResponseStatus<ErrorResponse>(
					response,
				)) as ErrorResponse;
				logger.info({
					message: "Failed to create items",
					status: response.status,
					url: response.url,
					error: errorResponse.error,
				});
				return errorResponse;
			}

			const result = await response.json();
			logger.info({
				message: "Successful create items",
				status: response.status,
				url: response.url,
				data: result,
			});
			return { status: true, data: result };
		} catch (error) {
			logger.error({
				message: "Error creating items",
				err: error,
				url: requestUrl,
			});
			return { status: false, error: GENERAL_ERROR_MESSAGE };
		}
	}

	private async handleResponseStatus<T>(
		response: Response,
	): Promise<ApiResponse<T>> {
		const errorMessages: Record<number, string> = {
			404: jp.message.content.itemNotFound,
			401: jp.message.content.unauthorizedItemAccess,
			500: jp.message.content.itemServerError,
			503: jp.message.content.itemServiceUnavailable,
		};

		const errorMessage =
			errorMessages[response.status] || GENERAL_ERROR_MESSAGE;
		return { status: false, error: errorMessage };
	}

	private toModel(item: Item): ItemModel {
		return new ItemModel({
			id: item.id,
			modelId: item.modelId,
			fields: item.fields,
			createdAt: item.createdAt,
			updatedAt: item.updatedAt,
			version: item.version,
			parents: item.parents,
			refs: item.refs,
			referencedItems: item.referencedItems,
			metadataFields: item.metadataFields,
			isMetadata: item.isMetadata,
			confident: item.confident,
		});
	}
}
