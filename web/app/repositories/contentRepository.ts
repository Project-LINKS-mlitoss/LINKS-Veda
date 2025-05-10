import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from "~/commons/core.const";
import jp from "~/commons/locales/jp";
import type {
	ContentItemForCreate,
	TableItem,
} from "~/components/pages/Content/types";
import { logger } from "~/logger";
import {
	Content,
	type ContentField,
	type ContentItem,
	type ContentItemsResponse,
	type ContentParams,
	type ContentResponse,
	type ImportOptions,
} from "~/models/content";
import type { ContentItemParams, Item } from "~/models/items";
import {
	type ApiResponse,
	type ErrorResponse,
	GENERAL_ERROR_MESSAGE,
	fetchFromApi,
} from "./utils";

export class ContentRepository {
	private PROJECT_ID = process.env.VITE_PROJECT_ID;

	private async fetchContent(
		params: ContentParams,
	): Promise<ApiResponse<ContentResponse>> {
		if (!this.PROJECT_ID) {
			logger.error({
				message: "Failed content fetch",
				error: "Missing project ID",
			});
			return { status: false, error: jp.message.common.missingProjectId };
		}

		const query = new URLSearchParams({
			page: params.page.toString(),
			perPage: params.perPage.toString(),
			keyword: params.keyword || "",
			projectId: this.PROJECT_ID,
		});

		const requestUrl = `projects/${this.PROJECT_ID}/schemata?${query.toString()}`;

		logger.info({ message: "Fetching content", params, url: requestUrl });

		try {
			const response = await fetchFromApi<ContentResponse>(requestUrl, true);

			if (!response.ok) {
				const errorResponse = (await this.handleResponseStatus<ErrorResponse>(
					response,
				)) as ErrorResponse;
				logger.info({
					message: "Failed content fetch",
					status: response.status,
					url: response.url,
					error: errorResponse.error,
				});
				return errorResponse;
			}

			const data: ContentResponse = await response.json();
			logger.info({
				message: "Successful content fetch",
				status: response.status,
				url: response.url,
				data,
			});
			return { status: true, data };
		} catch (error) {
			logger.error({
				message: "Error fetching content",
				err: error,
				url: requestUrl,
			});
			return { status: false, error: GENERAL_ERROR_MESSAGE };
		}
	}

	async getContent(
		params: ContentParams,
	): Promise<ApiResponse<ContentResponse>> {
		const response = await this.fetchContent(params);

		if (!response.status) {
			return { status: false, error: response.error };
		}

		const content =
			response.data && Array.isArray(response.data.models)
				? response.data.models.map((asset) => this.toModel(asset))
				: [];

		return {
			status: true,
			data: {
				models: content,
				page: params.page,
				perPage: params.perPage,
				totalCount: response?.data?.totalCount,
			},
		};
	}

	async getContentMaxRecord(
		params: ContentParams,
	): Promise<ApiResponse<ContentResponse>> {
		const firstResponse = await this.fetchContent({ ...params, page: 1 });

		if (!firstResponse.status) {
			return { status: false, error: firstResponse.error };
		}

		const totalCount = firstResponse.data?.totalCount || 0;
		const perPage = params.perPage || 100;
		const totalPages = Math.ceil(totalCount / perPage);

		const allContent = firstResponse.data?.models.map(this.toModel) || [];

		if (totalPages === 1) {
			return {
				status: true,
				data: { models: allContent, page: 1, perPage, totalCount },
			};
		}

		const requests = [];
		for (let page = 2; page <= totalPages; page++) {
			requests.push(this.fetchContent({ ...params, page, perPage }));
		}

		const responses = await Promise.allSettled(requests);

		for (const result of responses) {
			if (result.status === "fulfilled" && result.value.status) {
				allContent.push(...result.value.data.models.map(this.toModel));
			}
		}

		return {
			status: true,
			data: { models: allContent, page: 1, perPage, totalCount },
		};
	}

