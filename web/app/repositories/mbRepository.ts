import { randomUUID } from "node:crypto";
import {
	CONTENT_CALLBACK_API_STATUS,
	MB_FILE_PROCESS_FUNCTION,
	MB_FILE_PROCESS_STATUS,
} from "~/commons/core.const";
import jp from "~/commons/locales/jp";
import { logger } from "~/logger";
import { routes } from "~/routes/routes";
import { fetchWithTimeout } from "~/utils/request";
import {
	type ApiResponse,
	type ErrorResponse,
	GENERAL_ERROR_MESSAGE,
} from "./utils";

export interface MbFile {
	fileId: string;
	message: string;
	process?: string;
	status?: string;
	url?: string;
}
interface Data {
	files: MbFile[];
	function: string;
	message: string;
	status: string;
	process?: string;
	ticket_id: string;
}

interface MbStatusResponse {
	status: boolean;
	ticketStatus: CONTENT_CALLBACK_API_STATUS;
	error?: MbFile[];
}

export interface ChatResponse {
	status: boolean;
	ticketId: string;
}

export interface SendMessageResponse {
	status: boolean;
	answer: string;
}

export interface JapaneseColumn {
	jp_name: string;
	type?: string;
	description?: string;
}

export interface ConvertJapaneseCharacterRequest {
	columns: JapaneseColumn[];
}

export interface ConvertJapaneseCharacterResponse {
	status: string;
	data?: {
		jp_name: string;
		en_name: string;
	}[];
	message: string;
}

export interface SuggestionSuccessResponse {
	status: "ok";
	data: JSON;
	message?: string;
}

export type PropertySchema = {
	description: string;
	type: string;
};
export interface SuggestionErrorResponse {
	status: "error";
	message: string;
}

export type SuggestionResponse =
	| SuggestionSuccessResponse
	| SuggestionErrorResponse;

export interface ConvertToRDFResponse {
	status: boolean;
	data?: string;
}

export class MbRepository {
	private VITE_MB_ENDPOINT = process.env.VITE_MB_ENDPOINT;
	private VITE_BASE_URL = process.env.VITE_BASE_URL;

	async checkTicketStatus(
		ticketId: string,
		traceId: string = randomUUID(),
	): Promise<MbStatusResponse | ApiResponse<ErrorResponse>> {
		if (!this.VITE_MB_ENDPOINT) {
			logger.error({
				message: "Missing operator endpoint",
				error: "Missing operator endpoint",
			});
			return {
				status: false,
				error: jp.message.common.missingOperatorEndpoint,
			};
		}

		const endPoint = `${this.VITE_MB_ENDPOINT}/tickets/${ticketId}`;

		try {
			const startTime = Date.now();
			logger.info(
				{ endpoint: endPoint, traceId },
				"Sending MB ticket status request",
			);

			const response = await fetch(endPoint, {
				method: "GET",
				headers: { "Content-Type": "application/json" },
			});
			const duration = Date.now() - startTime;
			logger.info(
				{ endpoint: endPoint, status: response.status, duration, traceId },
				"Received MB ticket status response",
			);

			if (!response.ok) {
				const errorData = await response.json();
				logger.error({
					message: "Failed to get MB ticket status",
					status: response.status,
					url: response.url,
					err: errorData,
					traceId,
				});
				return await this.handleResponseStatus<ErrorResponse>(response);
			}

			const data = await response.json();
			let result = {
				status: CONTENT_CALLBACK_API_STATUS.DONE,
				failedFiles: [{ fileId: "", message: "" }],
			};
			switch (data.function) {
				case MB_FILE_PROCESS_FUNCTION.STRUCTURE: {
					result = await this.getStructureFileStatus(data);
					break;
				}
				default: {
					switch (data.process) {
						case MB_FILE_PROCESS_STATUS.COMPLETED: {
							result.status = CONTENT_CALLBACK_API_STATUS.DONE;
							break;
						}
						case MB_FILE_PROCESS_STATUS.FAILED: {
							result.status = CONTENT_CALLBACK_API_STATUS.FAILED;
							break;
						}
						default:
							result.status = CONTENT_CALLBACK_API_STATUS.IN_PROGRESS;
					}
					result.failedFiles = [{ fileId: data.file, message: data.message }];
				}
			}

			return {
				status: true,
				ticketStatus: result.status,
				error: result.failedFiles,
			};
		} catch (error) {
			logger.error(
				{ err: error, ticketId, traceId },
				"Error during MB ticket status request",
			);
			return { status: false, error: GENERAL_ERROR_MESSAGE } as ErrorResponse;
		}
	}

