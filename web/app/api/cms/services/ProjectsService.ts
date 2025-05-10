import type { CancelablePromise } from "../core/CancelablePromise";
import { OpenAPI } from "../core/OpenAPI";
import { request as __request } from "../core/request";
/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { project } from "../models/project";
export class ProjectsService {
	/**
	 * Returns a list of projects.
	 * Returns a list of projects
	 * @returns any A JSON array of projects
	 * @throws ApiError
	 */
	public static projectFilter({
		workspaceId,
		page = 1,
		perPage = 50,
	}: {
		/**
		 * ID of the selected workspace
		 */
		workspaceId: any;
		/**
		 * Used to select the page
		 */
		page?: number;
		/**
		 * Used to select the page
		 */
		perPage?: number;
	}): CancelablePromise<{
		projects?: Array<project>;
		totalCount?: number;
		page?: number;
		perPage?: number;
	}> {
		return __request(OpenAPI, {
			method: "GET",
			url: "/{workspaceId}/projects",
			path: {
				workspaceId: workspaceId,
			},
			query: {
				page: page,
				perPage: perPage,
			},
			errors: {
				400: `Invalid request parameter value`,
				401: `Access token is missing or invalid`,
				404: `The requested resource was not found`,
				500: `Internal server error`,
			},
		});
	}
}
