import type { CancelablePromise } from "../core/CancelablePromise";
import { OpenAPI } from "../core/OpenAPI";
import { request as __request } from "../core/request";
/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { asset } from "../models/asset";
export class AssetsProjectService {
	/**
	 * Returns a list of assets.
	 * Returns a list of assets with filtering and ordering.
	 * @returns any assets list
	 * @throws ApiError
	 */
	public static assetFilter({
		projectId,
		sort = "createdAt",
		dir = "desc",
		page = 1,
		perPage = 50,
		keyword,
	}: {
		/**
		 * ID of the selected project
		 */
		projectId: any;
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
		 * keyword string
		 */
		keyword?: string;
	}): CancelablePromise<{
		items?: Array<asset>;
		totalCount?: number;
		page?: number;
		perPage?: number;
	}> {
		return __request(OpenAPI, {
			method: "GET",
			url: "/projects/{projectId}/assets",
			path: {
				projectId: projectId,
			},
			query: {
				sort: sort,
				dir: dir,
				page: page,
				perPage: perPage,
				keyword: keyword,
			},
			errors: {
				400: `Invalid request parameter value`,
				401: `Access token is missing or invalid`,
				404: `Not found`,
			},
		});
	}
	/**
	 * Create an new asset.
	 * Create a new asset and return the created asset.
	 * @returns asset assets
	 * @throws ApiError
	 */
	public static assetCreate({
		projectId,
		formData,
	}: {
		/**
		 * ID of the selected project
		 */
		projectId: any;
		formData?: {
			file?: Blob;
			skipDecompression?: boolean;
		};
	}): CancelablePromise<asset> {
		return __request(OpenAPI, {
			method: "POST",
			url: "/projects/{projectId}/assets",
			path: {
				projectId: projectId,
			},
			formData: formData,
			mediaType: "multipart/form-data",
			errors: {
				400: `Invalid request parameter value`,
				401: `Access token is missing or invalid`,
				404: `Not found`,
			},
		});
	}
	/**
	 * Upload an asset.
	 * Issue a URL and a token to upload an asset.
	 * @returns any asset upload
	 * @throws ApiError
	 */
	public static assetUploadCreate({
		projectId,
		requestBody,
	}: {
		/**
		 * ID of the selected project
		 */
		projectId: any;
		requestBody?: {
			name?: string;
			contentLength?: number;
			cursor?: string;
		};
	}): CancelablePromise<{
		url?: string;
		token?: string;
		contentType?: string;
		contentLength?: number;
		next?: string;
	}> {
		return __request(OpenAPI, {
			method: "POST",
			url: "/projects/{projectId}/assets/uploads",
			path: {
				projectId: projectId,
			},
			body: requestBody,
			mediaType: "application/json",
			errors: {
				400: `Invalid request parameter value`,
				401: `Access token is missing or invalid`,
				404: `Not found`,
			},
		});
	}
}
