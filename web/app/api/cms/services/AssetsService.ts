import type { CancelablePromise } from "../core/CancelablePromise";
import { OpenAPI } from "../core/OpenAPI";
import { request as __request } from "../core/request";
/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { asset } from "../models/asset";
export class AssetsService {
	/**
	 * get asset
	 * @returns asset assets list
	 * @throws ApiError
	 */
	public static assetGet({
		assetId,
	}: {
		/**
		 * ID of the selected asset
		 */
		assetId: string;
	}): CancelablePromise<asset> {
		return __request(OpenAPI, {
			method: "GET",
			url: "/assets/{assetId}",
			path: {
				assetId: assetId,
			},
			errors: {
				400: `Invalid request parameter value`,
				401: `Access token is missing or invalid`,
				404: `Not found`,
			},
		});
	}
	/**
	 * delete asset
	 * @returns any assets list
	 * @throws ApiError
	 */
	public static assetDelete({
		assetId,
	}: {
		/**
		 * ID of the selected asset
		 */
		assetId: string;
	}): CancelablePromise<{
		id?: string;
	}> {
		return __request(OpenAPI, {
			method: "DELETE",
			url: "/assets/{assetId}",
			path: {
				assetId: assetId,
			},
			errors: {
				400: `Invalid request parameter value`,
				401: `Access token is missing or invalid`,
				404: `Not found`,
			},
		});
	}
}
