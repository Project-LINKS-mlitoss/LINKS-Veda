import { Prisma } from "@prisma/client";
import { json } from "@remix-run/node";
import {
	CONTENT_CALLBACK_API_STATUS,
	CONTENT_FIELD_TYPE,
	INPUT_TYPE,
	RESOURCE_PERMISSION_ROLE,
	RESOURCE_PERMISSION_TYPE,
	WORKFLOW_STATUS,
} from "~/commons/core.const";
import jp from "~/commons/locales/jp";
import {
	type ContentSpatialJoin,
	type ContentTextMatching,
	type OptionsPreProcessing,
	type OptionsSuggest,
	PREPROCESS_TYPE,
	type SettingCrossTab,
	type SettingSpatialAggregateDetail,
	VALID_TYPES,
	ValidType,
} from "~/components/pages/Operators/types";
import { logger } from "~/logger";
import type { ContentItemDetail } from "~/models/content";
import type {
	Cleansing,
	ContentI,
	FilesArray,
	GenSourceItem,
	Geocoding,
	InputType,
	Masking,
	RequestSpatialJoin,
	SettingCrossTabRequest,
	SettingSpatialAggregateRequest,
	SettingTextMatching,
} from "~/models/operators";
import {
	OPERATOR_TYPE_FOLLOW_PREPROCESSING_TYPE,
	PREPROCESSING_TYPE,
} from "~/models/processingStatus";
import { OPERATOR_TYPE, type WorkflowDetail } from "~/models/templates";
import { prisma } from "~/prisma";
import type { ContentRepository } from "~/repositories/contentRepository";
import type { MbRepository, PropertySchema } from "~/repositories/mbRepository";
import type { OperatorsRepository } from "~/repositories/operatorsRepository";
import type { ResourcePermissionRepository } from "~/repositories/resourcePermissionRepository";
import type { TemplatesRepository } from "~/repositories/templatesRepository";
import { type ApiResponse, GENERAL_ERROR_MESSAGE } from "~/repositories/utils";
import type { WorkflowDetailExecutionRepository } from "~/repositories/workflowDetailExecutionRepository";
import { ServiceFactory } from "~/services/serviceFactory";
import { validate, validateV2 } from "./utils";

export class OperatorsService {
	private operatorsRepository: OperatorsRepository;
	private mbRepository: MbRepository;
	private resourcePermissionRepository: ResourcePermissionRepository;
	private contentRepository: ContentRepository;
	private workflowDetailExecutionRepository: WorkflowDetailExecutionRepository;
	private templatesRepository: TemplatesRepository;

	constructor(
		operatorsRepository: OperatorsRepository,
		mbRepository: MbRepository,
		resourcePermissionRepository: ResourcePermissionRepository,
		contentRepository: ContentRepository,
		workflowDetailExecution: WorkflowDetailExecutionRepository,
		templatesRepository: TemplatesRepository,
	) {
		this.operatorsRepository = operatorsRepository;
		this.mbRepository = mbRepository;
		this.resourcePermissionRepository = resourcePermissionRepository;
		this.contentRepository = contentRepository;
		this.workflowDetailExecutionRepository = workflowDetailExecution;
		this.templatesRepository = templatesRepository;
	}

	async editContentName(
		contentId: string,
		name: string,
		operatorType: string,
		operatorId: number,
	): Promise<ApiResponse<null>> {
		const validationError = validate(
			!contentId || !name,
			"Content ID and name are required",
		);
		if (validationError) {
			return validationError;
		}

		const data = {
			status: CONTENT_CALLBACK_API_STATUS.SAVED,
		};
		const updateOperatorConfig = async (
			type: string,
			id: number,
			data: { status: number },
		): Promise<ApiResponse<null>> => {
			try {
				switch (type) {
					case PREPROCESSING_TYPE.CONTENT_CONFIGS:
						await this.operatorsRepository.updateContentConfig(id, data);
						break;
					case PREPROCESSING_TYPE.PREPROCESS_CONTENT_CONFIGS:
						await this.operatorsRepository.updateContentPreProcessingConfig(
							id,
							data,
						);
						break;
					case PREPROCESSING_TYPE.CROSS_JOIN_CONTENT_CONFIGS:
						await this.operatorsRepository.updateContentCrossTabConfig(
							id,
							data,
						);
						break;
					case PREPROCESSING_TYPE.TEXT_MATCHING_CONTENT_CONFIGS:
						await this.operatorsRepository.updateContentTextMatchingConfig(
							id,
							data,
						);
						break;
					case PREPROCESSING_TYPE.SPATIAL_JOIN_CONTENT_CONFIGS:
						await this.operatorsRepository.updateContentSpatialJoinConfig(
							id,
							data,
						);
						break;
					case PREPROCESSING_TYPE.SPATIAL_AGGREGATE_CONTENT_CONFIGS:
						await this.operatorsRepository.updateContentSpatialAggregateConfig(
							id,
							data,
						);
						break;
					default:
						throw new Error("Invalid operator type");
				}

				return { status: true, data: null };
			} catch (error) {
				return { status: false, error: GENERAL_ERROR_MESSAGE };
			}
		};

		const operatorUpdateResult = await updateOperatorConfig(
			operatorType,
			operatorId,
			data,
		);
		if (!operatorUpdateResult.status) {
			return operatorUpdateResult;
		}

		await this.editResourcePermission(
			contentId,
			RESOURCE_PERMISSION_TYPE.CONTENT,
		);

		return this.contentRepository.editContentName(contentId, name);
	}