	private async fetchContentDetail(
		contentId: string,
	): Promise<ApiResponse<ContentItem>> {
		const requestUrl = `models/${contentId}`;
		logger.info({
			message: "Fetching content detail",
			contentId,
			url: requestUrl,
		});

		try {
			const response = await fetchFromApi<ContentItem>(requestUrl);

			if (!response.ok) {
				const errorResponse = (await this.handleResponseStatus<ErrorResponse>(
					response,
				)) as ErrorResponse;
				logger.info({
					message: "Failed content detail fetch",
					status: response.status,
					url: response.url,
					error: errorResponse.error,
				});
				return errorResponse;
			}

			const data: ContentItem = await response.json();
			logger.info({
				message: "Successful content detail fetch",
				status: response.status,
				url: response.url,
				data,
			});
			return { status: true, data };
		} catch (error) {
			logger.error({
				message: "Error fetching content detail",
				err: error,
				url: requestUrl,
			});
			return { status: false, error: GENERAL_ERROR_MESSAGE };
		}
	}

	public async getContentDetail(
		contentId: string,
	): Promise<ApiResponse<Content>> {
		const response = await this.fetchContentDetail(contentId);

		if (!response.status) {
			return { status: false, error: response.error };
		}

		return { status: true, data: this.toModel(response.data) };
	}

	async deleteContent(contentId: string): Promise<ApiResponse<null>> {
		const requestUrl = `models/${contentId}`;
		logger.info({ message: "Deleting content", contentId, url: requestUrl });

		try {
			const response = await fetchFromApi<null>(requestUrl, true, "DELETE");

			if (!response.ok) {
				const errorResponse = (await this.handleResponseStatus<ErrorResponse>(
					response,
				)) as ErrorResponse;
				logger.info({
					message: "Failed content delete",
					status: response.status,
					url: response.url,
					error: errorResponse.error,
				});
				return errorResponse;
			}

			logger.info({
				message: "Successful content delete",
				status: response.status,
				url: response.url,
			});
			return { status: true, data: null };
		} catch (error) {
			logger.error({
				message: "Error deleting content",
				err: error,
				url: requestUrl,
			});
			return { status: false, error: GENERAL_ERROR_MESSAGE };
		}
	}

	public async editContentName(
		contentId: string,
		name: string,
	): Promise<ApiResponse<null>> {
		const requestUrl = `models/${contentId}`;
		logger.info({
			message: "Editing content name",
			contentId,
			name,
			url: requestUrl,
		});

		try {
			const response = await fetchFromApi<null>(requestUrl, true, "PATCH", {
				name,
			});

			if (!response.ok) {
				const errorResponse = (await this.handleResponseStatus<ErrorResponse>(
					response,
				)) as ErrorResponse;
				logger.info({
					message: "Failed content name edit",
					status: response.status,
					url: response.url,
					error: errorResponse.error,
				});
				return errorResponse;
			}

			logger.info({
				message: "Successful content name edit",
				status: response.status,
				url: response.url,
			});
			return { status: true, data: null };
		} catch (error) {
			logger.error({
				message: "Error editing content name",
				err: error,
				url: requestUrl,
			});
			return { status: false, error: GENERAL_ERROR_MESSAGE };
		}
	}

	async getContentItems(
		contentId: string,
		params?: ContentItemParams,
	): Promise<ApiResponse<ContentItemsResponse>> {
		let query: URLSearchParams | undefined;
		if (params) {
			query = new URLSearchParams({
				page: (params.page ?? DEFAULT_PAGE).toString(),
				perPage: (params.perPage ?? DEFAULT_PAGE_SIZE).toString(),
			});
		}
		const requestUrl = `models/${contentId}/items${query ? `?${query.toString()}` : ""}`;
		logger.info({ message: "Content items", contentId, url: requestUrl });

		try {
			const response = await fetchFromApi<ContentItemsResponse>(
				requestUrl,
				true,
				"GET",
			);

			if (!response.ok) {
				const errorResponse = (await this.handleResponseStatus<ErrorResponse>(
					response,
				)) as ErrorResponse;
				logger.info({
					message: "Failed get content items",
					status: response.status,
					url: response.url,
					error: errorResponse.error,
				});
				return errorResponse;
			}

			const data: ContentItemsResponse = await response.json();

			logger.info({
				message: "Successful get content items",
				status: response.status,
				url: response.url,
			});
			return { status: true, data };
		} catch (error) {
			logger.error({
				message: "Error get content items",
				err: error,
				url: requestUrl,
			});
			return { status: false, error: GENERAL_ERROR_MESSAGE };
		}
	}

