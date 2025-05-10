import type { CancelablePromise } from "../core/CancelablePromise";
import { OpenAPI } from "../core/OpenAPI";
import { request as __request } from "../core/request";
/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { model } from "../models/model";
export class SchemataService {
	/**
	 * Returns a schema.
	 * Returns a schema.
	 * @returns any A JSON array of schema objects
	 * @throws ApiError
	 */
	public static schemaFilter({
		projectIdOrAlias,
		page = 1,
		perPage = 50,
		keyword,
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
		/**
		 * keyword string
		 */
		keyword?: string;
	}): CancelablePromise<{
		models?: Array<model>;
		totalCount?: number;
		page?: number;
		perPage?: number;
	}> {
		return __request(OpenAPI, {
			method: "GET",
			url: "/projects/{projectIdOrAlias}/schemata",
			path: {
				projectIdOrAlias: projectIdOrAlias,
			},
			query: {
				page: page,
				perPage: perPage,
				keyword: keyword,
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
