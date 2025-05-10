import type { CancelablePromise } from "../core/CancelablePromise";
import { OpenAPI } from "../core/OpenAPI";
import { request as __request } from "../core/request";
import type { FeatureCollection } from "../models/FeatureCollection";
/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { assetEmbedding } from "../models/assetEmbedding";
import type { field } from "../models/field";
import type { versionedItem } from "../models/versionedItem";
export class ItemsProjectService {
	/**
	 * Returns a CSV that has a list of items as features.
	 * Returns a CSV that has a list of items as features.
	 * @returns binary A string in CSV format
	 * @throws ApiError
	 */
	public static itemsAsCsv({
		modelId,
		page = 1,
		perPage = 50,
		ref = "latest",
	}: {
		/**
		 * ID of the model in the project
		 */
		modelId: string;
		/**
		 * Used to select the page
		 */
		page?: number;
		/**
		 * Used to select the page
		 */
		perPage?: number;
		/**
		 * Used to select a ref or ver
		 */
		ref?: "latest" | "public";
	}): CancelablePromise<Blob> {
		return __request(OpenAPI, {
			method: "GET",
			url: "/models/{modelId}/items.csv",
			path: {
				modelId: modelId,
			},
			query: {
				page: page,
				perPage: perPage,
				ref: ref,
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
	 * Returns a list of items.
	 * Returns a list of items with filtering and ordering.
	 * @returns any A JSON array of user names
	 * @throws ApiError
	 */
	public static itemFilterWithProject({
		projectIdOrAlias,
		modelIdOrKey,
		sort = "createdAt",
		dir = "desc",
		page = 1,
		perPage = 50,
		ref = "latest",
		asset,
	}: {
		/**
		 * ID or alias of the project
		 */
		projectIdOrAlias: string;
		/**
		 * ID or key of the model in the project
		 */
		modelIdOrKey: string;
		/**
		 * Used to define the order of the response list
		 */
		sort?: "createdAt" | "updatedAt";
		/**
		 * Used to define the order direction of the response list, will be ignored if the order is not presented
		 */
		dir?: "asc" | "desc";
		/**
		 * Used to select the page
		 */
		page?: number;
		/**
		 * Used to select the page
		 */
		perPage?: number;
		/**
		 * Used to select a ref or ver
		 */
		ref?: "latest" | "public";
		/**
		 * Specifies whether asset data are embedded in the results
		 */
		asset?: assetEmbedding;
	}): CancelablePromise<{
		items?: Array<versionedItem>;
		totalCount?: number;
		page?: number;
		perPage?: number;
	}> {
		return __request(OpenAPI, {
			method: "GET",
			url: "/projects/{projectIdOrAlias}/models/{modelIdOrKey}/items",
			path: {
				projectIdOrAlias: projectIdOrAlias,
				modelIdOrKey: modelIdOrKey,
			},
			query: {
				sort: sort,
				dir: dir,
				page: page,
				perPage: perPage,
				ref: ref,
				asset: asset,
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
	 * Create an Item.
	 * Create an Item.
	 * @returns versionedItem A JSON array of user names
	 * @throws ApiError
	 */
	public static itemCreateWithProject({
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
			fields?: Array<field>;
			metadataFields?: Array<field>;
		};
	}): CancelablePromise<versionedItem> {
		return __request(OpenAPI, {
			method: "POST",
			url: "/projects/{projectIdOrAlias}/models/{modelIdOrKey}/items",
			path: {
				projectIdOrAlias: projectIdOrAlias,
				modelIdOrKey: modelIdOrKey,
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
	 * Returns a GeoJSON that has a list of items as features.
	 * Returns a GeoJSON that has a list of items as features.
	 * @returns FeatureCollection A GeoJSON object
	 * @throws ApiError
	 */
	public static itemsWithProjectAsGeoJson({
		projectIdOrAlias,
		modelIdOrKey,
		page = 1,
		perPage = 50,
		ref = "latest",
	}: {
		/**
		 * ID or alias of the project
		 */
		projectIdOrAlias: string;
		/**
		 * ID or key of the model in the project
		 */
		modelIdOrKey: string;
		/**
		 * Used to select the page
		 */
		page?: number;
		/**
		 * Used to select the page
		 */
		perPage?: number;
		/**
		 * Used to select a ref or ver
		 */
		ref?: "latest" | "public";
	}): CancelablePromise<FeatureCollection> {
		return __request(OpenAPI, {
			method: "GET",
			url: "/projects/{projectIdOrAlias}/models/{modelIdOrKey}/items.geojson",
			path: {
				projectIdOrAlias: projectIdOrAlias,
				modelIdOrKey: modelIdOrKey,
			},
			query: {
				page: page,
				perPage: perPage,
				ref: ref,
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
	 * Returns a CSV that has a list of items as features.
	 * Returns a CSV that has a list of items as features.
	 * @returns binary A string in CSV format
	 * @throws ApiError
	 */
	public static itemsWithProjectAsCsv({
		projectIdOrAlias,
		modelIdOrKey,
		page = 1,
		perPage = 50,
		ref = "latest",
	}: {
		/**
		 * ID or alias of the project
		 */
		projectIdOrAlias: string;
		/**
		 * ID or key of the model in the project
		 */
		modelIdOrKey: string;
		/**
		 * Used to select the page
		 */
		page?: number;
		/**
		 * Used to select the page
		 */
		perPage?: number;
		/**
		 * Used to select a ref or ver
		 */
		ref?: "latest" | "public";
	}): CancelablePromise<Blob> {
		return __request(OpenAPI, {
			method: "GET",
			url: "/projects/{projectIdOrAlias}/models/{modelIdOrKey}/items.csv",
			path: {
				projectIdOrAlias: projectIdOrAlias,
				modelIdOrKey: modelIdOrKey,
			},
			query: {
				page: page,
				perPage: perPage,
				ref: ref,
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
