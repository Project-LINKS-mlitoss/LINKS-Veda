import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { blob } from "node:stream/consumers";
import {
	CONTENT_CALLBACK_API_STATUS,
	CONTENT_FIELD_TYPE,
	CONTENT_IMPORT_STRATEGY_TYPE,
	DEFAULT_GEOMETRY_FIELD_KEY,
	OUTPUT_TYPE,
} from "~/commons/core.const";
import jp from "~/commons/locales/jp";
import {
	type ContentSpatialJoin,
	type ContentTextMatching,
	type OptionsPreProcessing,
	PREPROCESS_TYPE,
	type SettingCrossTab,
	type SettingSpatialAggregateDetail,
	TYPE_OUTPUT,
} from "~/components/pages/Operators/types";
import { logger } from "~/logger";
import type { Asset, UploadQueueItem } from "~/models/asset";
import {
	type BodyTypeProPrecess,
	type BodyTypeProPrecessMasking,
	type Cleansing,
	type ContentConfig,
	type ContentI,
	type CrossTabContentConfigs,
	type FileItem,
	type FilesArray,
	GENERATE_TYPE,
	type GenSourceItem,
	type Geocoding,
	type InputType,
	InputTypeDB,
	type Masking,
	type PreprocessContentConfigs,
	type RequestSpatialJoin,
	type SettingCrossTabRequest,
	type SettingSpatialAggregateRequest,
	type SettingTextMatching,
	type SpatialAggregationContentConfigs,
	type SpatialJoinContentConfigs,
	type TextMatchingContentConfigs,
} from "~/models/operators";
import { prisma } from "~/prisma";
import { routes } from "~/routes/routes";
import { ServiceFactory } from "~/services/serviceFactory";
import { parseCSVFromUrl, readFileFromUrlAsBuffer } from "~/utils/file";
import { extractFileNameAndExtension } from "~/utils/stringUtils";
import {
	type ApiResponse,
	type ErrorResponse,
	GENERAL_ERROR_MESSAGE,
	fetchFromApi,
} from "./utils";

export class OperatorsRepository {
	private VITE_MB_ENDPOINT = process.env.VITE_MB_ENDPOINT;
	private PROJECT_ID = process.env.VITE_PROJECT_ID;
	private CMS_MODEL_PREFIX = process.env.CMS_MODEL_PREFIX ?? "euk";

	async createModel(
		recordId?: number,
		typeGenerate?: GENERATE_TYPE,
		name?: string,
		key?: string,
		traceId: string = randomUUID(),
	) {
		if (!this.PROJECT_ID) {
			logger.error({
				message: "Missing project ID",
				error: "Missing project ID",
				traceId,
			});
			return { status: false, error: jp.message.common.missingProjectId };
		}

		const requestUrl = `projects/${this.PROJECT_ID}/models`;
		logger.info({ message: "Create model", url: requestUrl, traceId });

		try {
			const response = await fetchFromApi<null>(
				requestUrl,
				true,
				"POST",
				{
					name: name || `${this.CMS_MODEL_PREFIX}-${typeGenerate}-${recordId}`,
					description: `this is ${name || `${typeGenerate}-${recordId}`} description`,
					key: key || `${this.CMS_MODEL_PREFIX}-${typeGenerate}-${recordId}`,
				},
				traceId,
			);

			const responseData = await response.json();

			if (!response.ok) {
				const errorResponse = (await this.handleResponseStatus<ErrorResponse>(
					response,
				)) as ErrorResponse;
				logger.error({
					message: "Failed create model",
					status: response.status,
					url: response.url,
					error: errorResponse.error,
					traceId,
				});
				return errorResponse;
			}

			logger.info({
				message: "Successful create model",
				status: response.status,
				url: response.url,
				traceId,
			});
			return { status: true, data: responseData };
		} catch (error) {
			logger.error({
				message: "Error create model",
				err: error,
				url: requestUrl,
				traceId,
			});
			return { status: false, error: GENERAL_ERROR_MESSAGE };
		}
	}

	public async createFields(
		contentId: string,
		content: ContentI,
		traceId: string = randomUUID(),
	) {
		const properties = content.properties;
		const fieldCreationResults: Array<{ status: boolean; error?: string }> = [];

		for (const key of Object.keys(properties)) {
			const property = properties[key];
			const fieldData = {
				type: (() => {
					if (["string", "array"].includes(property.type)) {
						return "text";
					}
					if (property.type === "number") {
						return "integer";
					}
					if (property.type === "boolean") {
						return "bool";
					}
					return property.type;
				})(),
				key: key,
				required: false,
				multiple: property.type === "array",
			};

			// contentId = schemaId on CMS
			const requestUrl = `schemata/${contentId}/fields`;

			try {
				const response = await fetchFromApi<null>(
					requestUrl,
					true,
					"POST",
					fieldData,
					traceId,
				);
				if (!response.ok) {
					const errorResponse = (await this.handleResponseStatus<ErrorResponse>(
						response,
					)) as ErrorResponse;
					logger.error({
						message: `Failed to create field ${key}`,
						status: response.status,
						err: errorResponse.error,
						traceId,
					});
					fieldCreationResults.push({
						status: false,
						error: errorResponse.error,
					});
					continue;
				}

				logger.info({
					message: `Successfully created field ${key}`,
					status: response.status,
					traceId,
				});

				fieldCreationResults.push({ status: true });
			} catch (error) {
				logger.error({
					message: `Error creating field ${key}`,
					err: error,
					traceId,
				});
				fieldCreationResults.push({
					status: false,
					error: GENERAL_ERROR_MESSAGE,
				});
			}
		}

		const hasError = fieldCreationResults.some((result) => !result.status);
		if (hasError) {
			logger.error({ message: "Some fields failed to be created.", traceId });
			return { status: false, error: jp.message.operator.createFieldsFailed };
		}
		logger.info({ message: "All fields were successfully created.", traceId });
		return { status: true };
	}

