import type { CancelablePromise } from "../core/CancelablePromise";
import { OpenAPI } from "../core/OpenAPI";
import { request as __request } from "../core/request";
/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { model } from "../models/model";
import type { schemaField } from "../models/schemaField";
export class ModelsService {
	/**
	 * Returns a list of models.
	 * Returns a list of models.
	 * @returns any A JSON array of user names
	 * @throws ApiError
	 */
	public static modelFilter({
		projectIdOrAlias,
		page = 1,
		perPage = 50,
	}: {
		/**
		 * ID or alias of the project
		 */
		projectIdOrAlias: string;
		/**
		 * Used to select the page
		 */
		page?: number;
		/**
		 * Used to select the page
		 */
		perPage?: number;
	}): CancelablePromise<{
		models?: Array<model>;
		totalCount?: number;
		page?: number;
		perPage?: number;
	}> {
		return __request(OpenAPI, {
			method: "GET",
			url: "/projects/{projectIdOrAlias}/models",
			path: {
				projectIdOrAlias: projectIdOrAlias,
			},
			query: {
				page: page,
				perPage: perPage,
			},
			errors: {
				400: `Invalid request parameter value`,
				401: `Access token is missing or invalid`,
				404: `Not found`,
				500: `Internal server error`,
			},
		});
	}
	/**
	 * create a model
	 * @returns model A JSON object of model
	 * @throws ApiError
	 */
	public static modelCreate({
		projectIdOrAlias,
		requestBody,
		page = 1,
		perPage = 50,
	}: {
		/**
		 * ID or alias of the project
		 */
		projectIdOrAlias: string;
		requestBody: {
			name?: string;
			description?: string;
			key?: string;
		};
		/**
		 * Used to select the page
		 */
		page?: number;
		/**
		 * Used to select the page
		 */
		perPage?: number;
	}): CancelablePromise<model> {
		return __request(OpenAPI, {
			method: "POST",
			url: "/projects/{projectIdOrAlias}/models",
			path: {
				projectIdOrAlias: projectIdOrAlias,
			},
			query: {
				page: page,
				perPage: perPage,
			},
			body: requestBody,
			mediaType: "application/json",
			errors: {
				400: `Invalid request parameter value`,
				401: `Access token is missing or invalid`,
			},
		});
	}
	/**
	 * Returns a model.
	 * Returns a model.
	 * @returns model A JSON array of user names
	 * @throws ApiError
	 */
	public static modelGet({
		modelId,
	}: {
		/**
		 * ID of the model in the project
		 */
		modelId: string;
	}): CancelablePromise<model> {
		return __request(OpenAPI, {
			method: "GET",
			url: "/models/{modelId}",
			path: {
				modelId: modelId,
			},
			errors: {
				400: `Invalid request parameter value`,
				401: `Access token is missing or invalid`,
				404: `Not found`,
				500: `Internal server error`,
			},
		});
	}
	/**
	 * Update a model.
	 * Update a model.
	 * @returns model A JSON object of model
	 * @throws ApiError
	 */
	public static modelUpdate({
		modelId,
		requestBody,
	}: {
		/**
		 * ID of the model in the project
		 */
		modelId: string;
		requestBody: {
			name?: string;
			description?: string;
			key?: string;
		};
	}): CancelablePromise<model> {
		return __request(OpenAPI, {
			method: "PATCH",
			url: "/models/{modelId}",
			path: {
				modelId: modelId,
			},
			body: requestBody,
			mediaType: "application/json",
			errors: {
				400: `Invalid request parameter value`,
				401: `Access token is missing or invalid`,
			},
		});
	}
	/**
	 * delete a model
	 * @returns any delete a model
	 * @throws ApiError
	 */
	public static modelDelete({
		modelId,
	}: {
		/**
		 * ID of the model in the project
		 */
		modelId: string;
	}): CancelablePromise<{
		id?: string;
	}> {
		return __request(OpenAPI, {
			method: "DELETE",
			url: "/models/{modelId}",
			path: {
				modelId: modelId,
			},
			errors: {
				400: `Invalid request parameter value`,
				401: `Access token is missing or invalid`,
			},
		});
	}
	/**
	 * Import data under the selected model
	 * @returns any A JSON object of import status
	 * @throws ApiError
	 */
	public static modelImport({
		modelId,
		requestBody,
	}: {
		/**
		 * ID of the model in the project
		 */
		modelId: string;
		requestBody: {
			assetId: string;
			format: "geoJson" | "json";
			strategy: "insert" | "update" | "upsert";
			mutateSchema?: boolean;
			geometryFieldKey?: string;
		};
	}): CancelablePromise<{
		modelId?: string;
		itemsCount?: number;
		insertedCount?: number;
		updatedCount?: number;
		ignoredCount?: number;
		newFields?: Array<schemaField>;
	}> {
		return __request(OpenAPI, {
			method: "PUT",
			url: "/models/{modelId}/import",
			path: {
				modelId: modelId,
			},
			body: requestBody,
			mediaType: "application/json",
			errors: {
				400: `Invalid request parameter value`,
				401: `Access token is missing or invalid`,
				500: `Internal server error`,
			},
		});
	}
	/**
	 * Returns a model.
	 * Returns a model.
	 * @returns model A JSON array of user names
	 * @throws ApiError
	 */
	public static modelGetWithProject({
		projectIdOrAlias,
		modelIdOrKey,
	}: {
		/**
		 * ID or alias of the project
		 */
		projectIdOrAlias: string;
		/**
		 * ID or key of the model in the project
		 */
		modelIdOrKey: string;
	}): CancelablePromise<model> {
		return __request(OpenAPI, {
			method: "GET",
			url: "/projects/{projectIdOrAlias}/models/{modelIdOrKey}",
			path: {
				projectIdOrAlias: projectIdOrAlias,
				modelIdOrKey: modelIdOrKey,
			},
			errors: {
				400: `Invalid request parameter value`,
				401: `Access token is missing or invalid`,
				404: `Not found`,
				500: `Internal server error`,
			},
		});
	}
	/**
	 * Update a model.
	 * Update a model.
	 * @returns model A JSON object of model
	 * @throws ApiError
	 */
	public static modelUpdateWithProject({
		projectIdOrAlias,
		modelIdOrKey,
		requestBody,
	}: {
		/**
		 * ID or alias of the project
		 */
		projectIdOrAlias: string;
		/**
		 * ID or key of the model in the project
		 */
		modelIdOrKey: string;
		requestBody: {
			name?: string;
			description?: string;
			key?: string;
		};
	}): CancelablePromise<model> {
		return __request(OpenAPI, {
			method: "PATCH",
			url: "/projects/{projectIdOrAlias}/models/{modelIdOrKey}",
			path: {
				projectIdOrAlias: projectIdOrAlias,
				modelIdOrKey: modelIdOrKey,
			},
			body: requestBody,
			mediaType: "application/json",
			errors: {
				400: `Invalid request parameter value`,
				401: `Access token is missing or invalid`,
				404: `Not found`,
				500: `Internal server error`,
			},
		});
	}
	/**
	 * Delete a model.
	 * Delete a model.
	 * @returns any The model id
	 * @throws ApiError
	 */
	public static modelDeleteWithProject({
		projectIdOrAlias,
		modelIdOrKey,
	}: {
		/**
		 * ID or alias of the project
		 */
		projectIdOrAlias: string;
		/**
		 * ID or key of the model in the project
		 */
		modelIdOrKey: string;
	}): CancelablePromise<{
		id?: string;
	}> {
		return __request(OpenAPI, {
			method: "DELETE",
			url: "/projects/{projectIdOrAlias}/models/{modelIdOrKey}",
			path: {
				projectIdOrAlias: projectIdOrAlias,
				modelIdOrKey: modelIdOrKey,
			},
			errors: {
				400: `Invalid request parameter value`,
				401: `Access token is missing or invalid`,
				404: `Not found`,
				500: `Internal server error`,
			},
		});
	}
}