	// data-structure
	async generate(
		assetId: string,
		files: FilesArray,
		content: ContentI,
		genSourceName: GenSourceItem[],
		uid: string,
		username: string,
		prompt: string,
		typeOutput: string,
	) {
		const validationError = validate(
			!(files.length > 0) || !Object.keys(content.properties).length,
			jp.message.operator.fileAndContentRequired,
		);
		if (validationError) {
			return validationError;
		}

		const result = await this.operatorsRepository.generate(
			assetId,
			files,
			content,
			genSourceName,
			prompt,
			typeOutput,
			username,
		);

		if (result.status) {
			await this.createResourcePermission(result, uid, username);
		}

		return result;
	}

	async getOperatorDetail(operatorId: number) {
		const validationError = validate(
			!operatorId,
			jp.message.operator.operatorIdRequired,
		);
		if (validationError) {
			return validationError;
		}

		const result = await this.operatorsRepository.getOperatorDetail(operatorId);
		if (
			result.status &&
			result.data.status !== CONTENT_CALLBACK_API_STATUS.DONE &&
			result.data.status !== CONTENT_CALLBACK_API_STATUS.SAVED
		) {
			const mbResult = await this.mbRepository.checkTicketStatus(
				result.data.ticketId,
			);
			if (mbResult.status) {
				if ("ticketStatus" in mbResult) {
					if (result.data.status !== mbResult.ticketStatus) {
						await this.operatorsRepository.updateContentConfig(result.data.id, {
							status: mbResult.ticketStatus,
						});
					}
					result.data.status = mbResult.ticketStatus;
				}

				if ("error" in mbResult) {
					result.data = {
						...result.data,
						error: mbResult?.error,
					};
				}
			} else {
				await this.operatorsRepository.updateContentConfig(result.data.id, {
					status: CONTENT_CALLBACK_API_STATUS.FAILED,
				});
				result.data.status = CONTENT_CALLBACK_API_STATUS.FAILED;
			}
		}

		if (result?.status) {
			const workflowData = await this.getWorkflowDetailsAndExecutionData(
				result,
				OPERATOR_TYPE_FOLLOW_PREPROCESSING_TYPE.contentConfigs,
			);

			return json({
				...result,
				data: {
					...result?.data,
					...workflowData,
				},
			});
		}
		return json(result);
	}

	// pre-processing
	async generatePreProcessing(
		assetId: string,
		contentId: string,
		input: string,
		inputType: InputType,
		cleansing: Cleansing,
		preProcessType: PREPROCESS_TYPE,
		masking: Masking,
		documentName: string,
		geocoding: Geocoding,
		options: OptionsPreProcessing[],
		uid: string,
		username: string,
	) {
		const validationError = validate(
			(!assetId && !contentId) || !inputType,
			jp.message.operator.chooseAssetOrContent,
		);

		if (validationError) {
			return validationError;
		}

		const result = await this.operatorsRepository.generatePreProcessing(
			assetId,
			contentId,
			input,
			inputType,
			cleansing,
			preProcessType,
			masking,
			documentName,
			geocoding,
			options,
			username,
		);

		if (result.status) {
			await this.createResourcePermission(result, uid, username);
		}

		return result;
	}