	private async getStructureFileStatus(data: Data) {
		const failedFiles = data.files
			.filter(
				(file) =>
					file.process === MB_FILE_PROCESS_STATUS.FAILED ||
					(file.process === MB_FILE_PROCESS_STATUS.PENDING &&
						data.process === MB_FILE_PROCESS_STATUS.FAILED),
			)
			.map((file) => ({
				fileId: file.fileId,
				message:
					file.process === MB_FILE_PROCESS_STATUS.PENDING
						? data.message
						: file.message || "No message provided",
			}));

		if (failedFiles.length > 0) {
			return {
				status: CONTENT_CALLBACK_API_STATUS.FAILED,
				failedFiles,
			};
		}

		const hasProcessing = data.files.some(
			(file) =>
				file.process === MB_FILE_PROCESS_STATUS.PROCESSING ||
				file.process === MB_FILE_PROCESS_STATUS.PENDING,
		);

		return {
			status: hasProcessing
				? CONTENT_CALLBACK_API_STATUS.IN_PROGRESS
				: CONTENT_CALLBACK_API_STATUS.DONE,
			failedFiles,
		};
	}

	async createChat(
		id: string,
		apiEndpoint: string,
		traceId: string = randomUUID(),
	): Promise<ChatResponse | ApiResponse<ErrorResponse>> {
		if (!this.VITE_MB_ENDPOINT) {
			logger.error({
				message: "Missing operator endpoint",
				error: "Missing operator endpoint",
			});
			return {
				status: false,
				error: jp.message.common.missingOperatorEndpoint,
			};
		}

		const endPoint = `${this.VITE_MB_ENDPOINT}/vectorize`;
		const body = {
			id: id,
			input: `${this.VITE_BASE_URL}${routes.contentDetailApi(id)}`,
			apiEndpoint: `${this.VITE_BASE_URL}${apiEndpoint}`,
		};

		try {
			logger.info(
				{ endpoint: endPoint, traceId, body },
				"Sending chat creation request",
			);
			const startTime = Date.now();
			const response = await fetch(endPoint, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(body),
			});
			const duration = Date.now() - startTime;
			logger.info(
				{ endpoint: endPoint, status: response.status, duration, traceId },
				"Received chat creation response",
			);

			if (!response.ok) {
				const errorData = await response.json();
				logger.error({
					message: "Create chat failed",
					status: response.status,
					url: response.url,
					err: errorData,
					traceId,
				});
				return await this.handleResponseStatus<ErrorResponse>(response);
			}

			const data = await response.json();

			return {
				status: true,
				ticketId: data.ticketId,
			};
		} catch (error) {
			logger.error(
				{ err: error, traceId },
				"Error during chat creation request",
			);
			return { status: false, error: GENERAL_ERROR_MESSAGE } as ErrorResponse;
		}
	}

	async sendMessageChat(
		targetId: string[],
		message: string,
		category: string,
		traceId: string = randomUUID(),
	): Promise<SendMessageResponse | ApiResponse<ErrorResponse>> {
		if (!this.VITE_MB_ENDPOINT) {
			logger.error({
				message: "Missing operator endpoint",
				error: "Missing operator endpoint",
			});
			return {
				status: false,
				error: jp.message.common.missingOperatorEndpoint,
			};
		}

		const endPoint = `${this.VITE_MB_ENDPOINT}/chat`;
		const body = {
			targetId,
			prompt: message,
			category,
		};

		try {
			logger.info(
				{ endpoint: endPoint, traceId, body },
				"Sending chat message request",
			);
			const startTime = Date.now();
			const response = await fetch(endPoint, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(body),
			});
			const duration = Date.now() - startTime;
			logger.info(
				{ endpoint: endPoint, status: response.status, duration, traceId },
				"Received chat message response",
			);

			if (!response.ok) {
				const errorData = await response.json();
				logger.error({
					message: "Send message chat failed",
					status: response.status,
					url: response.url,
					err: errorData,
					traceId,
				});
				return await this.handleResponseStatus<ErrorResponse>(response);
			}

			const data = await response.json();

			return {
				status: true,
				answer: data.answer,
			};
		} catch (error) {
			logger.error(
				{ err: error, traceId },
				"Error during chat message request",
			);
			return { status: false, error: GENERAL_ERROR_MESSAGE } as ErrorResponse;
		}
	}

	async convertJapaneseCharacter(
		data: ConvertJapaneseCharacterRequest,
		traceId: string = randomUUID(),
	): Promise<ConvertJapaneseCharacterResponse | ApiResponse<ErrorResponse>> {
		if (!this.VITE_MB_ENDPOINT) {
			logger.error({
				message: "Missing operator endpoint",
				error: "Missing operator endpoint",
			});
			return {
				status: false,
				error: jp.message.common.missingOperatorEndpoint,
			};
		}

		const endPoint = `${this.VITE_MB_ENDPOINT}/column-japanese-to-english`;

		try {
			logger.info(
				{ endpoint: endPoint, traceId, body: data },
				"Sending convert Japanese character request",
			);
			const startTime = Date.now();
			const response = await fetchWithTimeout(endPoint, data, "POST");
			const duration = Date.now() - startTime;
			logger.info(
				{ endpoint: endPoint, status: response.status, duration, traceId },
				"Received convert Japanese character response",
			);

			if (!response.ok) {
				const errorData = await response.json();
				logger.error({
					message: "Convert Japanese character failed",
					status: response.status,
					url: response.url,
					err: errorData,
					traceId,
				});
				return await this.handleResponseStatus<ErrorResponse>(response);
			}

			const responseData = await response.json();

			return {
				status: true,
				data: responseData.data,
			};
		} catch (error) {
			logger.error(
				{ err: error, traceId },
				"Error during convert Japanese character request",
			);
			if (error instanceof Error && error.message === "Request timeout")
				return {
					status: false,
					error: jp.message.mb.convertFromJapaneseTimeout,
				} as ErrorResponse;

			return { status: false, error: GENERAL_ERROR_MESSAGE } as ErrorResponse;
		}
	}

	async convertToRDF(
		input: string,
	): Promise<ConvertToRDFResponse | ApiResponse<ErrorResponse>> {
		if (!this.VITE_MB_ENDPOINT) {
			logger.error({
				message: "Missing operator endpoint",
				error: "Missing operator endpoint",
			});
			return {
				status: false,
				error: jp.message.common.missingOperatorEndpoint,
			};
		}

		try {
			const endPoint = `${this.VITE_MB_ENDPOINT}/rdf-create`;
			logger.info({
				message: "Convert to RDF request body MB",
				body: input,
			});

			const response = await fetchWithTimeout(
				endPoint,
				{ input: input },
				"POST",
			);
			if (!response.ok) {
				logger.info({
					message: "Convert to RDF failed",
					status: response.status,
					url: response.url,
					error: await response.json(),
				});
				return await this.handleResponseStatus<ErrorResponse>(response);
			}

			const responseData = await response.json();

			return {
				status: true,
				data: responseData.data,
			};
		} catch (
			// biome-ignore lint/suspicious/noExplicitAny: FIXME
			error: any
		) {
			console.log("Convert to RDF error", error);
			if (error.message === "Request timeout")
				return {
					status: false,
					error: "Convert to RDF timeout",
				} as ErrorResponse;
			return { status: false, error: GENERAL_ERROR_MESSAGE } as ErrorResponse;
		}
	}

	private async handleResponseStatus<T>(
		response: Response,
	): Promise<ApiResponse<T>> {
		const errorMessages: Record<number, string> = {
			400: jp.message.mb.badRequest,
			404: jp.message.operator.operatorNotFound,
			401: jp.message.common.unauthorized,
			500: jp.message.common.internalServerError,
			503: jp.message.common.operatorServiceUnavailable,
		};

		const errorMessage =
			errorMessages[response.status] || GENERAL_ERROR_MESSAGE;
		return { status: false, error: errorMessage };
	}

	async suggestion(input: string): Promise<ApiResponse<SuggestionResponse>> {
		if (!this.VITE_MB_ENDPOINT) {
			logger.error({
				message: "Missing operator endpoint",
				error: "Missing operator endpoint",
			});
			return { status: false, error: "Missing operator endpoint" };
		}

		try {
			const endPoint = `${this.VITE_MB_ENDPOINT}/suggest-schema-structure`;
			const response = await fetch(endPoint, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ input }),
			});

			if (!response.ok) {
				const errorData = await response.json();
				logger.info({
					message: "Failed to get suggestion",
					status: response.status,
					url: response.url,
					error: errorData,
				});
				return { status: false, error: errorData.message || "Request failed" };
			}

			const data = await response.json();
			return { status: true, data: data };
		} catch (error) {
			logger.error({
				message: "Unexpected error in suggestion API",
				error: JSON.stringify(error),
			});
			return { status: false, error: GENERAL_ERROR_MESSAGE };
		}
	}
}
