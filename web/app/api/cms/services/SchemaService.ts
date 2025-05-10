import type { CancelablePromise } from "../core/CancelablePromise";
import { OpenAPI } from "../core/OpenAPI";
import { request as __request } from "../core/request";
/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { schemaJSON } from "../models/schemaJSON";
export class SchemaService {
	/**
	 * Returns a schema as json by schema ID
	 * Returns a schema as json by schema ID
	 * @returns schemaJSON A JSON object
	 * @throws ApiError
	 */
	public static schemaByIdAsJson({
		schemaId,
	}: {
		/**
		 * ID of the schema in the model
		 */
		schemaId: string;
	}): CancelablePromise<schemaJSON> {
		return __request(OpenAPI, {
			method: "GET",
			url: "/schemata/{schemaId}/schema.json",
			path: {
				schemaId: schemaId,
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
	 * Returns a schema as json by project and schema ID
	 * Returns a schema as json by project and schema ID
	 * @returns schemaJSON A JSON object
	 * @throws ApiError
	 */
	public static schemaByIdWithProjectAsJson({
		projectIdOrAlias,
		schemaId,
	}: {
		/**
		 * ID or alias of the project
		 */
		projectIdOrAlias: string;
		/**
		 * ID of the schema in the model
		 */
		schemaId: string;
	}): CancelablePromise<schemaJSON> {
		return __request(OpenAPI, {
			method: "GET",
			url: "/projects/{projectIdOrAlias}/schemata/{schemaId}/schema.json",
			path: {
				projectIdOrAlias: projectIdOrAlias,
				schemaId: schemaId,
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
	 * Returns a schema as json by model ID
	 * Returns a schema as json by model ID
	 * @returns schemaJSON A JSON object
	 * @throws ApiError
	 */
	public static schemaByModelAsJson({
		modelId,
	}: {
		/**
		 * ID of the model in the project
		 */
		modelId: string;
	}): CancelablePromise<schemaJSON> {
		return __request(OpenAPI, {
			method: "GET",
			url: "/models/{modelId}/schema.json",
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
	 * Returns a schema as json by project and model ID
	 * Returns a schema as json by project and model ID
	 * @returns schemaJSON A JSON object
	 * @throws ApiError
	 */
	public static schemaByModelWithProjectAsJson({
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
	}): CancelablePromise<schemaJSON> {
		return __request(OpenAPI, {
			method: "GET",
			url: "/projects/{projectIdOrAlias}/models/{modelIdOrKey}/schema.json",
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