	async importData(
		contentId: string,
		data: FormData | ImportOptions,
	): Promise<ApiResponse<null>> {
		const requestUrl = `models/${contentId}/import`;
		logger.info({
			message: "Import content data",
			contentId,
			data,
			url: requestUrl,
		});

		try {
			const response = await fetchFromApi<null>(requestUrl, true, "PUT", data);
			if (!response.ok) {
				const errorResponse = (await this.handleResponseStatus<ErrorResponse>(
					response,
				)) as ErrorResponse;
				logger.info({
					message: "Failed import content data",
					status: response.status,
					url: response.url,
					error: await response.text(),
				});
				return errorResponse;
			}
			logger.info({
				message: "Successful import content data",
				status: response.status,
				url: response.url,
			});
			return { status: true, data: null };
		} catch (error) {
			logger.error({
				message: "Error import content data",
				err: error,
				url: requestUrl,
			});
			return { status: false, error: GENERAL_ERROR_MESSAGE };
		}
	}

	async updateContentItem(item: Item) {
		const response = await fetchFromApi(`items/${item.id}`, true, "PATCH", {
			fields: item.fields,
		});
		if (!response.ok) {
			const errorResponse = (await this.handleResponseStatus<ErrorResponse>(
				response,
			)) as ErrorResponse;
			logger.info({
				message: "Failed to update item",
				status: response.status,
				url: response.url,
				error: errorResponse.error,
			});
			throw errorResponse;
		}
		logger.info({
			message: "Success to update item",
			status: response.status,
			url: response.url,
			item,
		});
		return {
			status: true,
			data: await response.json(),
		};
	}

	async addContentField(contentId: string, field: Omit<ContentField, "id">) {
		const requestUrl = `projects/${this.PROJECT_ID}/models/${contentId}/fields`;
		logger.info({ message: "Add field", contentId, url: requestUrl });

		try {
			const response = await fetchFromApi<null>(
				requestUrl,
				true,
				"POST",
				field,
			);

			if (!response.ok) {
				const errorResponse = (await this.handleResponseStatus<ErrorResponse>(
					response,
				)) as ErrorResponse;
				logger.info({
					message: "Failed field add",
					status: response.status,
					url: response.url,
					error: errorResponse.error,
				});
				return errorResponse;
			}

			logger.info({
				message: "Successful field add",
				status: response.status,
				url: response.url,
			});
			return { status: true, data: await response.json() };
		} catch (error) {
			logger.error({
				message: "Error add content",
				err: error,
				url: requestUrl,
			});
			return { status: false, error: GENERAL_ERROR_MESSAGE };
		}
	}

	async removeContentField(contentId: string, field: ContentField) {
		const requestUrl = `projects/${this.PROJECT_ID}/models/${contentId}/fields/${field.id}`;
		logger.info({ message: "Deleting field", contentId, url: requestUrl });

		try {
			const response = await fetchFromApi<null>(requestUrl, true, "DELETE");

			if (!response.ok) {
				const errorResponse = (await this.handleResponseStatus<ErrorResponse>(
					response,
				)) as ErrorResponse;
				logger.info({
					message: "Failed field delete",
					status: response.status,
					url: response.url,
					error: errorResponse.error,
				});
				return errorResponse;
			}

			logger.info({
				message: "Successful field delete",
				status: response.status,
				url: response.url,
			});
			return { status: true, data: await response.json() };
		} catch (error) {
			logger.error({
				message: "Error deleting content",
				err: error,
				url: requestUrl,
			});
			return { status: false, error: GENERAL_ERROR_MESSAGE };
		}
	}

	async updateContentField(contentId: string, field: ContentField) {
		const { id, ...newField } = field;
		const requestUrl = `projects/${this.PROJECT_ID}/models/${contentId}/fields/${id}`;
		logger.info({ message: "Editing field", contentId, url: requestUrl });

		try {
			const response = await fetchFromApi<null>(
				requestUrl,
				true,
				"PATCH",
				// @ts-ignore
				newField,
			);

			if (!response.ok) {
				const errorResponse = (await this.handleResponseStatus<ErrorResponse>(
					response,
				)) as ErrorResponse;
				logger.info({
					message: "Failed field delete",
					status: response.status,
					url: response.url,
					error: errorResponse.error,
				});
				return errorResponse;
			}

			logger.info({
				message: "Successful field delete",
				status: response.status,
				url: response.url,
			});
			return { status: true, data: await response.json() };
		} catch (error) {
			logger.error({
				message: "Error deleting content",
				err: error,
				url: requestUrl,
			});
			return { status: false, error: GENERAL_ERROR_MESSAGE };
		}
	}

