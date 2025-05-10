/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from "../core/CancelablePromise";
import { OpenAPI } from "../core/OpenAPI";
import { request as __request } from "../core/request";
export class CsvService {
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
