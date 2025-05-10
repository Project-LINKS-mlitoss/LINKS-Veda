import type { CancelablePromise } from "../core/CancelablePromise";
import { OpenAPI } from "../core/OpenAPI";
import { request as __request } from "../core/request";
/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { schemaField } from "../models/schemaField";
import type { valueType } from "../models/valueType";
export class FieldsService {
	/**
	 * create a field
	 * @returns schemaField A JSON object of field
	 * @throws ApiError
	 */
	public static fieldCreate({
		schemaId,
		requestBody,
	}: {
		/**
		 * ID of the schema in the model
		 */
		schemaId: string;
		requestBody: {
			type?: valueType;
			key?: string;
			required?: boolean;
			multiple?: boolean;
		};
	}): CancelablePromise<schemaField> {
		return __request(OpenAPI, {
			method: "POST",
			url: "/schemata/{schemaId}/fields",
			path: {
				schemaId: schemaId,
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
	 * update a field
	 * @returns schemaField A JSON object of field
	 * @throws ApiError
	 */
	public static fieldUpdate({
		schemaId,
		fieldIdOrKey,
		requestBody,
	}: {
		/**
		 * ID of the schema in the model
		 */
		schemaId: string;
		/**
		 * ID or key of the field in the models schema
		 */
		fieldIdOrKey: string;
		requestBody: {
			type?: valueType;
			key?: string;
			required?: boolean;
			multiple?: boolean;
		};
	}): CancelablePromise<schemaField> {
		return __request(OpenAPI, {
			method: "PATCH",
			url: "/schemata/{schemaId}/fields/{fieldIdOrKey}",
			path: {
				schemaId: schemaId,
				fieldIdOrKey: fieldIdOrKey,
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
	 * delete a field
	 * @returns any A JSON object of field
	 * @throws ApiError
	 */
	public static fieldDelete({
		schemaId,
		fieldIdOrKey,
	}: {
		/**
		 * ID of the schema in the model
		 */
		schemaId: string;
		/**
		 * ID or key of the field in the models schema
		 */
		fieldIdOrKey: string;
	}): CancelablePromise<{
		id?: string;
	}> {
		return __request(OpenAPI, {
			method: "DELETE",
			url: "/schemata/{schemaId}/fields/{fieldIdOrKey}",
			path: {
				schemaId: schemaId,
				fieldIdOrKey: fieldIdOrKey,
			},
			errors: {
				400: `Invalid request parameter value`,
				401: `Access token is missing or invalid`,
			},
		});
	}
	/**
	 * create a field
	 * @returns schemaField A JSON object of field
	 * @throws ApiError
	 */
	public static fieldCreateWithProject({
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
			type?: valueType;
			key?: string;
			required?: boolean;
			multiple?: boolean;
		};
	}): CancelablePromise<schemaField> {
		return __request(OpenAPI, {
			method: "POST",
			url: "/projects/{projectIdOrAlias}/models/{modelIdOrKey}/fields",
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
	 * update a field
	 * @returns schemaField A JSON object of field
	 * @throws ApiError
	 */
	public static fieldUpdateWithProject({
		projectIdOrAlias,
		modelIdOrKey,
		fieldIdOrKey,
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
		/**
		 * ID or key of the field in the models schema
		 */
		fieldIdOrKey: string;
		requestBody: {
			type?: valueType;
			key?: string;
			required?: boolean;
			multiple?: boolean;
		};
	}): CancelablePromise<schemaField> {
		return __request(OpenAPI, {
			method: "PATCH",
			url: "/projects/{projectIdOrAlias}/models/{modelIdOrKey}/fields/{fieldIdOrKey}",
			path: {
				projectIdOrAlias: projectIdOrAlias,
				modelIdOrKey: modelIdOrKey,
				fieldIdOrKey: fieldIdOrKey,
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
	 * Delete a field.
	 * Returns the field id.
	 * @returns any A field id
	 * @throws ApiError
	 */
	public static fieldDeleteWithProject({
		projectIdOrAlias,
		modelIdOrKey,
		fieldIdOrKey,
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
		 * ID or key of the field in the models schema
		 */
		fieldIdOrKey: string;
	}): CancelablePromise<{
		id?: string;
	}> {
		return __request(OpenAPI, {
			method: "DELETE",
			url: "/projects/{projectIdOrAlias}/models/{modelIdOrKey}/fields/{fieldIdOrKey}",
			path: {
				projectIdOrAlias: projectIdOrAlias,
				modelIdOrKey: modelIdOrKey,
				fieldIdOrKey: fieldIdOrKey,
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
