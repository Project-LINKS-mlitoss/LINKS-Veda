import { randomUUID } from "node:crypto";
import jp from "~/commons/locales/jp";
import { logger } from "~/logger";

const ACCESS_TOKEN = process.env.VITE_ACCESS_TOKEN;
const CMS_API_URL = process.env.VITE_CMS_API_URL;

export type SuccessResponse<T> = { status: true; data: T; actionType?: string };
export type JsonifyObject<T> = T extends Record<string, unknown> ? T : never;
export type ErrorResponse = {
	status: false;
	error: string;
	actionType?: string;
};
export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

export type RequestBody = Record<string, unknown> | FormData;

export async function fetchFromApi<T>(
	endpoint: string,
	isAuthen = true,
	method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" = "GET",
	body?: RequestBody,
	traceId: string = randomUUID(),
): Promise<Response> {
	const headers: HeadersInit = {};

	if (body && !(body instanceof FormData)) {
		headers["Content-Type"] = "application/json";
	}

	if (isAuthen && ACCESS_TOKEN) {
		headers.Authorization = `Bearer ${ACCESS_TOKEN}`;
	}

	const requestOptions: RequestInit = {
		method,
		headers,
	};

	if (body) {
		requestOptions.body =
			body instanceof FormData ? body : JSON.stringify(body);
	}

	logger.info(
		{ method, endpoint, ...(traceId ? { traceId } : {}) },
		"Sending CMS API request",
	);

	const startTime = Date.now();
	try {
		const response = await fetch(`${CMS_API_URL}/${endpoint}`, requestOptions);
		const duration = Date.now() - startTime;

		logger.info(
			{
				method,
				endpoint,
				status: response.status,
				duration,
				...(traceId ? { traceId } : {}),
			},
			"Received CMS API response",
		);
		return response;
	} catch (error) {
		logger.error(
			{
				err: error,
				method,
				endpoint,
				...(traceId ? { traceId } : {}),
			},
			"Error during CMS API request",
		);
		throw new Error(GENERAL_ERROR_MESSAGE);
	}
}

export const GENERAL_ERROR_MESSAGE = jp.message.common.unexpectedError;
