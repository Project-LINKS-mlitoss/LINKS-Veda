import type { CancelablePromise } from "../core/CancelablePromise";
import { OpenAPI } from "../core/OpenAPI";
import { request as __request } from "../core/request";
/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { comment } from "../models/comment";
export class AssetsCommentsService {
	/**
	 * get asset comments
	 * @returns any asset comments list
	 * @throws ApiError
	 */
	public static assetCommentList({
		assetId,
	}: {
		/**
		 * ID of the selected asset
		 */
		assetId: string;
	}): CancelablePromise<{
		comments?: Array<comment>;
	}> {
		return __request(OpenAPI, {
			method: "GET",
			url: "/assets/{assetId}/comments",
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
	 * create asset comments
	 * @returns comment
	 * @throws ApiError
	 */
	public static assetCommentCreate({
		assetId,
		requestBody,
	}: {
		/**
		 * ID of the selected asset
		 */
		assetId: string;
		requestBody: {
			content?: string;
		};
	}): CancelablePromise<comment> {
		return __request(OpenAPI, {
			method: "POST",
			url: "/assets/{assetId}/comments",
			path: {
				assetId: assetId,
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
	/**
	 * Update AssetComment
	 * @returns comment Update An asset comment
	 * @throws ApiError
	 */
	public static assetCommentUpdate({
		assetId,
		commentId,
		requestBody,
	}: {
		/**
		 * ID of the selected asset
		 */
		assetId: string;
		/**
		 * ID of the selected comment
		 */
		commentId: string;
		requestBody: {
			content?: string;
		};
	}): CancelablePromise<comment> {
		return __request(OpenAPI, {
			method: "PATCH",
			url: "/assets/{assetId}/comments/{commentId}",
			path: {
				assetId: assetId,
				commentId: commentId,
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
	/**
	 * delete asset comments
	 * @returns any delete an asset comment
	 * @throws ApiError
	 */
	public static assetCommentDelete({
		assetId,
		commentId,
	}: {
		/**
		 * ID of the selected asset
		 */
		assetId: string;
		/**
		 * ID of the selected comment
		 */
		commentId: string;
	}): CancelablePromise<{
		id?: string;
	}> {
		return __request(OpenAPI, {
			method: "DELETE",
			url: "/assets/{assetId}/comments/{commentId}",
			path: {
				assetId: assetId,
				commentId: commentId,
			},
			errors: {
				400: `Invalid request parameter value`,
				401: `Access token is missing or invalid`,
				404: `Not found`,
			},
		});
	}
}