	async getOperatorProPressingDetail(operatorId: number) {
		const validationError = validate(
			!operatorId,
			jp.message.operator.operatorIdRequired,
		);
		if (validationError) {
			return validationError;
		}
		const result =
			await this.operatorsRepository.getOperatorPreprocessingDetail(operatorId);
		if (
			result.status &&
			result.data.status !== CONTENT_CALLBACK_API_STATUS.DONE &&
			result.data.status !== CONTENT_CALLBACK_API_STATUS.SAVED
		) {
			const mbResult = await this.mbRepository.checkTicketStatus(
				result.data.ticketId,
			);
			if (mbResult.status) {
				if ("ticketStatus" in mbResult) {
					if (result.data.status !== mbResult.ticketStatus) {
						await this.operatorsRepository.updateContentPreProcessingConfig(
							result.data.id,
							{
								status: mbResult.ticketStatus,
							},
						);
					}
					result.data.status = mbResult.ticketStatus;
				}

				if ("error" in mbResult) {
					result.data = {
						...result.data,
						error: mbResult?.error,
					};
				}
			} else {
				await this.operatorsRepository.updateContentPreProcessingConfig(
					result.data.id,
					{
						status: CONTENT_CALLBACK_API_STATUS.FAILED,
					},
				);
				result.data.status = CONTENT_CALLBACK_API_STATUS.FAILED;
			}
		}

		if (result?.status) {
			const workflowData = await this.getWorkflowDetailsAndExecutionData(
				result,
				OPERATOR_TYPE_FOLLOW_PREPROCESSING_TYPE.preprocessContentConfigs,
			);

			return json({
				...result,
				data: {
					...result?.data,
					...workflowData,
				},
			});
		}
		return json(result);
	}

	// text matching
	async generateTextMatching(
		contentIdLeft: string,
		contentIdRight: string,
		settingTextMatching: SettingTextMatching,
		contents: ContentTextMatching[],
		uid: string,
		username: string,
	) {
		const validationError = validate(
			(!contentIdLeft && !contentIdRight) || !settingTextMatching?.where.length,
			"スキーマを選択し、一致する条件が設定されていることを確認してください。",
		);

		if (validationError) {
			return validationError;
		}

		const result = await this.operatorsRepository.generateTextMatching(
			contentIdLeft,
			contentIdRight,
			settingTextMatching,
			contents,
			username,
		);
		if (result.status) {
			await this.createResourcePermission(result, uid, username);
		}

		return result;
	}

	async getOperatorTextMatchingDetail(operatorId: number) {
		const validationError = validate(
			!operatorId,
			jp.message.operator.operatorIdRequired,
		);
		if (validationError) {
			return validationError;
		}
		const result =
			await this.operatorsRepository.getOperatorTextMatchingDetail(operatorId);
		if (
			result.status &&
			result.data.status !== CONTENT_CALLBACK_API_STATUS.DONE &&
			result.data.status !== CONTENT_CALLBACK_API_STATUS.SAVED
		) {
			const mbResult = await this.mbRepository.checkTicketStatus(
				result.data.ticketId,
			);
			if (mbResult.status) {
				if ("ticketStatus" in mbResult) {
					if (result.data.status !== mbResult.ticketStatus) {
						await this.operatorsRepository.updateContentTextMatchingConfig(
							result.data.id,
							{
								status: mbResult.ticketStatus,
							},
						);
					}
					result.data.status = mbResult.ticketStatus;
				}

				if ("error" in mbResult) {
					result.data = {
						...result.data,
						error: mbResult?.error,
					};
				}
			} else {
				await this.operatorsRepository.updateContentTextMatchingConfig(
					result.data.id,
					{
						status: CONTENT_CALLBACK_API_STATUS.FAILED,
					},
				);
				result.data.status = CONTENT_CALLBACK_API_STATUS.FAILED;
			}
		}

		if (result?.status) {
			const workflowData = await this.getWorkflowDetailsAndExecutionData(
				result,
				OPERATOR_TYPE_FOLLOW_PREPROCESSING_TYPE.textMatchingContentConfigs,
			);

			return json({
				...result,
				data: {
					...result?.data,
					...workflowData,
				},
			});
		}
		return json(result);
	}

	// cross tab
	async generateCrossTab(
		inputId: string,
		settingCrossTabRequest: SettingCrossTabRequest,
		setting: SettingCrossTab,
		uid: string,
		username: string,
	) {
		const validationError = validate(
			!inputId ||
				!settingCrossTabRequest?.fields?.length ||
				!settingCrossTabRequest?.keyFields?.length,
			"スキーマとコンフィグ設定を選択してください。",
		);

		if (validationError) {
			return validationError;
		}

		const result = await this.operatorsRepository.generateCrossTab(
			inputId,
			settingCrossTabRequest,
			setting,
			username,
		);
		if (result.status) {
			await this.createResourcePermission(result, uid, username);
		}

		return result;
	}

