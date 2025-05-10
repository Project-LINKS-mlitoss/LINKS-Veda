import type { CancelablePromise } from "../core/CancelablePromise";
import { OpenAPI } from "../core/OpenAPI";
import { request as __request } from "../core/request";
/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FeatureCollection } from "../models/FeatureCollection";
export class GeoJsonService {
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
}