	// Repository for data-structure
	async generate(
		assetId: string,
		files: FilesArray,
		content: ContentI,
		genSourceName: GenSourceItem[],
		prompt: string,
		typeOutput: string,
		username: string,
		traceId: string = randomUUID(),
	) {
		if (!this.VITE_MB_ENDPOINT) {
			logger.error({
				message: "Missing operator endpoint",
				error: "Missing operator endpoint",
				traceId,
			});
			return {
				status: false,
				error: jp.message.common.missingOperatorEndpoint,
			};
		}

		try {
			// request to MB
			const endPoint = `${this.VITE_MB_ENDPOINT}/structure`;
			const body = {
				mode: "create",
				files,
				// content = schema on MB
				schema: content,
				genSourceName,
				prompt: prompt ? prompt : "",
				type_output: typeOutput ?? TYPE_OUTPUT.OBJECT,
				apiEndpoint: `${process.env.VITE_BASE_URL}${routes.structureCallback}`,
			};
			logger.info({ message: "Request body MB", body, traceId });
			const response = await fetch(endPoint, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(body),
			});

			if (!response.ok) {
				return await this.handleMbResponseStatus<null>(response);
			}

			const data = await response.json();
			const ticketId = data?.ticketId;

			// save to db DMS
			let contentConfig = await this.saveContentConfig(
				assetId,
				files,
				content,
				genSourceName,
				prompt,
				typeOutput,
				ticketId,
				"",
				"",
				username,
			);

			// TODO: handle transaction for failed case
			// create model
			const recordId = contentConfig.id;
			const modelResult = await this.createModel(
				recordId,
				GENERATE_TYPE.DATA_STRUCTURE,
				undefined,
				undefined,
				traceId,
			);
			if (!modelResult.status) {
				logger.error({
					message: "Failed to create model before generating",
					err: modelResult.error,
					traceId,
				});
				return modelResult;
			}

			// update contentConfig
			contentConfig = await this.updateContentConfig(contentConfig.id, {
				modelId: modelResult?.data?.id,
				schemaId: modelResult?.data?.schemaId,
			});

			// create fields
			const createFieldsResult = await this.createFields(
				modelResult?.data?.schemaId,
				data?.schema,
				traceId,
			);

			if (!createFieldsResult.status) {
				return createFieldsResult;
			}

			// return final data
			return { status: true, data: contentConfig };
		} catch (error) {
			console.log("EER", error);
			return { status: false, error: GENERAL_ERROR_MESSAGE };
		}
	}

	private async saveContentConfig(
		assetId: string,
		files: FilesArray,
		content: ContentI,
		genSourceName: GenSourceItem[],
		prompt: string,
		typeOutput: string,
		ticketId: string,
		modelId: string,
		schemaId: string,
		username: string,
	) {
		const fileIds = files.map((item: FileItem) => item.id);
		const configJson = JSON.stringify({
			content,
			genSourceName,
			prompt,
			typeOutput,
		});

		return prisma.contentConfigs.create({
			data: {
				assetId,
				fileIds,
				configJson,
				ticketId,
				modelId,
				schemaId,
				status: CONTENT_CALLBACK_API_STATUS.CREATED,
				username,
			},
		});
	}

	public async updateContentConfig(
		contentConfigId: number,
		data: {
			modelId?: string;
			schemaId?: string;
			status?: CONTENT_CALLBACK_API_STATUS;
		},
	) {
		return prisma.contentConfigs.update({
			where: { id: contentConfigId },
			data: {
				...data,
			},
		});
	}

	async getOperatorDetail(
		operatorId: number,
		traceId: string = randomUUID(),
	): Promise<ApiResponse<ContentConfig>> {
		try {
			const contentConfig = await prisma.contentConfigs.findUnique({
				where: {
					id: operatorId,
				},
			});

			if (!contentConfig) {
				logger.error({
					message: "Content config not found",
					operatorId,
					traceId,
				});
				return {
					status: false,
					error: jp.message.operator.contentConfigNotFound,
				};
			}

			return { status: true, data: contentConfig };
		} catch (error) {
			logger.error({
				message: "Error fetching operator detail from database",
				err: error,
				operatorId,
				traceId,
			});
			return {
				status: false,
				error: GENERAL_ERROR_MESSAGE,
			};
		}
	}

	// Repository for pre-processing
	async generatePreProcessing(
		assetId: string,
		contentIdOld: string,
		input: string,
		inputType: InputType,
		cleansing: Cleansing,
		preProcessType: PREPROCESS_TYPE,
		masking: Masking,
		documentName: string,
		geocoding: Geocoding,
		options: OptionsPreProcessing[],
		username: string,
		traceId: string = randomUUID(),
	) {
		if (!this.VITE_MB_ENDPOINT) {
			logger.error({
				message: "Missing operator endpoint",
				err: "Missing operator endpoint",
				traceId,
			});
			return {
				status: false,
				error: jp.message.common.missingOperatorEndpoint,
			};
		}

		try {
			// request to MB
			const inputUrl = assetId
				? input
				: contentIdOld
					? `${process.env.VITE_BASE_URL}${routes.contentDetailApi(contentIdOld)}`
					: "";

			const isMasking = preProcessType === PREPROCESS_TYPE.MAKING;
			const endPoint = `${this.VITE_MB_ENDPOINT}/${isMasking ? "masking-data" : "preprocess"}`;

			const body: Partial<BodyTypeProPrecess | BodyTypeProPrecessMasking> = {
				input: inputUrl,
				apiEndpoint: `${process.env.VITE_BASE_URL}${routes.preprocessCallback}`,
			};

			if (isMasking) {
				Object.assign(body, { option: masking });
			} else {
				Object.assign(body, {
					inputType,
					normalizeCrs: true,
					documentName,
				});

				if (cleansing.length > 0) {
					(body as BodyTypeProPrecess).cleansing = cleansing;
				}

				if (geocoding.fields.length > 0) {
					(body as BodyTypeProPrecess).geocoding = geocoding;
				}
			}

			logger.info({
				message: `Request body ${isMasking ? "Masking" : ""} MB`,
				body,
				traceId,
			});

			const response = await fetch(endPoint, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(body),
			});

			if (!response.ok) {
				return await this.handleMbResponseStatus<null>(response);
			}

			const data = await response.json();
			const ticketId = data?.ticketId;
			const responseType = data?.responseType;

			// save to db DMS
			let contentConfigPreProcessing =
				await this.saveContentConfigPreProcessing(
					assetId,
					contentIdOld,
					cleansing,
					preProcessType,
					masking,
					documentName,
					geocoding,
					options,
					responseType,
					ticketId,
					"",
					"",
					username,
				);

			// TODO: handle transaction for failed case
			// create model
			const recordId = contentConfigPreProcessing.id;
			const modelResult = await this.createModel(
				recordId,
				GENERATE_TYPE.PREPROCESSING,
				undefined,
				undefined,
				traceId,
			);
			if (!modelResult.status) {
				logger.error({
					message: "Failed to create model before generating",
					err: modelResult.error,
					traceId,
				});
				return modelResult;
			}

			// update contentConfigPreProcessing
			contentConfigPreProcessing = await this.updateContentPreProcessingConfig(
				contentConfigPreProcessing.id,
				{
					modelId: modelResult?.data?.id,
					schemaId: modelResult?.data?.schemaId,
				},
			);

			// return final data
			return { status: true, data: contentConfigPreProcessing };
		} catch (error) {
			return { status: false, error: GENERAL_ERROR_MESSAGE };
		}
	}

	private async saveContentConfigPreProcessing(
		assetId: string,
		contentIdOld: string,
		cleansing: Cleansing,
		preProcessType: PREPROCESS_TYPE,
		masking: Masking,
		documentName: string,
		geocoding: Geocoding,
		options: OptionsPreProcessing[],
		responseType: string,
		ticketId: string,
		modelId: string,
		schemaId: string,
		username: string,
	) {
		const configJson = JSON.stringify({
			cleansing,
			preProcessType,
			masking,
			documentName,
			geocoding,
			options,
		});

		const inputType = assetId
			? InputTypeDB.ASSET
			: contentIdOld
				? InputTypeDB.CONTENT
				: "";

		return prisma.preprocessContentConfigs.create({
			data: {
				inputId: assetId || contentIdOld,
				inputType,
				outputType: responseType,
				configJson,
				ticketId,
				modelId,
				schemaId,
				status: CONTENT_CALLBACK_API_STATUS.CREATED,
				username,
			},
		});
	}

	public async updateContentPreProcessingConfig(
		contentConfigId: number,
		data: {
			modelId?: string;
			schemaId?: string;
			status?: CONTENT_CALLBACK_API_STATUS;
		},
	) {
		return prisma.preprocessContentConfigs.update({
			where: { id: contentConfigId },
			data: {
				...data,
			},
		});
	}

	async getOperatorPreprocessingDetail(
		operatorId: number,
		traceId: string = randomUUID(),
	): Promise<ApiResponse<PreprocessContentConfigs>> {
		try {
			const preprocessContentConfigs =
				await prisma.preprocessContentConfigs.findUnique({
					where: {
						id: operatorId,
					},
				});

			if (!preprocessContentConfigs) {
				logger.error({
					message: "Preprocessing content config not found",
					operatorId,
					traceId,
				});
				return {
					status: false,
					error: jp.message.operator.preprocessingConfigNotFound,
				};
			}

			return { status: true, data: preprocessContentConfigs };
		} catch (error) {
			logger.error({
				message: "Error fetching operator detail from database",
				err: error,
				operatorId,
				traceId,
			});
			return {
				status: false,
				error: GENERAL_ERROR_MESSAGE,
			};
		}
	}

	// Repository for text-matching
	async generateTextMatching(
		contentIdLeft: string,
		contentIdRight: string,
		settingTextMatching: SettingTextMatching,
		contents: ContentTextMatching[],
		username: string,
		traceId: string = randomUUID(),
	) {
		if (!this.VITE_MB_ENDPOINT) {
			logger.error({
				message: "Missing operator endpoint",
				error: "Missing operator endpoint",
				traceId,
			});
			return {
				status: false,
				error: jp.message.common.missingOperatorEndpoint,
			};
		}

		try {
			// request to MB
			const endPoint = `${this.VITE_MB_ENDPOINT}/text_match`;
			const body = {
				inputLeft: `${process.env.VITE_BASE_URL}${routes.contentDetailApi(contentIdLeft)}`,
				inputRight: `${process.env.VITE_BASE_URL}${routes.contentDetailApi(contentIdRight)}`,
				...settingTextMatching,
				threshold: 0.6, // TODO: replace with your threshold
				apiEndpoint: `${process.env.VITE_BASE_URL}${routes.textMatchingCallback}`,
			};
			logger.info({ message: "Request body MB", body, traceId });
			const response = await fetch(endPoint, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(body),
			});

			if (!response.ok) {
				return await this.handleMbResponseStatus<null>(response);
			}

			const data = await response.json();

			// TODO: add logic to detect output type
			const outputType = OUTPUT_TYPE.JSON;
			// save to db DMS
			const ticketId = data?.ticketId;
			let contentConfigTextMatching = await this.saveContentConfigTextMatching(
				contentIdLeft,
				contentIdRight,
				settingTextMatching,
				contents,
				outputType,
				ticketId,
				"",
				"",
				username,
			);

			logger.info({
				message: "Save contentConfigTextMatching success",
				response: JSON.stringify(contentConfigTextMatching),
				traceId,
			});

			// TODO: handle transaction for failed case
			// create model
			const recordId = contentConfigTextMatching.id;
			const modelResult = await this.createModel(
				recordId,
				GENERATE_TYPE.TEXT_MATCHING,
				undefined,
				undefined,
				traceId,
			);
			if (!modelResult.status) {
				logger.error({
					message: "Failed to create model before generating",
					err: modelResult.error,
					traceId,
				});
				return modelResult;
			}

			// update contentConfigTextMatching
			contentConfigTextMatching = await this.updateContentTextMatchingConfig(
				contentConfigTextMatching.id,
				{
					modelId: modelResult?.data?.id,
					schemaId: modelResult?.data?.schemaId,
				},
			);

			logger.info({
				message: "updateContentTextMatchingConfig success",
				traceId,
			});

			// return final data
			return { status: true, data: contentConfigTextMatching };
		} catch (error) {
			logger.error({
				message: "generateTextMatching failed",
				err: error,
				traceId,
			});
			console.log("generateTextMatching failed", error);
			return { status: false, error: GENERAL_ERROR_MESSAGE };
		}
	}

	private async saveContentConfigTextMatching(
		contentIdLeft: string,
		contentIdRight: string,
		settingTextMatching: SettingTextMatching,
		contents: ContentTextMatching[],
		outputType: OUTPUT_TYPE,
		ticketId: string,
		modelId: string,
		schemaId: string,
		username: string,
	) {
		const configJson = JSON.stringify({
			settingTextMatching,
			contents,
		});

		return prisma.textMatchingContentConfigs.create({
			data: {
				leftContentId: contentIdLeft,
				rightContentId: contentIdRight,
				configJson,
				outputType,
				status: CONTENT_CALLBACK_API_STATUS.CREATED,
				ticketId,
				modelId,
				schemaId,
				username,
			},
		});
	}

	public async updateContentTextMatchingConfig(
		contentConfigId: number,
		data: {
			modelId?: string;
			schemaId?: string;
			status?: CONTENT_CALLBACK_API_STATUS;
		},
	) {
		return prisma.textMatchingContentConfigs.update({
			where: { id: contentConfigId },
			data: {
				...data,
			},
		});
	}

	async getOperatorTextMatchingDetail(
		operatorId: number,
		traceId: string = randomUUID(),
	): Promise<ApiResponse<TextMatchingContentConfigs>> {
		try {
			const textMatchingContentConfigs =
				await prisma.textMatchingContentConfigs.findUnique({
					where: {
						id: operatorId,
					},
				});

			if (!textMatchingContentConfigs) {
				logger.error({
					message: "Text Matching content config not found",
					operatorId,
					traceId,
				});
				return {
					status: false,
					error: jp.message.operator.textMatchingConfigNotFound,
				};
			}

			return { status: true, data: textMatchingContentConfigs };
		} catch (error) {
			logger.error({
				message: "Error fetching operator detail from database",
				err: error,
				operatorId,
				traceId,
			});
			return {
				status: false,
				error: GENERAL_ERROR_MESSAGE,
			};
		}
	}

	// Repository for cross tab
	async generateCrossTab(
		inputId: string,
		settingCrossTabRequest: SettingCrossTabRequest,
		setting: SettingCrossTab,
		username: string,
		traceId: string = randomUUID(),
	) {
		if (!this.VITE_MB_ENDPOINT) {
			logger.error({
				message: "Missing operator endpoint",
				err: "Missing operator endpoint",
				traceId,
			});
			return {
				status: false,
				error: jp.message.common.missingOperatorEndpoint,
			};
		}

		try {
			const endPoint = `${this.VITE_MB_ENDPOINT}/cross`;
			const body = {
				input: `${process.env.VITE_BASE_URL}${routes.contentDetailApi(inputId)}`,
				...settingCrossTabRequest,
				apiEndpoint: `${process.env.VITE_BASE_URL}${routes.crossJoinCallback}`,
			};
			logger.info({ message: "Request body MB", body, traceId });
			const response = await fetch(endPoint, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(body),
			});

			if (!response.ok) {
				return await this.handleMbResponseStatus<null>(response);
			}

			const data = await response.json();

			// save to db DMS
			const ticketId = data?.ticketId;
			let contentConfigTextMatching = await this.saveContentConfigCrossTab(
				inputId,
				settingCrossTabRequest,
				setting,
				ticketId,
				"",
				"",
				username,
			);

			// TODO: handle transaction for failed case
			// create model
			const recordId = contentConfigTextMatching.id;
			const modelResult = await this.createModel(
				recordId,
				GENERATE_TYPE.CROSS_TAB,
				undefined,
				undefined,
				traceId,
			);
			if (!modelResult.status) {
				logger.error({
					message: "Failed to create model before generating",
					err: modelResult.error,
					traceId,
				});
				return modelResult;
			}

			// update contentConfigTextMatching
			contentConfigTextMatching = await this.updateContentCrossTabConfig(
				contentConfigTextMatching.id,
				{
					modelId: modelResult?.data?.id,
					schemaId: modelResult?.data?.schemaId,
				},
			);

			// return final data
			return { status: true, data: contentConfigTextMatching };
		} catch (error) {
			return { status: false, error: GENERAL_ERROR_MESSAGE };
		}
	}

	private async saveContentConfigCrossTab(
		inputId: string,
		settingCrossTabRequest: SettingCrossTabRequest,
		setting: SettingCrossTab,
		ticketId: string,
		modelId: string,
		schemaId: string,
		username: string,
	) {
		const configJson = JSON.stringify({
			settingCrossTabRequest,
			setting,
		});

		return prisma.crossJoinContentConfigs.create({
			data: {
				inputContentId: inputId,
				configJson,
				status: CONTENT_CALLBACK_API_STATUS.CREATED,
				ticketId,
				modelId,
				schemaId,
				username,
			},
		});
	}

	public async updateContentCrossTabConfig(
		contentConfigId: number,
		data: {
			modelId?: string;
			schemaId?: string;
			status?: CONTENT_CALLBACK_API_STATUS;
		},
	) {
		return prisma.crossJoinContentConfigs.update({
			where: { id: contentConfigId },
			data: {
				...data,
			},
		});
	}

	async getOperatorCrossTabDetail(
		operatorId: number,
		traceId: string = randomUUID(),
	): Promise<ApiResponse<CrossTabContentConfigs>> {
		try {
			const crossJoinContentConfigs =
				await prisma.crossJoinContentConfigs.findUnique({
					where: {
						id: operatorId,
					},
				});

			if (!crossJoinContentConfigs) {
				logger.error({
					message: "Cross tab content config not found",
					operatorId,
					traceId,
				});
				return {
					status: false,
					error: jp.message.operator.crossTabConfigNotFound,
				};
			}

			return { status: true, data: crossJoinContentConfigs };
		} catch (error) {
			logger.error({
				message: "Error fetching operator detail from database",
				err: error,
				operatorId,
				traceId,
			});
			return {
				status: false,
				error: GENERAL_ERROR_MESSAGE,
			};
		}
	}

	// Repository for spatial join
	async generateSpatialJoin(
		requestSpatialJoin: RequestSpatialJoin,
		contents: ContentSpatialJoin[],
		username: string,
		traceId: string = randomUUID(),
	) {
		if (!this.VITE_MB_ENDPOINT) {
			logger.error({
				message: "Missing operator endpoint",
				error: "Missing operator endpoint",
				traceId,
			});
			return {
				status: false,
				error: jp.message.common.missingOperatorEndpoint,
			};
		}

		try {
			// request to MB
			const endPoint = `${this.VITE_MB_ENDPOINT}/spatial_join`;
			const body = {
				...requestSpatialJoin,
				inputLeft: `${process.env.VITE_BASE_URL}${routes.contentDetailApi(requestSpatialJoin?.inputLeft)}`,
				inputRight: `${process.env.VITE_BASE_URL}${routes.contentDetailApi(requestSpatialJoin?.inputRight)}`,
				apiEndpoint: `${process.env.VITE_BASE_URL}${routes.spatialJoinCallback}`,
			};
			logger.info({ message: "Request body MB", body, traceId });
			const response = await fetch(endPoint, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(body),
			});

			if (!response.ok) {
				return await this.handleMbResponseStatus<null>(response);
			}

			const data = await response.json();

			// save to db DMS
			const ticketId = data?.ticketId;
			let contentConfigSpatialJoin = await this.saveContentConfigSpatialJoin(
				requestSpatialJoin,
				contents,
				ticketId,
				"",
				"",
				username,
			);

			logger.info({
				message: "Save contentConfigSpatialJoin success",
				response: JSON.stringify(contentConfigSpatialJoin),
				traceId,
			});

			const recordId = contentConfigSpatialJoin.id;
			const modelResult = await this.createModel(
				recordId,
				GENERATE_TYPE.SPATIAL_JOIN,
				undefined,
				undefined,
				traceId,
			);
			if (!modelResult.status) {
				logger.error({
					message: "Failed to create model before generating",
					err: modelResult.error,
					traceId,
				});
				return modelResult;
			}

			// update contentConfigSpatialJoin
			contentConfigSpatialJoin = await this.updateContentSpatialJoinConfig(
				contentConfigSpatialJoin.id,
				{
					modelId: modelResult?.data?.id,
					schemaId: modelResult?.data?.schemaId,
				},
			);

			logger.info({
				message: "updateContentSpatialJoinConfig success",
				traceId,
			});

			// return final data
			return { status: true, data: contentConfigSpatialJoin };
		} catch (error) {
			logger.error({
				message: "generateSpatialJoin failed",
				err: error,
				traceId,
			});
			return { status: false, error: GENERAL_ERROR_MESSAGE };
		}
	}

	private async saveContentConfigSpatialJoin(
		requestSpatialJoin: RequestSpatialJoin,
		contents: ContentSpatialJoin[],
		ticketId: string,
		modelId: string,
		schemaId: string,
		username: string,
	) {
		const configJson = JSON.stringify({
			requestSpatialJoin,
			contents,
		});

		return prisma.spatialJoinContentConfigs.create({
			data: {
				leftContentId: requestSpatialJoin?.inputLeft,
				rightContentId: requestSpatialJoin?.inputRight,
				configJson,
				status: CONTENT_CALLBACK_API_STATUS.CREATED,
				ticketId,
				modelId,
				schemaId,
				username,
			},
		});
	}

	public async updateContentSpatialJoinConfig(
		contentConfigId: number,
		data: {
			modelId?: string;
			schemaId?: string;
			status?: CONTENT_CALLBACK_API_STATUS;
		},
	) {
		return prisma.spatialJoinContentConfigs.update({
			where: { id: contentConfigId },
			data: {
				...data,
			},
		});
	}

	async getOperatorSpatialJoinDetail(
		operatorId: number,
		traceId: string = randomUUID(),
	): Promise<ApiResponse<SpatialJoinContentConfigs>> {
		try {
			const spatialJoinContentConfigs =
				await prisma.spatialJoinContentConfigs.findUnique({
					where: {
						id: operatorId,
					},
				});

			if (!spatialJoinContentConfigs) {
				logger.error({
					message: "Spatial Join content config not found",
					operatorId,
					traceId,
				});
				return {
					status: false,
					error: jp.message.operator.spatialJoinConfigNotFound,
				};
			}

			return { status: true, data: spatialJoinContentConfigs };
		} catch (error) {
			logger.error({
				message: "Error fetching operator detail from database",
				err: error,
				operatorId,
				traceId,
			});
			return {
				status: false,
				error: GENERAL_ERROR_MESSAGE,
			};
		}
	}

	// Repository for spatial aggregate
	async generateSpatialAggregate(
		settingSpatialAggregateRequest: SettingSpatialAggregateRequest,
		settingDetail: SettingSpatialAggregateDetail,
		username: string,
		traceId: string = randomUUID(),
	) {
		if (!this.VITE_MB_ENDPOINT) {
			logger.error({
				message: "Missing operator endpoint",
				error: "Missing operator endpoint",
				traceId,
			});
			return {
				status: false,
				error: jp.message.common.missingOperatorEndpoint,
			};
		}

		try {
			// request to MB
			const endPoint = `${this.VITE_MB_ENDPOINT}/spatial_aggregate`;
			const body = {
				...settingSpatialAggregateRequest,
				inputLeft: `${process.env.VITE_BASE_URL}${routes.contentDetailApi(settingSpatialAggregateRequest?.inputLeft)}`,
				inputRight: `${process.env.VITE_BASE_URL}${routes.contentDetailApi(settingSpatialAggregateRequest?.inputRight)}`,
				apiEndpoint: `${process.env.VITE_BASE_URL}${routes.spatialAggregateCallback}`,
			};
			logger.info({ message: "Request body MB", body, traceId });
			const response = await fetch(endPoint, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(body),
			});

			if (!response.ok) {
				return await this.handleMbResponseStatus<null>(response);
			}

			const data = await response.json();

			// save to db DMS
			const ticketId = data?.ticketId;
			let contentConfigSpatialAggregate =
				await this.saveContentConfigSpatialAggregate(
					settingSpatialAggregateRequest,
					settingDetail,
					ticketId,
					"",
					"",
					username,
				);

			// TODO: handle transaction for failed case
			// create model
			const recordId = contentConfigSpatialAggregate.id;
			const modelResult = await this.createModel(
				recordId,
				GENERATE_TYPE.SPATIAL_AGGREGATE,
				undefined,
				undefined,
				traceId,
			);
			if (!modelResult.status) {
				logger.error({
					message: "Failed to create model before generating",
					err: modelResult.error,
					traceId,
				});
				return modelResult;
			}

			// update contentConfigSpatialAggregate
			contentConfigSpatialAggregate =
				await this.updateContentSpatialAggregateConfig(
					contentConfigSpatialAggregate.id,
					{
						modelId: modelResult?.data?.id,
						schemaId: modelResult?.data?.schemaId,
					},
				);

			// return final data
			return { status: true, data: contentConfigSpatialAggregate };
		} catch (error) {
			return { status: false, error: GENERAL_ERROR_MESSAGE };
		}
	}

	private async saveContentConfigSpatialAggregate(
		settingSpatialAggregateRequest: SettingSpatialAggregateRequest,
		settingDetail: SettingSpatialAggregateDetail,
		ticketId: string,
		modelId: string,
		schemaId: string,
		username: string,
	) {
		const configJson = JSON.stringify({
			settingSpatialAggregateRequest,
			settingDetail,
		});

		return prisma.spatialAggregateContentConfigs.create({
			data: {
				leftContentId: settingSpatialAggregateRequest?.inputLeft,
				rightContentId: settingSpatialAggregateRequest?.inputRight,
				configJson,
				status: CONTENT_CALLBACK_API_STATUS.CREATED,
				ticketId,
				modelId,
				schemaId,
				username,
			},
		});
	}

	public async updateContentSpatialAggregateConfig(
		contentConfigId: number,
		data: {
			modelId?: string;
			schemaId?: string;
			status?: CONTENT_CALLBACK_API_STATUS;
		},
	) {
		return prisma.spatialAggregateContentConfigs.update({
			where: { id: contentConfigId },
			data: {
				...data,
			},
		});
	}

	async getOperatorSpatialAggregateDetail(
		operatorId: number,
		traceId: string = randomUUID(),
	): Promise<ApiResponse<SpatialAggregationContentConfigs>> {
		try {
			const spatialAggregateContentConfigs =
				await prisma.spatialAggregateContentConfigs.findUnique({
					where: {
						id: operatorId,
					},
				});

			if (!spatialAggregateContentConfigs) {
				logger.error({
					message: "Spatial aggregate content config not found",
					operatorId,
					traceId,
				});
				return {
					status: false,
					error: jp.message.operator.spatialAggregateConfigNotFound,
				};
			}

			return { status: true, data: spatialAggregateContentConfigs };
		} catch (error) {
			logger.error({
				message: "Error fetching operator detail from database",
				err: error,
				operatorId,
				traceId,
			});
			return {
				status: false,
				error: GENERAL_ERROR_MESSAGE,
			};
		}
	}

	async createGeoJsonAssetContent(
		asset: Asset,
		userUid: string,
		username: string,
		traceId: string = randomUUID(),
	) {
		try {
			const { name, url, contentType, id } = asset;
			if (!name || !url) {
				logger.error({ message: "[Create Asset Content] Empty file", traceId });
				return { status: false, error: jp.message.operator.invalidData };
			}

			const { baseName } = extractFileNameAndExtension(name);
			const isGeoJson =
				name.endsWith(".geojson") || contentType === "application/geo+json";
			const isCsv = name.endsWith(".csv") || contentType === "text/csv";

			if (!(isGeoJson || isCsv)) {
				logger.error({
					message:
						"[Create Asset Content] Invalid file type. Only GeoJSON or CSV are allowed",
					traceId,
				});
				return { status: false, error: jp.message.operator.invalidData };
			}

			const modelResult = await this.createModel(
				undefined,
				undefined,
				baseName,
				`euk-${id}`,
				traceId,
			);
			if (!modelResult.status) {
				logger.error({
					message: "[Create Asset Content] Failed to create Asset model",
					err: modelResult.error,
					traceId,
				});
				return modelResult;
			}
			const contentId = modelResult.data.schemaId;

			// Handle for GeoJson file
			if (isGeoJson) {
				const newContent: ContentI = {
					type: "object",
					properties: {
						[DEFAULT_GEOMETRY_FIELD_KEY]: {
							keyword: DEFAULT_GEOMETRY_FIELD_KEY,
							type: CONTENT_FIELD_TYPE.GEO,
						},
					},
				};
				const createContentFieldResult = await this.createFields(
					contentId,
					newContent,
					traceId,
				);
				if (!createContentFieldResult.status) {
					logger.error({
						message: "[Create GEO JSON content] Failed to create GeoJSON field",
						err: modelResult.error,
						traceId,
					});
					return createContentFieldResult;
				}

				const contentService = ServiceFactory.getContentService();
				const data = {
					format: "geojson" as const,
					geometryFieldKey: DEFAULT_GEOMETRY_FIELD_KEY,
					strategy: CONTENT_IMPORT_STRATEGY_TYPE.INSERT,
					mutateSchema: true,
					assetId: id,
					asBackground: true,
				};
				const result = await contentService.importData(
					modelResult.data.id,
					data,
				);

				if (!result.status) {
					logger.error({
						message:
							"[Create GEO JSON content] Failed to import GeoJSON asset data",
						err: result.error,
						traceId,
					});
					return result;
				}

				return modelResult;
			}

			// Handle for CSV file
			if (isCsv) {
				const TEMP_FILE_DIR = process.env.VITE_TMP_PATH || "tmp";

				if (!fs.existsSync(TEMP_FILE_DIR)) {
					try {
						fs.mkdirSync(TEMP_FILE_DIR);
					} catch (err) {
						logger.error({
							message: "Failed to create temporary directory",
							err,
							traceId,
						});
						throw new Error("Failed to create temporary directory.");
					}
				}

				// Handle csv file
				const newData = await parseCSVFromUrl(url);
				const fileData = `[\n${newData.join(",\n")}\n]`;

				// Create file JSON
				const fileName = `${baseName}.${OUTPUT_TYPE.JSON}`;
				const filePath = path.join(TEMP_FILE_DIR, fileName);
				try {
					fs.writeFileSync(filePath, fileData);
				} catch (err) {
					logger.error({
						message: `Failed to write file ${filePath}`,
						err,
						traceId,
					});
					throw new Error("Failed to write file.");
				}

				// Handle import file JSON
				try {
					// biome-ignore lint/suspicious/noExplicitAny: FIXME
					const file: any = await blob(fs.createReadStream(filePath));
					const fileSize = fs.statSync(filePath).size;
					const item = {
						name: fileName,
						size: fileSize,
						file: file,
					} as UploadQueueItem;

					const assetService = ServiceFactory.getAssetService();
					const signedUrlResult = await assetService.generateSignedUrls([item]);
					const itemResult = signedUrlResult.items[0];

					if (!itemResult.signedUrl)
						throw new Error("Generate signed URL failed");

					await assetService.uploadFileSignedUrl(item);
					const assetResult = await assetService.createAsset(
						item,
						userUid,
						username,
					);
					if (!assetResult.success) throw new Error("Create asset failed");
					if (!assetResult?.asset?.id) {
						throw new Error("Asset ID is undefined");
					}
					const data = {
						format: "json" as const,
						strategy: CONTENT_IMPORT_STRATEGY_TYPE.INSERT,
						mutateSchema: true,
						assetId: assetResult?.asset?.id,
						asBackground: true,
					};

					const contentService = ServiceFactory.getContentService();
					const result = await contentService.importData(
						modelResult.data.id,
						data,
					);

					if (!result.status) {
						logger.error({
							message: "[Create Asset Content] Failed to import CSV asset data",
							err: result.error,
							traceId,
						});
						return result;
					}

					return modelResult;
				} catch (error) {
					logger.error({
						message: "[Create Asset Content] Failed to import CSV asset data",
						err: error,
						traceId,
					});
					return { status: false, error: error };
				} finally {
					const tempFile = path.join(
						TEMP_FILE_DIR,
						`${baseName}.${OUTPUT_TYPE.JSON}`,
					);

					if (fs.existsSync(tempFile)) {
						try {
							fs.unlinkSync(tempFile);
							logger.info({
								message: `Temporary file ${tempFile} deleted.`,
								traceId,
							});
						} catch (err) {
							logger.error({
								message: `Failed to delete temporary file ${tempFile}`,
								err,
								traceId,
							});
						}
					}
				}
			}
		} catch (error) {
			logger.error({
				message:
					"[Create Asset Content] An error occurred in createAssetContent",
				err: error,
				traceId,
			});
			throw error;
		}
	}

	private async handleMbResponseStatus<T>(
		response: Response,
	): Promise<ApiResponse<T>> {
		const errorMessages: Record<number, string> = {
			404: jp.message.operator.operatorNotFound,
			401: jp.message.common.unauthorized,
			503: jp.message.common.operatorServiceUnavailable,
		};

		const error = await response.json();
		let errorMessage = GENERAL_ERROR_MESSAGE;
		if (error.message) {
			errorMessage = error.message;
		} else if (errorMessages[response.status]) {
			errorMessage = errorMessages[response.status];
		}

		return { status: false, error: errorMessage };
	}

	private async handleResponseStatus<T>(
		response: Response,
	): Promise<ApiResponse<T>> {
		const errorMessages: Record<number, string> = {
			404: jp.message.operator.operatorNotFound,
			401: jp.message.common.unauthorized,
			500: jp.message.common.internalServerError,
			503: jp.message.common.operatorServiceUnavailable,
		};

		const errorMessage =
			errorMessages[response.status] || GENERAL_ERROR_MESSAGE;
		return { status: false, error: errorMessage };
	}
}