	async getOperatorCrossTabDetail(operatorId: number) {
		const validationError = validate(
			!operatorId,
			jp.message.operator.operatorIdRequired,
		);
		if (validationError) {
			return validationError;
		}
		const result =
			await this.operatorsRepository.getOperatorCrossTabDetail(operatorId);
		if (
			result.status &&
			result.data.status !== CONTENT_CALLBACK_API_STATUS.DONE &&
			result.data.status !== CONTENT_CALLBACK_API_STATUS.SAVED
		) {
			const mbResult = await this.mbRepository.checkTicketStatus(
				result.data.ticketId,
			);
			if (mbResult.status) {
				if ("ticketStatus" in mbResult) {
					if (result.data.status !== mbResult.ticketStatus) {
						await this.operatorsRepository.updateContentCrossTabConfig(
							result.data.id,
							{
								status: mbResult.ticketStatus,
							},
						);
					}
					result.data.status = mbResult.ticketStatus;
				}

				if ("error" in mbResult) {
					result.data = {
						...result.data,
						error: mbResult?.error,
					};
				}
			} else {
				await this.operatorsRepository.updateContentCrossTabConfig(
					result.data.id,
					{
						status: CONTENT_CALLBACK_API_STATUS.FAILED,
					},
				);
				result.data.status = CONTENT_CALLBACK_API_STATUS.FAILED;
			}
		}

		if (result?.status) {
			const workflowData = await this.getWorkflowDetailsAndExecutionData(
				result,
				OPERATOR_TYPE_FOLLOW_PREPROCESSING_TYPE.crossJoinContentConfigs,
			);

			return json({
				...result,
				data: {
					...result?.data,
					...workflowData,
				},
			});
		}
		return json(result);
	}

	// spatial Join
	async generateSpatialJoin(
		requestSpatialJoin: RequestSpatialJoin,
		contents: ContentSpatialJoin[],
		uid: string,
		username: string,
	) {
		const validationError = validate(
			!requestSpatialJoin?.inputLeft ||
				!requestSpatialJoin?.inputRight ||
				!requestSpatialJoin?.op,
			"スキーマとコンフィグ設定を選択してください。",
		);

		if (validationError) {
			return validationError;
		}

		const result = await this.operatorsRepository.generateSpatialJoin(
			requestSpatialJoin,
			contents,
			username,
		);
		if (result.status) {
			await this.createResourcePermission(result, uid, username);
		}

		return result;
	}

	async getOperatorSpatialJoinDetail(operatorId: number) {
		const validationError = validate(
			!operatorId,
			jp.message.operator.operatorIdRequired,
		);
		if (validationError) {
			return validationError;
		}
		const result =
			await this.operatorsRepository.getOperatorSpatialJoinDetail(operatorId);
		if (
			result.status &&
			result.data.status !== CONTENT_CALLBACK_API_STATUS.DONE &&
			result.data.status !== CONTENT_CALLBACK_API_STATUS.SAVED
		) {
			const mbResult = await this.mbRepository.checkTicketStatus(
				result.data.ticketId,
			);
			if (mbResult.status) {
				if ("ticketStatus" in mbResult) {
					if (result.data.status !== mbResult.ticketStatus) {
						await this.operatorsRepository.updateContentSpatialJoinConfig(
							result.data.id,
							{
								status: mbResult.ticketStatus,
							},
						);
					}
					result.data.status = mbResult.ticketStatus;
				}

				if ("error" in mbResult) {
					result.data = {
						...result.data,
						error: mbResult?.error,
					};
				}
			} else {
				await this.operatorsRepository.updateContentSpatialJoinConfig(
					result.data.id,
					{
						status: CONTENT_CALLBACK_API_STATUS.FAILED,
					},
				);
				result.data.status = CONTENT_CALLBACK_API_STATUS.FAILED;
			}
		}

		if (result?.status) {
			const workflowData = await this.getWorkflowDetailsAndExecutionData(
				result,
				OPERATOR_TYPE_FOLLOW_PREPROCESSING_TYPE.spatialJoinContentConfigs,
			);

			return json({
				...result,
				data: {
					...result?.data,
					...workflowData,
				},
			});
		}
		return json(result);
	}

	// spatial Aggregate
	async generateSpatialAggregate(
		settingSpatialAggregateRequest: SettingSpatialAggregateRequest,
		settingDetail: SettingSpatialAggregateDetail,
		uid: string,
		username: string,
	) {
		const { inputLeft, inputRight, fields, keyFields } =
			settingSpatialAggregateRequest;
		const validationError = validate(
			!inputLeft || !inputRight || !fields?.length || !keyFields?.length,
			"スキーマとコンフィグ設定を選択してください。",
		);

		if (validationError) {
			return validationError;
		}

		const result = await this.operatorsRepository.generateSpatialAggregate(
			settingSpatialAggregateRequest,
			settingDetail,
			username,
		);

		if (result.status) {
			await this.createResourcePermission(result, uid, username);
		}

		return result;
	}