	async deleteContentItem(item: TableItem) {
		const requestUrl = `items/${item.id}`;
		logger.info({ message: "Deleting item", url: requestUrl });

		try {
			const response = await fetchFromApi<null>(requestUrl, true, "DELETE");

			if (!response.ok) {
				const errorResponse = (await this.handleResponseStatus<ErrorResponse>(
					response,
				)) as ErrorResponse;
				logger.info({
					message: "Failed item delete",
					status: response.status,
					url: response.url,
					error: errorResponse.error,
				});
				return errorResponse;
			}

			logger.info({
				message: "Successful item delete",
				status: response.status,
				url: response.url,
			});
			return { status: true, data: await response.json() };
		} catch (error) {
			logger.error({
				message: "Error deleting content",
				err: error,
				url: requestUrl,
			});
			return { status: false, error: GENERAL_ERROR_MESSAGE };
		}
	}

	async createContentItem(item: ContentItemForCreate, modelId: string) {
		const response = await fetchFromApi(
			`models/${modelId}/items`,
			true,
			"POST",
			{
				fields: item.fields,
			},
		);
		if (!response.ok) {
			const errorResponse = (await this.handleResponseStatus<ErrorResponse>(
				response,
			)) as ErrorResponse;
			logger.info({
				message: "Failed to create item",
				status: response.status,
				url: response.url,
				error: errorResponse.error,
				item: item,
			});
			throw errorResponse.error;
		}
		return {
			status: true,
		};
	}

	async getSchemata(contentId: string) {
		const requestUrl = `schemata/${contentId}/schema.json`;
		logger.info({
			message: "Get schemata",
			contentId,
			url: requestUrl,
		});

		try {
			const response = await fetchFromApi<null>(requestUrl, true, "GET");

			if (!response.ok) {
				const errorResponse = (await this.handleResponseStatus<ErrorResponse>(
					response,
				)) as ErrorResponse;
				logger.info({
					message: "Failed to get schemata",
					status: response.status,
					url: response.url,
					error: errorResponse.error,
				});
				return errorResponse;
			}

			logger.info({
				message: "Successful get schemata",
				status: response.status,
				url: response.url,
			});
			return { status: true, data: await response.json() };
		} catch (error) {
			logger.error({
				message: "Error get schemata",
				err: error,
				url: requestUrl,
			});
			return { status: false, error: GENERAL_ERROR_MESSAGE };
		}
	}

	public async duplicateContent(
		contentId: string,
		name: string,
	): Promise<ApiResponse<ContentItem>> {
		const requestUrl = `models/${contentId}/copy`;
		logger.info({
			message: "Duplicate content",
			contentId,
			name,
			url: requestUrl,
		});

		try {
			const response = await fetchFromApi<null>(requestUrl, true, "POST", {
				name,
			});

			if (!response.ok) {
				const errorResponse = (await this.handleResponseStatus<ErrorResponse>(
					response,
				)) as ErrorResponse;
				logger.info({
					message: "Duplicate content failed",
					status: response.status,
					url: response.url,
					error: errorResponse.error,
				});
				return errorResponse;
			}

			logger.info({
				message: "Duplicate content success",
				status: response.status,
				url: response.url,
			});
			return { status: true, data: await response.json() };
		} catch (error) {
			logger.error({
				message: "Duplicate content failed",
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
			400: jp.message.common.invalidRequest,
			404: jp.message.content.contentNotFoundMessage,
			401: jp.message.content.unauthorizedContentAccess,
			500: jp.message.content.contentServerError,
			503: jp.message.content.contentServiceUnavailable,
		};

		const errorMessage =
			errorMessages[response.status] || GENERAL_ERROR_MESSAGE;
		return { status: false, error: errorMessage };
	}

	private toModel(content: ContentItem): Content {
		return new Content({
			createdAt: content.createdAt,
			description: content.description,
			id: content.id,
			contentId: content.id,
			key: content.key,
			lastModified: content.lastModified,
			metadataSchemaId: content.metadataSchemaId,
			metadataSchema: content.metadataSchema,
			name: content.name,
			projectId: content.projectId,
			public: content.public,
			schemaId: content.schemaId,
			schema: content.schema,
			updatedAt: content.updatedAt,
		});
	}
}
