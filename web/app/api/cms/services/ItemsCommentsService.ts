import type { CancelablePromise } from "../core/CancelablePromise";
import { OpenAPI } from "../core/OpenAPI";
import { request as __request } from "../core/request";
/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { comment } from "../models/comment";
export class ItemsCommentsService {
	/**
	 * get an item comment
	 * @returns any item comments list
	 * @throws ApiError
	 */
	public static itemCommentList({
		itemId,
	}: {
		/**
		 * ID of the selected item
		 */
		itemId: string;
	}): CancelablePromise<{
		comments?: Array<comment>;
	}> {
		return __request(OpenAPI, {
			method: "GET",
			url: "/items/{itemId}/comments",
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
	/**
	 * create an item comment
	 * @returns comment
	 * @throws ApiError
	 */
	public static itemCommentCreate({
		itemId,
		requestBody,
	}: {
		/**
		 * ID of the selected item
		 */
		itemId: string;
		requestBody: {
			content?: string;
		};
	}): CancelablePromise<comment> {
		return __request(OpenAPI, {
			method: "POST",
			url: "/items/{itemId}/comments",
			path: {
				itemId: itemId,
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
	 * Update Item Comment
	 * @returns comment Update An item comment
	 * @throws ApiError
	 */
	public static itemCommentUpdate({
		itemId,
		commentId,
		requestBody,
	}: {
		/**
		 * ID of the selected item
		 */
		itemId: string;
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
			url: "/items/{itemId}/comments/{commentId}",
			path: {
				itemId: itemId,
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
	 * delete item comment
	 * @returns any delete an item comment
	 * @throws ApiError
	 */
	public static itemCommentDelete({
		itemId,
		commentId,
	}: {
		/**
		 * ID of the selected item
		 */
		itemId: string;
		/**
		 * ID of the selected comment
		 */
		commentId: string;
	}): CancelablePromise<{
		id?: string;
	}> {
		return __request(OpenAPI, {
			method: "DELETE",
			url: "/items/{itemId}/comments/{commentId}",
			path: {
				itemId: itemId,
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