	async getOperatorSpatialAggregateDetail(operatorId: number) {
		const validationError = validate(
			!operatorId,
			jp.message.operator.operatorIdRequired,
		);
		if (validationError) {
			return validationError;
		}
		const result =
			await this.operatorsRepository.getOperatorSpatialAggregateDetail(
				operatorId,
			);
		if (
			result.status &&
			result.data.status !== CONTENT_CALLBACK_API_STATUS.DONE &&
			result.data.status !== CONTENT_CALLBACK_API_STATUS.SAVED
		) {
			const mbResult = await this.mbRepository.checkTicketStatus(
				result.data.ticketId,
			);
			if (mbResult.status) {
				if ("ticketStatus" in mbResult) {
					if (result.data.status !== mbResult.ticketStatus) {
						await this.operatorsRepository.updateContentSpatialAggregateConfig(
							result.data.id,
							{
								status: mbResult.ticketStatus,
							},
						);
					}
					result.data.status = mbResult.ticketStatus;
				}

				if ("error" in mbResult) {
					result.data = {
						...result.data,
						error: mbResult?.error,
					};
				}
			} else {
				await this.operatorsRepository.updateContentSpatialAggregateConfig(
					result.data.id,
					{
						status: CONTENT_CALLBACK_API_STATUS.FAILED,
					},
				);
				result.data.status = CONTENT_CALLBACK_API_STATUS.FAILED;
			}
		}

		if (result?.status) {
			const workflowData = await this.getWorkflowDetailsAndExecutionData(
				result,
				OPERATOR_TYPE_FOLLOW_PREPROCESSING_TYPE.spatialAggregateContentConfigs,
			);

			return json({
				...result,
				data: {
					...result?.data,
					...workflowData,
				},
			});
		}
		return json(result);
	}

	async createContentFields(
		contentId: string,
		content: ContentI,
		isConvertFieldToKanji = false,
	) {
		const validationError = validateV2(
			!contentId,
			jp.message.content.contentIdRequired,
		);
		if (validationError) {
			return validationError;
		}
		if (isConvertFieldToKanji) {
			// TODO: Temp logic. Update it when specs clear
		}
		const result = await this.operatorsRepository.createFields(
			contentId,
			content,
		);
		return json(result);
	}

	async createResourcePermission(
		// biome-ignore lint/suspicious/noExplicitAny: FIXME
		result: any,
		uid: string,
		username: string,
	) {
		await this.resourcePermissionRepository.create({
			userId: uid,
			username: username,
			resourceType: RESOURCE_PERMISSION_TYPE.CONTENT,
			resourceId: result?.data?.modelId,
			role: RESOURCE_PERMISSION_ROLE.EDIT,
		});
	}

	async editResourcePermission(
		resourceId: string,
		resourceType: RESOURCE_PERMISSION_TYPE,
	) {
		await this.resourcePermissionRepository.updateByConditions(
			{ resourceId: resourceId, resourceType: resourceType },
			{ updatedAt: new Date() },
		);
	}

	// WorkFlow
	async prepareNextWorkFlowExecutionStep(
		operatorId: number,
		operatorType: OPERATOR_TYPE,
	) {
		const data = {
			operatorId,
			operatorType,
		};
		logger.info({
			message: "[WORKFLOW PREPARE EXEC] PROCESS",
			data,
		});
		try {
			const operator = await this.getOperatorByOperatorType(
				operatorId,
				operatorType,
			);
			if (!operator) {
				logger.error({
					message: "[WORKFLOW PREPARE EXEC] Operator not found",
				});
				return;
			}

			const workflowExecution =
				await this.workflowDetailExecutionRepository.findFirst({
					operatorId: operatorId,
					operatorType: operatorType,
				});
			if (!workflowExecution) {
				logger.error({
					message: "[WORKFLOW PREPARE EXEC] Workflow not found",
					data,
				});
				return;
			}

			const { id, workflowDetailId, executionUuid, step, status } =
				workflowExecution;
			if (status === CONTENT_CALLBACK_API_STATUS.DONE) {
				logger.error({
					message: "[WORKFLOW PREPARE EXEC] Operator already done",
				});
				return;
			}

			if (
				!operator.modelId ||
				operator.status !== CONTENT_CALLBACK_API_STATUS.DONE
			) {
				logger.error({
					message: "[WORKFLOW PREPARE EXEC] Operator process failed",
				});
				await this.workflowDetailExecutionRepository.update(id, {
					status: WORKFLOW_STATUS.FAILED,
				});
				return;
			}

			const nextStep = await this.workflowDetailExecutionRepository.findFirst({
				executionUuid: executionUuid,
				step: { gt: step },
			});

			// Check operator status
			if (operator?.status === CONTENT_CALLBACK_API_STATUS.DONE) {
				await this.workflowDetailExecutionRepository.update(id, {
					status: WORKFLOW_STATUS.DONE,
				});
			}

			if (!nextStep) {
				logger.info({
					message: "[WORKFLOW PREPARE EXEC] All workflow run complete",
				});
				return;
			}

			logger.info({
				message: "[WORKFLOW PREPARE EXEC] Prepare workflow success",
			});
			await this.runWorkFlow(nextStep.id, operator.modelId);
		} catch (e) {
			console.log(
				"[WORKFLOW PREPARE EXEC] Prepare next workflow step failed",
				e,
			);
			logger.error({
				message: "[WORKFLOW PREPARE EXEC] Prepare next workflow step failed",
				operatorType,
				err: e,
			});
		}
	}

