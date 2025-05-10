import type { CancelablePromise } from "../core/CancelablePromise";
import { OpenAPI } from "../core/OpenAPI";
import { request as __request } from "../core/request";
/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { schemaJSON } from "../models/schemaJSON";
export class MetadataSchemaService {
	/**
	 * Returns a metadata schema as json by model ID
	 * Returns a metadata schema as json by model ID
	 * @returns schemaJSON A JSON object
	 * @throws ApiError
	 */
	public static metadataSchemaByModelAsJson({
		modelId,
	}: {
		/**
		 * ID of the model in the project
		 */
		modelId: string;
	}): CancelablePromise<schemaJSON> {
		return __request(OpenAPI, {
			method: "GET",
			url: "/models/{modelId}/metadata_schema.json",
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
	 * Returns a metadata schema as json by project and model ID
	 * Returns a metadata schema as json by project and model ID
	 * @returns schemaJSON A JSON object
	 * @throws ApiError
	 */
	public static metadataSchemaByModelWithProjectAsJson({
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
			url: "/projects/{projectIdOrAlias}/models/{modelIdOrKey}/metadata_schema.json",
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
