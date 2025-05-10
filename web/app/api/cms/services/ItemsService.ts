import type { CancelablePromise } from "../core/CancelablePromise";
import { OpenAPI } from "../core/OpenAPI";
import { request as __request } from "../core/request";
import type { FeatureCollection } from "../models/FeatureCollection";
/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { assetEmbedding } from "../models/assetEmbedding";
import type { condition } from "../models/condition";
import type { field } from "../models/field";
import type { versionedItem } from "../models/versionedItem";
export class ItemsService {
	/**
	 * Returns a list of items.
	 * Returns a list of items with filtering and ordering.
	 * @returns any A JSON array of user names
	 * @throws ApiError
	 */
	public static itemFilter({
		modelId,
		sort = "createdAt",
		dir = "desc",
		page = 1,
		perPage = 50,
		ref = "latest",
		asset,
		keyword,
		requestBody,
	}: {
		/**
		 * ID of the model in the project
		 */
		modelId: string;
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
		/**
		 * keyword string
		 */
		keyword?: string;
		requestBody?: {
			filter?: condition;
		};
	}): CancelablePromise<{
		items?: Array<versionedItem>;
		totalCount?: number;
		page?: number;
		perPage?: number;
	}> {
		return __request(OpenAPI, {
			method: "GET",
			url: "/models/{modelId}/items",
			path: {
				modelId: modelId,
			},
			query: {
				sort: sort,
				dir: dir,
				page: page,
				perPage: perPage,
				ref: ref,
				asset: asset,
				keyword: keyword,
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
	 * create an item
	 * @returns versionedItem A JSON array of user names
	 * @throws ApiError
	 */
	public static itemCreate({
		modelId,
		requestBody,
	}: {
		/**
		 * ID of the model in the project
		 */
		modelId: string;
		requestBody: {
			fields?: Array<field>;
			metadataFields?: Array<field>;
		};
	}): CancelablePromise<versionedItem> {
		return __request(OpenAPI, {
			method: "POST",
			url: "/models/{modelId}/items",
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
	 * Returns a GeoJSON that has a list of items as features.
	 * Returns a GeoJSON that has a list of items as features.
	 * @returns FeatureCollection A GeoJSON object
	 * @throws ApiError
	 */
	public static itemsAsGeoJson({
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
	}): CancelablePromise<FeatureCollection> {
		return __request(OpenAPI, {
			method: "GET",
			url: "/models/{modelId}/items.geojson",
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
	 * Returns an item.
	 * Returns an item.
	 * @returns versionedItem An item
	 * @throws ApiError
	 */
	public static itemGet({
		itemId,
		ref = "latest",
		asset,
	}: {
		/**
		 * ID of the selected item
		 */
		itemId: string;
		/**
		 * Used to select a ref or ver
		 */
		ref?: "latest" | "public";
		/**
		 * Specifies whether asset data are embedded in the results
		 */
		asset?: assetEmbedding;
	}): CancelablePromise<versionedItem> {
		return __request(OpenAPI, {
			method: "GET",
			url: "/items/{itemId}",
			path: {
				itemId: itemId,
			},
			query: {
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
	 * Update an item.
	 * Update an item.
	 * @returns versionedItem An item
	 * @throws ApiError
	 */
	public static itemUpdate({
		itemId,
		requestBody,
	}: {
		/**
		 * ID of the selected item
		 */
		itemId: string;
		requestBody: {
			fields?: Array<field>;
			metadataFields?: Array<field>;
			asset?: assetEmbedding;
		};
	}): CancelablePromise<versionedItem> {
		return __request(OpenAPI, {
			method: "PATCH",
			url: "/items/{itemId}",
			path: {
				itemId: itemId,
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
	 * delete an item
	 * @returns any delete an item
	 * @throws ApiError
	 */
	public static itemDelete({
		itemId,
	}: {
		/**
		 * ID of the selected item
		 */
		itemId: string;
	}): CancelablePromise<{
		id?: string;
	}> {
		return __request(OpenAPI, {
			method: "DELETE",
			url: "/items/{itemId}",
			path: {
				itemId: itemId,
			},
			errors: {
				400: `Invalid request parameter value`,
				401: `Access token is missing or invalid`,
				404: `Not found`,
			},
		});
	}
}