	async runWorkFlow(
		workflowDetailExecutionId: number,
		// biome-ignore lint/suspicious/noExplicitAny: FIXME
		input: any | string,
	) {
		if (!input) {
			logger.error({ message: "[WORKFLOW EXEC] Invalid input data" });
			return;
		}

		try {
			const workflowExecution =
				await this.workflowDetailExecutionRepository.findFirst({
					id: workflowDetailExecutionId,
				});

			if (!workflowExecution) {
				logger.error({
					message: "[WORKFLOW EXEC] Workflow execution not found",
				});
				return;
			}

			const {
				id,
				operatorType,
				configJson,
				userId,
				createdBy,
				operatorId,
				status,
			} = workflowExecution;

			if (operatorId && status !== WORKFLOW_STATUS.CREATED) {
				logger.info({
					message: "[WORKFLOW EXEC] Workflow execution has completed",
				});
				return;
			}

			const config = JSON.parse(configJson);
			logger.info({
				message: "[WORKFLOW EXEC] PROCESS",
				data: { workflowDetailExecutionId, input, operatorType },
			});

			await this.workflowDetailExecutionRepository.update(id, {
				status: WORKFLOW_STATUS.IN_PROGRESS,
			});

			const operatorResult = await this.processOperatorWorkflow(
				operatorType,
				input,
				config,
				userId,
				createdBy,
			);

			if (!operatorResult?.status) {
				logger.error({
					message: "[WORKFLOW EXEC] Workflow run failed",
					result: JSON.stringify(operatorResult),
				});
				await this.workflowDetailExecutionRepository.update(id, {
					status: WORKFLOW_STATUS.FAILED,
				});
				return;
			}

			await this.workflowDetailExecutionRepository.update(id, {
				operatorId: operatorResult?.data?.id,
			});

			logger.info({ message: "[WORKFLOW EXEC] Workflow run success" });

			return operatorResult;
		} catch (e) {
			logger.error({
				message: "[WORKFLOW EXEC] Workflow run failed",
				err: e,
			});
			await this.workflowDetailExecutionRepository.update(
				workflowDetailExecutionId,
				{ status: WORKFLOW_STATUS.FAILED },
			);
		}
	}

	async processOperatorWorkflow(
		operatorType: OPERATOR_TYPE,
		// biome-ignore lint/suspicious/noExplicitAny: FIXME
		input: any | string,
		// biome-ignore lint/suspicious/noExplicitAny: FIXME
		config: any,
		userId: string,
		username: string,
	): // biome-ignore lint/suspicious/noExplicitAny: FIXME
	Promise<any> {
		switch (operatorType) {
			case OPERATOR_TYPE.DATA_STRUCTURE:
				return this.generate(
					input?.assetId,
					input?.files as FilesArray,
					"content" in config ? config.content : config.schema, // [Content] Handle for old data
					config.genSourceName,
					userId,
					username,
					config.prompt,
					config.typeOutput,
				);

			case OPERATOR_TYPE.PRE_PROCESSING:
				return this.handlePreProcessingWorkflow(
					input,
					config,
					userId,
					username,
				);

			case OPERATOR_TYPE.TEXT_MATCHING: {
				// [Content] Handle for old data
				const id =
					"contents" in config
						? config.contents[0].content?.id || config.contents[0].schema.id
						: config.schemas[0].schema?.id || config.schemas[0].content.id;
				const data = "contents" in config ? config.contents : config.schemas;
				return this.generateTextMatching(
					input as string,
					id,
					config.settingTextMatching,
					data,
					userId,
					username,
				);
			}

			case OPERATOR_TYPE.CROSS_TAB:
				return this.generateCrossTab(
					input as string,
					config.settingCrossTabRequest,
					config.setting,
					userId,
					username,
				);

			case OPERATOR_TYPE.SPATIAL_JOIN:
				config.requestSpatialJoin.inputLeft = input as string;
				return this.generateSpatialJoin(
					config.requestSpatialJoin,
					"contents" in config ? config.contents : config.schemas, // [Content] Handle for old data
					userId,
					username,
				);

			case OPERATOR_TYPE.SPATIAL_AGGREGATE:
				config.settingSpatialAggregateRequest.inputLeft = input as string;
				return this.generateSpatialAggregate(
					config.settingSpatialAggregateRequest,
					config.settingDetail,
					userId,
					username,
				);

			default:
				logger.error({
					message: "[WORKFLOW EXEC] Unsupported operator type",
					operatorType,
				});
				return { status: false };
		}
	}

	async handlePreProcessingWorkflow(
		// biome-ignore lint/suspicious/noExplicitAny: FIXME
		input: any | string,
		// biome-ignore lint/suspicious/noExplicitAny: FIXME
		config: any,
		userId: string,
		username: string,
	) {
		if (input !== null && typeof input === "object" && !Array.isArray(input)) {
			return this.generatePreProcessing(
				input?.assetId,
				input?.contentId,
				input?.input,
				input?.inputType,
				config.cleansing,
				config?.preProcessType
					? config?.preProcessType
					: PREPROCESS_TYPE.CLEANING,
				config?.masking ?? [],
				config.documentName,
				config.geocoding,
				config.options,
				userId,
				username,
			);
		}

		const contentService = ServiceFactory.getContentService();
		const contentData = await contentService.getContentItems(input);

		if (!contentData.status || !contentData.data) {
			logger.error({
				message: "[WORKFLOW EXEC] Content service returned an error",
				result: JSON.stringify(contentData),
			});
			return undefined;
		}

		const items = contentData.data.items;
		const hasGeoJSON = items.some(
			(item: ContentItemDetail) =>
				Array.isArray(item.fields) &&
				item.fields.some((field) => field.type === CONTENT_FIELD_TYPE.GEO),
		);

		const inputType = hasGeoJSON ? INPUT_TYPE.GEOJSON : INPUT_TYPE.JSON;

		return this.generatePreProcessing(
			"",
			input,
			"",
			inputType,
			config.cleansing,
			config?.preProcessType
				? config?.preProcessType
				: PREPROCESS_TYPE.CLEANING,
			config?.masking ?? [],
			config.documentName,
			config.geocoding,
			config.options,
			userId,
			username,
		);
	}

	async getOperatorByOperatorType(
		operatorId: number,
		operatorType: OPERATOR_TYPE,
	) {
		try {
			// biome-ignore lint/suspicious/noExplicitAny: FIXME
			const modelMap: Record<any, string> = {
				[OPERATOR_TYPE.DATA_STRUCTURE]: "contentConfigs",
				[OPERATOR_TYPE.PRE_PROCESSING]: "preprocessContentConfigs",
				[OPERATOR_TYPE.TEXT_MATCHING]: "textMatchingContentConfigs",
				[OPERATOR_TYPE.CROSS_TAB]: "crossJoinContentConfigs",
				[OPERATOR_TYPE.SPATIAL_JOIN]: "spatialJoinContentConfigs",
				[OPERATOR_TYPE.SPATIAL_AGGREGATE]: "spatialAggregateContentConfigs",
			};

			const model = modelMap[operatorType] || null;
			if (!model) return null;

			// biome-ignore lint/suspicious/noExplicitAny: FIXME
			return await (prisma as any)[model]?.findFirst({
				where: {
					id: operatorId,
					deletedAt: null,
				},
				orderBy: { createdAt: "desc" },
			});
		} catch (error) {
			logger.error({
				message: `[WORKFLOW BATCH] Get operator: ${operatorId} by operator type: ${operatorType} failed`,
				err: error,
			});
			throw error;
		}
	}

	// Create record executions
	async createWorkflowDetailExecutions(
		workflowDetails: WorkflowDetail[],
		// biome-ignore lint/suspicious/noExplicitAny: FIXME
		input: any | string,
		userId: string,
		username: string,
	) {
		if (!workflowDetails || workflowDetails.length === 0) {
			logger.error({ message: "[WORKFLOW EXEC] No workflow details provided" });
			return {
				status: false,
				error: "[WORKFLOW EXEC] No workflow details provided",
			};
		}
		if (!input) {
			logger.error({ message: "[WORKFLOW EXEC] Invalid input data" });
			return {
				status: false,
				error: "[WORKFLOW EXEC] Invalid input data",
			};
		}

		try {
			const executionUuid = await this.generateUuid();

			const workflowExecutions = workflowDetails.map((detail) => ({
				workflowDetailId: detail.id,
				executionUuid,
				step: detail.step,
				status: WORKFLOW_STATUS.CREATED,
				operatorId: null,
				operatorType: detail.operatorType,
				configJson: detail.configJson ?? Prisma.JsonNull,
				userId: userId,
				createdBy: username,
			}));

			logger.info({
				message: "[WORKFLOW EXEC] Preparing to create WorkflowDetailExecutions",
				data: { executionUuid, count: workflowExecutions.length },
			});

			const createdExecutions = await prisma.workflowDetailExecution.createMany(
				{
					data: workflowExecutions,
				},
			);

			logger.info({
				message:
					"[WORKFLOW EXEC] WorkflowDetailExecutions created successfully",
				data: { createdCount: createdExecutions.count },
			});

			const createdExecutionDetails =
				await prisma.workflowDetailExecution.findMany({
					where: {
						executionUuid: executionUuid,
					},
				});

			// biome-ignore lint/suspicious/noExplicitAny: FIXME
			let operatorResult: any;
			if (createdExecutionDetails.length > 0) {
				const firstWorkflowDetailExecutionId =
					createdExecutionDetails[0]?.step === 1
						? createdExecutionDetails[0]?.id
						: 0;
				operatorResult = await this.runWorkFlow(
					firstWorkflowDetailExecutionId,
					input,
				);
			}

			return operatorResult;
		} catch (error) {
			logger.error({
				message: "[WORKFLOW EXEC] Failed to create WorkflowDetailExecutions",
				err: error,
			});
			return {
				status: false,
				err: error,
			};
		}
	}

	async generateUuid(): Promise<string> {
		const template = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx";
		const uuid = template.replace(/[xy]/g, (char) => {
			const randomValue = (Math.random() * 16) | 0;
			const value = char === "x" ? randomValue : (randomValue & 0x3) | 0x8;
			return value.toString(16);
		});

		return uuid;
	}

	async getWorkflowDetailsAndExecutionData(
		// biome-ignore lint/suspicious/noExplicitAny: FIXME
		result: any,
		operatorType: OPERATOR_TYPE_FOLLOW_PREPROCESSING_TYPE,
	) {
		if (!result?.status) return null;

		const workflowDetailExecution =
			await this.workflowDetailExecutionRepository.findFirst({
				operatorId: result?.data?.id ?? 0,
				operatorType: operatorType,
			});

		// biome-ignore lint/suspicious/noExplicitAny: FIXME
		let workflowDetailExecutionNextStep: any;
		// biome-ignore lint/suspicious/noExplicitAny: FIXME
		let workflowDetail: any;
		// biome-ignore lint/suspicious/noExplicitAny: FIXME
		let workflow: any;
		if (workflowDetailExecution) {
			workflowDetailExecutionNextStep =
				await this.workflowDetailExecutionRepository.findFirst({
					step: workflowDetailExecution?.step + 1,
					executionUuid: workflowDetailExecution?.executionUuid,
					operatorId: { not: null },
				});
			workflowDetail = await this.templatesRepository.getDetailWorkflowDetail(
				workflowDetailExecution?.workflowDetailId ?? 0,
			);
			if (workflowDetail) {
				workflow = await this.templatesRepository.getDetailWorkflow(
					workflowDetail?.workflowId ?? 0,
					true,
				);
			}
		}

		return {
			workflowDetailExecution: workflowDetailExecution ?? null,
			workflowDetailExecutionNextStep: workflowDetailExecutionNextStep ?? null,
			workflow: workflow?.status ? workflow?.data : null,
		};
	}

	async suggestion(input: string): Promise<ApiResponse<OptionsSuggest>> {
		if (!input || typeof input !== "string") {
			logger.error({ message: "[SUGGESTION] Invalid input data" });
			return { status: false, error: "[SUGGESTION] Invalid input data" };
		}

		try {
			const result = await this.mbRepository.suggestion(input);
			if (!result?.status) {
				return result;
			}
			if ("data" in result.data && "properties" in result.data.data) {
				const options = Object.entries(
					result.data.data.properties as { [key: string]: PropertySchema },
				).map(([key, value]) => ({
					value: key,
					label: key,
					description: (value as { description: string }).description,
					type: ValidType.includes((value as { type: VALID_TYPES }).type)
						? (value as { type: VALID_TYPES }).type
						: VALID_TYPES.STRING,
				}));
				return {
					...result,
					data: options,
				};
			}
			return {
				status: false,
				error: result.data.message ?? GENERAL_ERROR_MESSAGE,
			};
		} catch (error) {
			logger.error({
				message: "[SUGGESTION] Failed to process suggestion",
				error: JSON.stringify(error),
			});
			return { status: false, error: GENERAL_ERROR_MESSAGE };
		}
	}
}
