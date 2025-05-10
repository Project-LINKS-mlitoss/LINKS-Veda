import fs from "node:fs";
import path from "node:path";
import { blob } from "node:stream/consumers";
import { json } from "@remix-run/node";
import geojsonvt from "geojson-vt";
import { json2csv } from "json-2-csv";
import * as tar from "tar";
import vtpbf from "vt-pbf";
import {
	CHAT_STATUS,
	CONTENT_FIELD_TYPE,
	CONTENT_IMPORT_STRATEGY_TYPE,
	CONTENT_MANAGEMENT_PUBLISH,
	CONTENT_MANAGEMENT_STATUS_TYPE,
	DEFAULT_GEOMETRY_CRS,
	DEFAULT_GEOMETRY_FIELD_KEY,
	OUTPUT_TYPE,
	PROCESSING_STATUS,
	RESOURCE_PERMISSION_ROLE,
	RESOURCE_PERMISSION_TYPE,
} from "~/commons/core.const";
import jp from "~/commons/locales/jp";
import { DefaultCurrent, DefaultPageSize } from "~/components/molecules/Common";
import { formatFileSize } from "~/components/molecules/Common/utils";
import {
	CELL_MODE,
	type ContentItemForCreate,
	FIELD_TYPE,
	type RenderContentField,
	type TableItem,
} from "~/components/pages/Content/types";
import { logger } from "~/logger";
import type { UploadQueueItem } from "~/models/asset";
import {
	CONTENT_ASSET_TYPE,
	type ContentField,
	type ContentItem,
	type ContentItemDetail,
	type ContentParams,
	type ContentResponse,
	type Feature,
	type FeatureCollection,
	type ImportOptions,
	type WorkflowAndOperatorType,
} from "~/models/content";
import type { ContentAssetCreationLogI } from "~/models/contentAssetCreationLogModel";
import type { ContentChatI } from "~/models/contentChatModel";
import type { ContentManagementI } from "~/models/contentManagementModel";
import {
	type ContentMetaData,
	ContentMetaDataLabel,
	type ContentMetadataI,
} from "~/models/contentMetadataModel";
import type { ContentVisualizeI } from "~/models/contentVisualizesModel";
import type { DatasetContentManagementI } from "~/models/datasetContentManagementModel";
import type { Item, ItemModel } from "~/models/items";
import {
	OPERATOR_TYPE_FOLLOW_PREPROCESSING_TYPE,
	PREPROCESSING_TYPE_FOLLOW_OPERATOR_TYPE,
} from "~/models/processingStatus";
import type { ResourcePermissionI } from "~/models/resourcePermissionModel";
import type { UserInfo } from "~/models/userModel";
import { prisma } from "~/prisma";
import type { AccountManagementRepository } from "~/repositories/accountManagementRepository";
import type { ContentAssetCreationLogRepository } from "~/repositories/contentAssetCreationLogRepository";
import type { ContentChatRepository } from "~/repositories/contentChatRepository";
import type { ContentManagementRepository } from "~/repositories/contentManagementRepository";
import type { ContentMetadataRepository } from "~/repositories/contentMetadataRepository";
import type { ContentRepository } from "~/repositories/contentRepository";
import type { ContentVisualizesRepository } from "~/repositories/contentVisualizesRepository";
import type { DatasetContentManagementRepository } from "~/repositories/datasetContentManagementRepository";
import type { GSpatialRepository } from "~/repositories/gSpatialRepository";
import type {
	ChatResponse,
	ConvertJapaneseCharacterResponse,
	JapaneseColumn,
	MbRepository,
	SendMessageResponse,
} from "~/repositories/mbRepository";
import type { ResourcePermissionRepository } from "~/repositories/resourcePermissionRepository";
import {
	type ApiResponse,
	type ErrorResponse,
	GENERAL_ERROR_MESSAGE,
	type SuccessResponse,
} from "~/repositories/utils";
import type { WorkflowDetailExecutionRepository } from "~/repositories/workflowDetailExecutionRepository";
import { routes } from "~/routes/routes";
import { ServiceFactory } from "~/services/serviceFactory";
import { dateTimeFormat } from "~/utils/format";
import {
	getGeoJSONBoundingBox,
	lat2tile,
	long2tile,
} from "~/utils/geometryOptimizer";
import { validate, validateV2 } from "./utils";

export class ContentService {
	private contentRepository: ContentRepository;
	private resourcePermissionRepository: ResourcePermissionRepository;
	private contentManagementRepository: ContentManagementRepository;
	private contentChatRepository: ContentChatRepository;
	private contentVisualizesRepository: ContentVisualizesRepository;
	private gSpatialRepository: GSpatialRepository;
	private mbRepository: MbRepository;
	private datasetContentManagementRepository: DatasetContentManagementRepository;
	private accountManagementRepository: AccountManagementRepository;
	private contentAssetCreationLogRepository: ContentAssetCreationLogRepository;
	private contentMetadataRepository: ContentMetadataRepository;
	private workflowDetailExecutionRepository: WorkflowDetailExecutionRepository;

	constructor(
		contentRepository: ContentRepository,
		resourcePermissionRepository: ResourcePermissionRepository,
		contentManagementRepository: ContentManagementRepository,
		contentChatRepository: ContentChatRepository,
		contentVisualizesRepository: ContentVisualizesRepository,
		gSpatialRepository: GSpatialRepository,
		mbRepository: MbRepository,
		datasetContentManagementRepository: DatasetContentManagementRepository,
		accountManagementRepository: AccountManagementRepository,
		contentAssetCreationLogRepository: ContentAssetCreationLogRepository,
		contentMetadataRepository: ContentMetadataRepository,
		workflowDetailExecutionRepository: WorkflowDetailExecutionRepository,
	) {
		this.contentRepository = contentRepository;
		this.resourcePermissionRepository = resourcePermissionRepository;
		this.contentManagementRepository = contentManagementRepository;
		this.contentChatRepository = contentChatRepository;
		this.contentVisualizesRepository = contentVisualizesRepository;
		this.gSpatialRepository = gSpatialRepository;
		this.mbRepository = mbRepository;
		this.datasetContentManagementRepository =
			datasetContentManagementRepository;
		this.accountManagementRepository = accountManagementRepository;
		this.contentAssetCreationLogRepository = contentAssetCreationLogRepository;
		this.contentMetadataRepository = contentMetadataRepository;
		this.workflowDetailExecutionRepository = workflowDetailExecutionRepository;
	}

	async listContent(params: ContentParams, userId: string) {
		const isAdminRole =
			await this.accountManagementRepository.isRoleAdmin(userId);

		const hasFilters =
			params?.operatorTypes?.length || params?.workflows?.length;

		const result =
			isAdminRole || params.keyword
				? hasFilters
					? await this.getContentByAdminRoleWorkAndOperator(params)
					: await this.getContentByAdminRole(params)
				: hasFilters
					? await this.getContentByUserRoleWorkAndOperator(params, userId)
					: await this.getContentByUserRole(params, userId);

		if (result.status && result.data) {
			const contents = await this.processContents(
				result as SuccessResponse<ContentResponse>,
			);
			result.data.models =
				params?.statusVisualize === CONTENT_MANAGEMENT_PUBLISH.PUBLISH
					? contents.filter(
							(content) =>
								content?.visualize?.status ===
								CONTENT_MANAGEMENT_PUBLISH.PUBLISH,
						)
					: contents;
		}

		return json(result);
	}

	async getContentByAdminRole(params: ContentParams) {
		if (params?.maxRecord) {
			return await this.contentRepository.getContentMaxRecord(params);
		}
		return await this.contentRepository.getContent(params);
	}

	async getContentByUserRole(params: ContentParams, userId: string) {
		const conditions = {
			resourceType: RESOURCE_PERMISSION_TYPE.CONTENT,
			deletedAt: null,
			userId: userId,
		};
		const select = {
			resourceId: true,
			username: true,
		};
		const paginate = await this.resourcePermissionRepository.paginate(
			select,
			params,
			conditions,
		);

		if (!paginate.status) {
			return {
				status: false,
				error: paginate.error,
			};
		}

		const resources = paginate?.data?.models ?? [];
		const resourcePermissionMap: Map<string, ResourcePermissionI> = new Map(
			resources.map((resource: ResourcePermissionI) => [
				resource.resourceId,
				resource,
			]),
		);

		const contentIds = Array.from(resourcePermissionMap.keys());
		const contents = (
			await Promise.all(
				contentIds.map(async (contentId) => {
					const contentDetail = await this.contentRepository.getContentDetail(
						contentId as string,
					);
					return contentDetail.status ? contentDetail.data : null;
				}),
			)
		).filter((content) => content !== null);

		paginate.data = paginate.data
			? {
					...paginate.data,
					models: contents,
				}
			: {
					models: contents,
					page: DefaultCurrent,
					perPage: DefaultPageSize,
					totalCount: 0,
				};

		return {
			status: true,
			data: paginate.data,
			resourcePermissionMap: resourcePermissionMap,
		};
	}

	async getContentByAdminRoleWorkAndOperator(params: ContentParams) {
		return this.getContentByRoleWorkAndOperator(params);
	}

	async getContentByUserRoleWorkAndOperator(
		params: ContentParams,
		userId: string,
	) {
		return this.getContentByRoleWorkAndOperator(params, userId);
	}

	private async getContentByRoleWorkAndOperator(
		params: ContentParams,
		userId?: string,
	) {
		const { keyword, operatorTypes, workflows: workflowIds } = params;
		let resourcePermissionMap: Map<string, ResourcePermissionI> | null = null;

		if (userId) {
			const resources = await this.resourcePermissionRepository.find(
				{
					resourceType: RESOURCE_PERMISSION_TYPE.CONTENT,
					deletedAt: null,
					userId: userId,
				},
				{ resourceId: true, username: true },
			);

			if (!resources || resources.length === 0) {
				return {
					status: true,
					data: { models: [] },
					resourcePermissionMap: new Map(),
				};
			}

			resourcePermissionMap = new Map(
				resources.map((resource: ResourcePermissionI) => [
					resource.resourceId,
					resource,
				]),
			);
		}

		// 1. Get the list of workflow detail IDs.
		const workflowDetails = await prisma.workflowDetail.findMany({
			where: { workflowId: { in: workflowIds?.map(Number) } },
			select: { id: true },
		});
		const workflowDetailIds = workflowDetails.map((wd) => wd.id);

		// 2. Get the list of operator IDs and operator types from workflow executions.
		const workflowExecutions =
			await this.workflowDetailExecutionRepository.find(
				{
					workflowDetailId: { in: workflowDetailIds },
					operatorId: { not: null },
				},
				{
					operatorId: true,
					operatorType: true,
					executionUuid: true,
					workflowDetailId: true,
					step: true,
				},
			);
		// Filter to keep only the last step (with the largest step number) of each flow (with the same executionUuid).
		const lastWorkflowExecutions = workflowExecutions.reduce(
			(
				acc: Record<string, (typeof workflowExecutions)[0]>,
				curr: (typeof workflowExecutions)[0],
			) => {
				const key = curr.executionUuid;
				if (!acc[key] || acc[key].step < curr.step) {
					acc[key] = curr;
				}
				return acc;
			},
			{},
		);
		const finalWorkflowExecutions = Object.values(lastWorkflowExecutions) as {
			operatorId: string | null;
			operatorType: string;
		}[];

		// 3. Retrieve data from the ...ContentConfig tables.
		const recordsFromWorkflowExecutions =
			await this.getRecordsFromContentConfigs(true, finalWorkflowExecutions);

		// 4. Retrieve supplementary data from ContentConfig based on operatorTypes.
		const existingModelIds = new Set(
			recordsFromWorkflowExecutions.map((record) => record.modelId),
		);
		const recordsFromOperatorTypes = await this.getRecordsFromContentConfigs(
			false,
			(operatorTypes ?? []).map((operatorType) => ({
				operatorId: null,
				operatorType,
			})),
			Array.from(existingModelIds),
		);

		// 5. Get a list of unique content IDs.
		let contentIds = [
			...new Set([
				...recordsFromWorkflowExecutions.map((record) => record.modelId),
				...recordsFromOperatorTypes.map((record) => record.modelId),
			]),
		];

		// If a user, only retrieve content IDs present in the resourcePermissionMap.
		if (userId && resourcePermissionMap) {
			const resourceKeys = new Set(Array.from(resourcePermissionMap.keys()));
			contentIds = contentIds.filter((id) => resourceKeys.has(id));
		}

		// 6. Get the content details from contentId.
		const contents = (
			await Promise.all(
				contentIds.map(async (contentId) => {
					const contentDetail =
						await this.contentRepository.getContentDetail(contentId);
					return contentDetail.status ? contentDetail.data : null;
				}),
			)
		).filter((content) => content !== null);

		const filteredContents = keyword
			? contents.filter((content) =>
					content.name.toLowerCase().includes(keyword.toLowerCase()),
				)
			: contents;
		return userId
			? {
					status: true,
					data: { models: filteredContents },
					resourcePermissionMap,
				}
			: { status: true, data: { models: filteredContents } };
	}

	async getRecordsFromContentConfigs(
		isWorkflow: boolean,
		operators: { operatorId: string | null; operatorType: string }[],
		excludeModelIds: string[] = [],
	) {
		// biome-ignore lint/suspicious/noExplicitAny: FIXME
		const repoMap: Record<string, any> =
			PREPROCESSING_TYPE_FOLLOW_OPERATOR_TYPE;

		let queries: Promise<{ modelId: string } | { modelId: string }[]>[];

		if (!isWorkflow) {
			queries = operators.map(({ operatorType }) => {
				// biome-ignore lint/suspicious/noExplicitAny: FIXME
				const repo = (prisma as any)[operatorType];
				if (!repo) return Promise.resolve(null);

				return repo.findMany({
					where: { modelId: { notIn: excludeModelIds } },
					select: { modelId: true },
				});
			});
		} else {
			queries = operators
				.filter(({ operatorId }) => operatorId !== null)
				.map(({ operatorId, operatorType }) => {
					// biome-ignore lint/suspicious/noExplicitAny: FIXME
					const repo = (prisma as any)[repoMap[operatorType]];
					if (!repo) return Promise.resolve(null);

					return repo.findFirst({
						where: { id: Number(operatorId) },
						select: { modelId: true },
					});
				});
		}

		const resultsWithOperatorId = (await Promise.all(queries))
			.flat()
			.filter(Boolean);

		return resultsWithOperatorId;
	}

	async listContentVisualize(params: ContentParams, userId: string) {
		const isAdminRole =
			await this.accountManagementRepository.isRoleAdmin(userId);
		const result = isAdminRole
			? await this.getContentVisualizeByAdminRole(params)
			: await this.getContentVisualizeByUserRole(params, userId);

		if (result.status && result.data) {
			const contents = await this.processContents(
				result as SuccessResponse<ContentResponse>,
			);
			result.data.models = contents; // Update the contents in the result
		}
		return json(result);
	}

	async getContentVisualizeByAdminRole(params: ContentParams) {
		const { statusVisualize } = params;

		const contentVisualizes = await this.contentVisualizesRepository.find(
			{
				AND: [{ status: statusVisualize }],
			},
			{
				contentId: true,
			},
		);

		const contentIds = [
			...new Set(
				contentVisualizes.map(
					(record: { contentId: string }) => record.contentId,
				),
			),
		];
		const contents = (
			await Promise.all(
				contentIds.map(async (contentId) => {
					const contentDetail = await this.contentRepository.getContentDetail(
						contentId as string,
					);
					return contentDetail.status ? contentDetail.data : null;
				}),
			)
		).filter((content) => content !== null);

		return {
			status: true,
			data: {
				models: contents,
			},
		};
	}

	async getContentVisualizeByUserRole(params: ContentParams, userId: string) {
		const { keyword, statusVisualize } = params;

		const resources = await this.resourcePermissionRepository.find(
			{
				resourceType: RESOURCE_PERMISSION_TYPE.CONTENT,
				deletedAt: null,
				userId: userId,
			},
			{
				resourceId: true,
				username: true,
			},
		);

		if (!resources || resources.length === 0) {
			return {
				status: true,
				data: {
					models: [],
				},
				resourcePermissionMap: new Map(),
			};
		}

		const resourcePermissionMap: Map<string, ResourcePermissionI> = new Map(
			resources.map((resource: ResourcePermissionI) => [
				resource.resourceId,
				resource,
			]),
		);

		const contentVisualizes = await this.contentVisualizesRepository.find(
			{
				AND: [
					{ status: statusVisualize },
					{
						contentId: { in: Array.from(resourcePermissionMap.keys()) },
					},
				],
			},
			{
				contentId: true,
			},
		);

		const contentIds = contentVisualizes.map(
			(record: { contentId: string }) => record.contentId,
		);
		const contents = (
			await Promise.all(
				contentIds.map(async (contentId: string) => {
					const contentDetail =
						await this.contentRepository.getContentDetail(contentId);
					return contentDetail.status ? contentDetail.data : null;
				}),
			)
		).filter(Boolean);

		return {
			status: true,
			data: {
				models: contents,
			},
			resourcePermissionMap: resourcePermissionMap,
		};
	}

	async processContents(result: SuccessResponse<ContentResponse>) {
		const contents = result.data.models;
		const contentIds = contents.map((content) => content.id);

		// Get contentManagements
		const contentManagements = await this.contentManagementRepository.find(
			{
				OR: [
					{ contentId: { in: contentIds } },
					{ parentContentId: { in: contentIds } },
				],
				deletedAt: null,
			},
			{
				id: true,
				parentContentId: true,
				contentId: true,
				assetUrl: true,
				status: true,
			},
		);

		const contentManagementMap: Map<string, ContentManagementI> = new Map(
			contentManagements.map((management: ContentManagementI) => [
				management.contentId,
				management,
			]),
		);

		const duplicateContentManagementMap: Map<string, ContentManagementI> =
			new Map(
				contentManagements
					.filter(
						(management: ContentManagementI) =>
							management.parentContentId !== null,
					)
					.map((management: ContentManagementI) => [
						management.parentContentId as string,
						management,
					]),
			);

		// Get schemaChats
		const contentChats = await this.contentChatRepository.find(
			{ contentId: { in: contentIds }, status: { not: CHAT_STATUS.FAILED } },
			{
				id: true,
				contentId: true,
				chatId: true,
				status: true,
			},
		);
		const inProgressChats = contentChats.filter(
			(chat: ContentChatI) => chat.status === CHAT_STATUS.IN_PROGRESS,
		);

		if (inProgressChats.length > 0) {
			const updatedChats = await Promise.all(
				inProgressChats.map(
					async (chat: { id: number; chatId: string; status: number }) => {
						try {
							const mbResult = await this.mbRepository.checkTicketStatus(
								chat.chatId,
							);

							if (mbResult.status && "ticketStatus" in mbResult) {
								if (chat.status !== mbResult.ticketStatus) {
									return this.contentChatRepository.update(chat.id, {
										status: mbResult.ticketStatus,
									});
								}
							} else {
								return this.contentChatRepository.update(chat.id, {
									status: CHAT_STATUS.FAILED,
								});
							}
						} catch (error) {
							console.error(
								`Failed to check status for chatId: ${chat.chatId}`,
								error,
							);
							return this.contentChatRepository.update(chat.id, {
								status: CHAT_STATUS.FAILED,
							});
						}
					},
				),
			);

			for (const updatedChat of updatedChats) {
				if (updatedChat) {
					const chatIndex = contentChats.findIndex(
						(chat: { id: number }) => chat.id === updatedChat.id,
					);
					if (chatIndex !== -1) {
						contentChats[chatIndex] = updatedChat;
					}
				}
			}
		}
		const contentChatMap: Map<string, ContentChatI> = new Map(
			contentChats.map((chat: ContentChatI) => [chat.contentId, chat]),
		);

		// Get contentVisualizes
		const contentVisualizes = await this.contentVisualizesRepository.find(
			{ contentId: { in: contentIds } },
			{
				id: true,
				contentId: true,
				assetUrl: true,
				status: true,
			},
		);
		const contentVisualizeMap: Map<string, ContentVisualizeI> = new Map(
			contentVisualizes.map((visualize: ContentVisualizeI) => [
				visualize.contentId,
				visualize,
			]),
		);

		// Get content was created by/in a workflow or operator
		const contentWorkflowAndOperators = await Promise.all(
			contentIds.map(async (contentId) => {
				return {
					contentId,
					data: await this.findContentWorkflowAndOperator(contentId),
				};
			}),
		);
		const workflowAndOperatorMap = new Map(
			contentWorkflowAndOperators.map(({ contentId, data }) => [
				contentId,
				data,
			]),
		);

		// Resource Permissions
		let resourcePermissionMap: Map<string, ResourcePermissionI> | undefined;
		if ("resourcePermissionMap" in result && result.resourcePermissionMap) {
			resourcePermissionMap = result.resourcePermissionMap as Map<
				string,
				ResourcePermissionI
			>;
		} else {
			const resourcePermissions = await this.resourcePermissionRepository.find(
				{
					resourceId: { in: contentIds },
					resourceType: RESOURCE_PERMISSION_TYPE.CONTENT,
					deletedAt: null,
				},
				{
					username: true,
					resourceId: true,
				},
			);

			resourcePermissionMap = new Map(
				resourcePermissions.map((resource: ResourcePermissionI) => [
					resource.resourceId,
					resource,
				]),
			);
		}

		// Processing contents
		for (const content of contents) {
			const management = contentManagementMap.get(content.id);
			const duplicateContent = duplicateContentManagementMap.get(content.id);
			const chat = contentChatMap.get(content.id);
			const visualize = contentVisualizeMap.get(content.id);
			const workflowAndOperator = workflowAndOperatorMap.get(content.id);

			if (workflowAndOperator) {
				content.workflowAndOperator = workflowAndOperator ?? undefined;
			}

			if (management) {
				content.management = management;
				if (
					management.status &&
					management.status === CONTENT_MANAGEMENT_PUBLISH.PUBLISH
				)
					content.types = [CONTENT_MANAGEMENT_STATUS_TYPE.PUBLIC];
			}

			if (duplicateContent) {
				const duplicateDetailContent =
					await this.contentRepository.getContentDetail(
						duplicateContent.contentId ?? "",
					);
				content.duplicateContent = {
					...duplicateContent,
					name: duplicateDetailContent?.status
						? duplicateDetailContent?.data?.name
						: "",
				};
			}

			if (chat) {
				content.chat = chat;
				if (chat.chatId && chat.status === CHAT_STATUS.DONE)
					content.types = [
						...(content.types || []),
						CONTENT_MANAGEMENT_STATUS_TYPE.CHAT,
					];
			}

			if (visualize) {
				content.visualize = visualize;
				if (
					visualize.status &&
					visualize.status === CONTENT_MANAGEMENT_PUBLISH.PUBLISH
				)
					content.types = [
						...(content.types || []),
						CONTENT_MANAGEMENT_STATUS_TYPE.VISUALIZE,
					];
			}

			const resource = resourcePermissionMap.get(content.id);
			if (resource) {
				content.createdBy = resource.username;
			}
		}

		return contents;
	}

	async findContentWorkflowAndOperator(
		contentId: string,
	): Promise<WorkflowAndOperatorType | null> {
		const contentConfigTables = Object.values(
			PREPROCESSING_TYPE_FOLLOW_OPERATOR_TYPE,
		);
		let foundContentConfig = null;

		for (const table of contentConfigTables) {
			// biome-ignore lint/suspicious/noExplicitAny: FIXME
			const result = await (prisma as any)[table].findFirst({
				where: { modelId: contentId },
			});

			if (result) {
				foundContentConfig = { table, data: result };
				break;
			}
		}
		if (!foundContentConfig) {
			return null;
		}

		const { table, data } = foundContentConfig;
		const workflowExecution =
			await this.workflowDetailExecutionRepository.findFirst({
				operatorId: data.id,
				operatorType: OPERATOR_TYPE_FOLLOW_PREPROCESSING_TYPE[table],
			});

		if (workflowExecution) {
			const workflowDetail = await prisma.workflowDetail.findFirst({
				where: {
					id: workflowExecution.workflowDetailId,
					operatorType: OPERATOR_TYPE_FOLLOW_PREPROCESSING_TYPE[table],
				},
			});

			if (workflowDetail) {
				const workflow = await prisma.workflow.findFirst({
					where: { id: workflowDetail.workflowId },
				});

				if (workflow) {
					return {
						workflow,
						operatorType: table,
					};
				}
			}
		}

		return {
			operatorType: table,
		};
	}

	async getContentDetail(
		contentId: string,
		isCheckPermission = false,
		userId?: string,
	) {
		const validationError = validateV2(
			!contentId,
			jp.message.content.contentIdRequired,
		);
		if (validationError) {
			return validationError;
		}
		if (isCheckPermission) {
			const isAdminRole = await this.accountManagementRepository.isRoleAdmin(
				userId ?? "",
			);
			if (!isAdminRole) {
				const resourcePermissions =
					await this.resourcePermissionRepository.findFirst(
						{
							resourceId: contentId,
							resourceType: RESOURCE_PERMISSION_TYPE.CONTENT,
							userId: userId,
							deletedAt: null,
						},
						{
							username: true,
							resourceId: true,
						},
					);
				if (!resourcePermissions)
					return json({
						status: false,
						error: jp.message.content.contentUnavailable,
					});
			}
		}

		const result = await this.contentRepository.getContentDetail(contentId);
		if (result.status) {
			const content = (result as SuccessResponse<ContentItem>).data;
			const contentDetail = await this.contentManagementRepository.findFirst(
				{ OR: [{ contentId: content.id }, { parentContentId: content.id }] },
				{
					id: true,
					contentId: true,
					parentContentId: true,
					assetUrl: true,
					status: true,
				},
			);
			const contentDetailResult = await this.contentRepository.getContentDetail(
				contentDetail?.contentId,
			);
			if (contentDetailResult.status)
				contentDetail.name = contentDetailResult.data.name;
			if (contentDetail?.parentContentId === content.id) {
				content.duplicateContent = contentDetail;
			} else {
				content.management = contentDetail;
			}

			let chat = await this.contentChatRepository.findFirst(
				{ contentId: content.id },
				{
					id: true,
					contentId: true,
					chatId: true,
					status: true,
				},
			);

			if (
				chat?.chatId &&
				![CHAT_STATUS.DONE, CHAT_STATUS.FAILED].includes(chat.status)
			) {
				const mbResult = await this.mbRepository.checkTicketStatus(chat.chatId);
				if (mbResult.status) {
					if ("ticketStatus" in mbResult) {
						if (chat.status !== mbResult.ticketStatus) {
							chat = await this.contentChatRepository.update(chat.id, {
								status: mbResult.ticketStatus,
							});
						}
					}
				} else {
					chat = await this.contentChatRepository.update(chat.id, {
						status: CHAT_STATUS.FAILED,
					});
				}
			}

			content.chat = chat;

			content.visualize = await this.contentVisualizesRepository.findFirst(
				{ contentId: content.id },
				{
					id: true,
					contentId: true,
					assetUrl: true,
					status: true,
				},
			);

			content.datasets = await this.datasetContentManagementRepository.find(
				{
					OR: [
						{ contentManagementId: contentDetail?.id },
						{ contentVisualizeId: content.visualize?.id },
					],
					deletedAt: null,
				},
				{
					id: true,
					contentId: true,
					dataset: { select: { id: true, name: true } },
				},
			);
			let metadata = await this.contentMetadataRepository.findFirst(
				{ contentId: content.id },
				{
					contentId: true,
					metadataJson: true,
				},
			);
			if (!metadata) {
				const metadataJson: ContentMetaData = {
					issued: content.createdAt,
					modified: content.updatedAt,
				};
				const firstItem = await this.getFirstContentItem(contentId);
				if (firstItem) {
					metadataJson.source = firstItem._src_name ?? null;
					metadataJson.documentName = firstItem._document_name ?? null;
				}
				metadata = { ...metadata, metadataJson: JSON.stringify(metadataJson) };
			}
			content.metadata = metadata;
		}
		return json(result);
	}

	async deleteContent(
		contentId: string,
		userUid: string,
	): Promise<ApiResponse<null>> {
		const validationError = validate(
			!contentId,
			jp.message.content.contentIdRequired,
		);
		if (validationError) {
			return validationError;
		}
		const result = await this.contentRepository.deleteContent(contentId);
		if (result.status) {
			await this.resourcePermissionRepository.deleteByConditions({
				userId: userUid,
				resourceType: RESOURCE_PERMISSION_TYPE.CONTENT,
				resourceId: contentId,
			});
		}

		return result;
	}

	async deleteContents(contentIds: string[], userUid: string) {
		const validationError = validate(
			contentIds.length === 0,
			jp.message.content.contentIdsRequired,
		);
		if (validationError) {
			return validationError;
		}

		const deletionResults: Array<{
			status: boolean;
			id: string;
			error?: string;
		}> = [];

		for (const id of contentIds) {
			try {
				// Handle delete same as unpublish Visualize
				const contentResult = await this.getContentDetail(id);
				if (!contentResult.ok) {
					logger.error({
						message: `Content with ID = ${id} not found`,
					});
				}
				const content = (await contentResult.json()).data;

				// If it's the parent content.
				if (!content?.management?.parentContentId) {
					// Dataset processing.
					if (!content.visualize || !content.visualize.assetUrl) {
						logger.error({
							message: `The visualize asset for content with ID = ${content?.id} has not been created yet.`,
						});
					} else {
						const resourceIds =
							await this.datasetContentManagementRepository.find({
								contentVisualizeId: content.visualize.id,
								contentId: content.id,
								deletedAt: null,
							});
						await Promise.all(
							resourceIds.map(async (resource: DatasetContentManagementI) => {
								if (resource.resourceId) {
									const result = await this.gSpatialRepository.deleteResource(
										resource.resourceId,
									);
									if (!result.status) {
										logger.info({
											message: `Failed to delete resource with ID: ${resource.resourceId}`,
											error: `${result.error}`,
										});
									}
								}
							}),
						);
						await this.datasetContentManagementRepository.deleteByConditions({
							contentVisualizeId: content.visualize.id,
							contentId: content.id,
						});
					}

					// Delete from the visualize table.
					await this.contentVisualizesRepository.deleteByConditions({
						contentId: content.id,
					});
					logger.info({
						message: `Deleted visualize Content with ID ${content?.id}`,
					});

					// Delete child content.
					const childContent = await this.contentManagementRepository.findFirst(
						{
							parentContentId: content?.id,
						},
					);
					logger.info({
						message: `Child Content with ID ${childContent?.id}`,
						data: childContent,
					});
					const resultDeleteChildContent = await this.deleteContent(
						childContent?.contentId,
						userUid,
					);
					if (!resultDeleteChildContent.status) {
						logger.error({
							message: `Failed to delete child Content with ID ${childContent?.id}`,
							err: resultDeleteChildContent.error,
						});
					}
					logger.info({
						message: `Successfully deleted child Content with ID ${childContent?.id}`,
					});

					// Delete from the management table.
					await this.contentManagementRepository.deleteByConditions({
						contentId: childContent ? childContent?.contentId : content.id,
					});
					logger.info({
						message: `Deleted management Content with ID ${content?.id}`,
					});
				} else {
					// Dataset processing.
					const resourceIds =
						await this.datasetContentManagementRepository.find({
							contentManagementId: content.management.id,
							contentId: content.management.parentContentId,
							deletedAt: null,
						});
					await Promise.all(
						resourceIds.map(async (resource: DatasetContentManagementI) => {
							if (resource.resourceId) {
								const result = await this.gSpatialRepository.deleteResource(
									resource.resourceId,
								);
								if (!result.status) {
									logger.info({
										message: `Failed to delete resource with ID: ${resource.resourceId}`,
										error: `${result.error}`,
									});
								}
							}
						}),
					);
					await this.datasetContentManagementRepository.updateByConditions(
						{
							contentManagementId: content.management.id,
							contentId: content.management.parentContentId,
						},
						{
							resourceId: null,
							contentManagementId: 0,
						},
					);

					// Delete from the management table.
					await this.contentManagementRepository.deleteByConditions({
						contentId: content.id,
					});
					logger.info({
						message: `Deleted management Content with ID ${content?.id}`,
					});
				}

				// delete content
				const result = await this.deleteContent(id, userUid);

				if (!result.status) {
					logger.error({
						message: `Failed to delete content with ID ${id}`,
						err: result.error,
					});
					deletionResults.push({
						status: false,
						id,
						error: result.error,
					});
					continue;
				}

				logger.info({
					message: `Successfully deleted content with ID ${id}`,
				});

				deletionResults.push({
					status: true,
					id,
				});
			} catch (error) {
				logger.error({
					message: `Error deleting content with ID ${id}`,
					err: error,
				});
				deletionResults.push({
					status: false,
					id,
					error: GENERAL_ERROR_MESSAGE,
				});
			}
		}

		const failedDeletions = deletionResults.filter((result) => !result.status);

		if (failedDeletions.length > 0) {
			logger.error("Some contents failed to be deleted.");
			return json(
				{
					status: false,
					error: jp.message.content.deleteContentFailed,
					details: failedDeletions,
				},
				{ status: 500 },
			);
		}

		logger.info("All contents were successfully deleted.");
		return json({ status: true });
	}

	async editContentName(
		contentId: string,
		name: string,
	): Promise<ApiResponse<null>> {
		const validationError = validate(
			!contentId || !name,
			"Content ID and name are required",
		);
		if (validationError) {
			return validationError;
		}

		return this.contentRepository.editContentName(contentId, name);
	}

	async getContentItems(
		contentId: string,
		isGetAll = false,
	): Promise<SuccessResponse<{ items: ContentItemDetail[] }> | ErrorResponse> {
		const validationError = validateV2(
			!contentId,
			jp.message.content.contentIdRequired,
		);
		if (validationError) {
			return validationError.json();
		}
		// This is the limit record that CMS can return in one API
		let items: ContentItemDetail[] = [];
		const maxPerPage = 100;
		const initialResult = await this.contentRepository.getContentItems(
			contentId,
			{ perPage: maxPerPage, page: 1 },
		);
		if (!initialResult.status) {
			return { status: false, error: initialResult.error };
		}

		if (!isGetAll) return initialResult;

		const totalRecords = initialResult.data.totalCount;
		if (Array.isArray(initialResult.data.items)) {
			items = [...initialResult.data.items];
		} else {
			items = [];
		}

		if (totalRecords > maxPerPage) {
			const totalPages = Math.ceil(totalRecords / maxPerPage);
			const requests = [];
			for (let page = 2; page <= totalPages; page++) {
				requests.push(
					this.contentRepository.getContentItems(contentId, {
						perPage: maxPerPage,
						page,
					}),
				);
			}
			const responses = await Promise.all(requests);
			for (const result of responses) {
				if (result.status) {
					items = [...items, ...result.data.items];
				}
			}
		}
		return { status: true, data: { items: items } };
	}

	// Service patch content item (save content detail)
	async patchContentItems({
		renderFields,
		renderItems,
		contentDetail,
		items,
	}: {
		renderFields: RenderContentField[];
		renderItems: TableItem[];
		contentDetail: ContentItem;
		items: ItemModel[];
	}) {
		const validationError = validate(
			!contentDetail,
			jp.message.content.contentIdRequired,
		);
		if (validationError) {
			return validationError;
		}
		const isGeoJson = contentDetail
			? contentDetail?.schema?.fields?.some(
					(field) => field?.type === CONTENT_FIELD_TYPE.GEO,
				)
			: false;

		// Delete fields
		const deleteFields = renderFields
			.map((item) => {
				if (
					item?.mode === CELL_MODE.DELETED &&
					item?.prevMode !== CELL_MODE.NEW
				) {
					const field: ContentField = {
						id: item?.id,
						type: item?.type,
						key: item?.key,
						required: item?.required,
						multiple: item?.multiple,
					};

					if (field.id && field.type && field.key) {
						return field;
					}
				}
			})
			.filter(Boolean);
		await this.deleteFieldsPatchContentItems({ deleteFields, contentDetail });

		// Edited fields
		const editedFields = renderFields
			.map((item) => {
				if (item?.mode === CELL_MODE.EDITED) {
					const field: ContentField = {
						id: item?.id,
						type:
							item?.type === FIELD_TYPE.DateTime ? FIELD_TYPE.Date : item?.type,
						key: item?.key,
						required: item?.required,
						multiple: item?.multiple ?? false,
					};

					if (field.id && field.type && field.key) {
						return field;
					}
				}
			})
			.filter(Boolean);
		await this.editedFieldsPatchContentItems({ editedFields, contentDetail });

		// Add fields when do not have any item
		const newFields = renderFields
			.map((item) => {
				if (item?.mode === CELL_MODE.NEW) {
					return {
						...item,
						type:
							item?.type === FIELD_TYPE.Multiple ? FIELD_TYPE.Text : item?.type,
					};
				}
			})
			.filter(Boolean);
		await this.newFieldsPatchContentItems({ newFields, contentDetail });
		// if (
		// 	!renderItems.length ||
		// 	renderItems.every((item) => item.mode === "DELETED")
		// ) {
		// }

		// Delete items
		const deleteItems = renderItems
			.map((item) => {
				if (
					item?.mode === CELL_MODE.DELETED &&
					item?.prevMode !== CELL_MODE.NEW
				) {
					return item;
				}
			})
			.filter(Boolean);
		await this.deleteItemsPatchContentItems({ deleteItems });

		// Create file
		const TEMP_FILE_DIR = process.env.VITE_TMP_PATH || "tmp";
		let fileData: string;
		if (isGeoJson) {
			const newData = formatGEOJSONData(
				renderFields,
				renderItems,
				contentDetail,
				items,
			);
			fileData = JSON.stringify(newData);
		} else {
			const newData = formatJSONData(renderFields, renderItems);
			fileData = JSON.stringify(newData);
		}

		if (!fs.existsSync(TEMP_FILE_DIR)) {
			fs.mkdirSync(TEMP_FILE_DIR);
		}
		const fileName = `${contentDetail?.name}.${
			isGeoJson ? OUTPUT_TYPE.GEOJSON : OUTPUT_TYPE.JSON
		}`;
		const filePath = path.join(TEMP_FILE_DIR, fileName);
		fs.writeFileSync(filePath, fileData);

		try {
			// Create formData
			const formData = new FormData();
			// biome-ignore lint/suspicious/noExplicitAny: FIXME
			const file: any = await blob(fs.createReadStream(filePath));
			formData.append("file", file);
			formData.append("strategy", CONTENT_IMPORT_STRATEGY_TYPE.UPSERT);
			formData.append("mutateSchema", "true");
			if (isGeoJson) {
				const geometryObjectValues = items
					.flatMap((obj) => obj.fields)
					.find((field) => field.type === CONTENT_FIELD_TYPE.GEO);

				formData.append(
					"geometryFieldKey",
					geometryObjectValues?.key ?? DEFAULT_GEOMETRY_FIELD_KEY,
				);
				formData.append("format", "geoJson");
			} else {
				formData.append("format", "json");
			}

			// Result
			const result = await this.importData(contentDetail?.id, formData);
			return result;
		} catch (error) {
			logger.error({
				message: "Error during patchContentItems:",
				err: error,
			});
			return {
				status: false,
				error: error,
			};
		} finally {
			if (fs.existsSync(filePath)) {
				fs.unlinkSync(filePath);
				logger.info({
					message: "Temporary file deleted.",
				});
			}
		}
	}

	async deleteFieldsPatchContentItems({
		deleteFields,
		contentDetail,
	}: {
		deleteFields: (ContentField | undefined)[];
		contentDetail: ContentItem;
	}) {
		if (deleteFields.length > 0) {
			const deleteFieldResults: Array<{
				status: boolean;
				id: string;
				error?: string;
			}> = [];

			for (const field of deleteFields)
				if (field) {
					try {
						const result = await this.removeContentField(
							contentDetail?.id,
							field,
						);

						if (!result.status) {
							logger.error({
								message: `Failed to delete Field ${field?.id}`,
								err: result.error,
							});
							deleteFieldResults.push({
								status: false,
								id: field?.id,
								error: result.error,
							});
							continue;
						}

						logger.info({
							message: `Successfully deleted Field ${field?.id}`,
						});

						deleteFieldResults.push({
							status: true,
							id: field?.id,
						});
					} catch (error) {
						logger.error({
							message: `Error deleting Field ${field?.id}`,
							err: error,
						});
						deleteFieldResults.push({
							status: false,
							id: field?.id,
							error: GENERAL_ERROR_MESSAGE,
						});
					}
				}

			const failedDeletions = deleteFieldResults.filter(
				(result) => !result.status,
			);

			if (failedDeletions.length > 0) {
				logger.error("Some field failed to be deleted.");
				return {
					status: false,
					error: jp.message.content.deleteFieldsFailed,
					details: failedDeletions,
				};
			}

			logger.info("All fields were successfully deleted.");
		}
	}

	async editedFieldsPatchContentItems({
		editedFields,
		contentDetail,
	}: {
		editedFields: (ContentField | undefined)[];
		contentDetail: ContentItem;
	}) {
		if (editedFields.length > 0) {
			const editedFieldResults: Array<{
				status: boolean;
				id: string;
				error?: string;
			}> = [];

			for (const field of editedFields)
				if (field) {
					try {
						const result = await this.updateContentField(
							contentDetail?.id,
							field,
						);

						if (!result.status) {
							logger.error({
								message: `Failed to edited Field ${field?.id}`,
								err: result.error,
							});
							editedFieldResults.push({
								status: false,
								id: field?.id,
								error: result.error,
							});
							continue;
						}

						logger.info({
							message: `Successfully edited Field ${field?.id}`,
						});

						editedFieldResults.push({
							status: true,
							id: field?.id,
						});
					} catch (error) {
						logger.error({
							message: `Error edited Field ${field?.id}`,
							err: error,
						});
						editedFieldResults.push({
							status: false,
							id: field?.id,
							error: GENERAL_ERROR_MESSAGE,
						});
					}
				}

			const failedEdits = editedFieldResults.filter((result) => !result.status);

			if (failedEdits.length > 0) {
				logger.error("Some field failed to be edited.");
				return {
					status: false,
					error: jp.message.content.editFieldsFailed,
					details: failedEdits,
				};
			}

			logger.info("All fields were successfully edited.");
		}
	}

	async newFieldsPatchContentItems({
		newFields,
		contentDetail,
	}: {
		newFields: (ContentField | undefined)[];
		contentDetail: ContentItem;
	}) {
		if (newFields.length > 0) {
			const addFieldResults: Array<{
				status: boolean;
				id: string;
				error?: string;
			}> = [];

			for (const field of newFields)
				if (field) {
					try {
						const result = await this.addContentField(contentDetail?.id, field);

						if (!result.status) {
							logger.error({
								message: `Failed to add Field ${field?.id}`,
								err: result.error,
							});
							addFieldResults.push({
								status: false,
								id: field?.id,
								error: result.error,
							});
							continue;
						}

						logger.info({
							message: `Successfully add Field ${field?.id}`,
						});

						addFieldResults.push({
							status: true,
							id: field?.id,
						});
					} catch (error) {
						logger.error({
							message: `Error add Field ${field?.id}`,
							err: error,
						});
						addFieldResults.push({
							status: false,
							id: field?.id,
							error: GENERAL_ERROR_MESSAGE,
						});
					}
				}

			const failedEdits = addFieldResults.filter((result) => !result.status);

			if (failedEdits.length > 0) {
				logger.error("Some field failed to be add.");
				return {
					status: false,
					error: jp.message.content.addFieldsFailed,
					details: failedEdits,
				};
			}

			logger.info("All fields were successfully add.");
		}
	}

	async deleteItemsPatchContentItems({
		deleteItems,
	}: {
		deleteItems: (ContentItemForCreate | undefined)[];
	}) {
		if (deleteItems.length > 0) {
			const deleteItemsResult: Array<{
				status: boolean;
				id: string;
				error?: string;
			}> = [];

			for (const item of deleteItems)
				if (item) {
					try {
						const result = await this.deleteContentItem(item);

						if (!result.status) {
							logger.error({
								message: `Failed to delete Item ${item?.id}`,
								err: result.error,
							});
							deleteItemsResult.push({
								status: false,
								id: item?.id,
								error: result.error,
							});
							continue;
						}

						logger.info({
							message: `Successfully deleted Item ${item?.id}`,
						});

						deleteItemsResult.push({
							status: true,
							id: item?.id,
						});
					} catch (error) {
						logger.error({
							message: `Error deleting Item ${item?.id}`,
							err: error,
						});
						deleteItemsResult.push({
							status: false,
							id: item?.id,
							error: GENERAL_ERROR_MESSAGE,
						});
					}
				}

			const failedDeletions = deleteItemsResult.filter(
				(result) => !result.status,
			);

			if (failedDeletions.length > 0) {
				logger.error("Some item failed to be deleted.");
				return {
					status: false,
					error: jp.message.content.deleteItemsFailed,
					details: failedDeletions,
				};
			}

			logger.info("All items were successfully deleted.");
		}
	}

	// Service import
	async importData(
		contentId: string,
		data: FormData | ImportOptions,
	): Promise<ApiResponse<null>> {
		const validationError = validate(
			!contentId,
			jp.message.content.contentIdRequired,
		);
		if (validationError) {
			return validationError;
		}

		return this.contentRepository.importData(contentId, data);
	}

	// Service for fields and items
	async updateContentItem(item: Item) {
		return await this.contentRepository.updateContentItem(item);
	}

	async addContentField(contentId: string, column: Omit<ContentField, "id">) {
		return await this.contentRepository.addContentField(contentId, column);
	}

	async removeContentField(contentId: string, column: ContentField) {
		return await this.contentRepository.removeContentField(contentId, column);
	}

	async updateContentField(contentId: string, column: ContentField) {
		return await this.contentRepository.updateContentField(contentId, column);
	}

	async createContentItem(item: ContentItemForCreate, modelId: string) {
		return await this.contentRepository.createContentItem(item, modelId);
	}

	async deleteContentItem(item: TableItem) {
		return await this.contentRepository.deleteContentItem(item);
	}

	async formatContent(contentId: string): Promise<
		| SuccessResponse<{
				// biome-ignore lint/suspicious/noExplicitAny: FIXME
				items: any;
				type: string;
		  }>
		| ErrorResponse
	> {
		// This is the limit record that CMS can return in one API
		let items: ContentItemDetail[] = [];
		const maxPerPage = 100;
		const validationError = validateV2(
			!contentId,
			jp.message.content.contentIdRequired,
		);
		if (validationError) {
			return validationError.json();
		}

		const initialResult = await this.contentRepository.getContentItems(
			contentId,
			{ perPage: maxPerPage, page: 1 },
		);
		if (!initialResult.status) {
			return { status: false, error: initialResult.error };
		}

		const totalRecords = initialResult.data.totalCount;
		if (Array.isArray(initialResult.data.items)) {
			items = [...initialResult.data.items];
		} else {
			items = [];
		}

		if (totalRecords > maxPerPage) {
			const totalPages = Math.ceil(totalRecords / maxPerPage);
			const requests = [];
			for (let page = 2; page <= totalPages; page++) {
				requests.push(
					this.contentRepository.getContentItems(contentId, {
						perPage: maxPerPage,
						page,
					}),
				);
			}
			const responses = await Promise.all(requests);
			for (const result of responses) {
				if (result.status) {
					items = [...items, ...result.data.items];
				}
			}
		}

		if (!items)
			return { status: true, data: { items: items, type: OUTPUT_TYPE.JSON } };

		return (await this.formatContentItems(
			items,
			contentId,
		)) as SuccessResponse<{
			// biome-ignore lint/suspicious/noExplicitAny: FIXME
			items: any;
			type: string;
		}>;
	}

	async formatContentItems(items: ContentItemDetail[], contentId: string) {
		const hasGeoJSON = items.some(
			(item: ContentItemDetail) =>
				Array.isArray(item.fields) &&
				item.fields.some((field) => field.type === CONTENT_FIELD_TYPE.GEO),
		);
		const content = await this.contentRepository.getContentDetail(contentId);
		let originalFields = null;
		if (content.status) {
			originalFields = content.data.schema.fields.map((field) => field.key);
		}
		if (!hasGeoJSON) {
			const transformedItems = items.map((item: ContentItemDetail) => {
				// biome-ignore lint/suspicious/noExplicitAny: FIXME
				const transformedFields: Record<string, any> = {};
				if (Array.isArray(item.fields)) {
					for (const field of item.fields) {
						transformedFields[field.key] =
							Array.isArray(field.value) && field.value.length > 0
								? field.value[0]
								: field.value ?? "";
					}
				}

				// NOTE: Since the order from API models/{{modelId}}/items is different from API models/{{modelId}}, we need to resort it.
				return this.sortContentField(originalFields, transformedFields);
			});

			return {
				status: true,
				data: { items: transformedItems, type: OUTPUT_TYPE.JSON },
			};
		}

		// biome-ignore lint/suspicious/noExplicitAny: FIXME
		const features: any[] = [];
		for (const item of items) {
			// biome-ignore lint/suspicious/noExplicitAny: FIXME
			const transformedFields: Record<string, any> = {};
			let geometry = null;
			if (Array.isArray(item.fields)) {
				for (const field of item.fields) {
					if (field.type === CONTENT_FIELD_TYPE.GEO) {
						geometry = JSON.parse(field.value);
					} else {
						transformedFields[field.key] = Array.isArray(field.value)
							? field.value[0]
							: field.value;
					}
				}
			}

			// NOTE: Since the order from API models/{{modelId}}/items is different from API models/{{modelId}}, we need to resort it.
			const sortedFields = this.sortContentField(
				originalFields,
				transformedFields,
			);
			features.push({
				type: "Feature",
				properties: sortedFields,
				...(geometry && { geometry }),
			});
		}
		const data = {
			type: "FeatureCollection",
			name: contentId,
			csr: DEFAULT_GEOMETRY_CRS,
			features,
		};
		return { status: true, data: { items: data, type: OUTPUT_TYPE.GEOJSON } };
	}

	sortContentField(
		originalFields: string[] | null,
		// biome-ignore lint/suspicious/noExplicitAny: FIXME
		fields: any,
	) {
		// biome-ignore lint/suspicious/noExplicitAny: FIXME
		let sortedFields: Record<string, any> = {};
		if (originalFields) {
			for (const key of originalFields) {
				if (key in fields) {
					sortedFields[key] = fields[key];
				}
			}
		} else {
			sortedFields = fields;
		}

		return sortedFields;
	}

	async createContentAsset(
		contentId: string,
		metaData: ContentMetaData,
		userId: string,
		username: string,
		contentAssetType: CONTENT_ASSET_TYPE,
	) {
		const TEMP_FILE_DIR = process.env.VITE_TMP_PATH || "tmp";
		const basePath = `${TEMP_FILE_DIR}/${contentId}`;
		let contentManagement: ContentManagementI | undefined = undefined;
		let contentVisualize: ContentVisualizeI | undefined = undefined;
		let duplicateContent: ContentManagementI | undefined = undefined;
		let contentAssetCreationLog: ContentAssetCreationLogI | undefined =
			undefined;
		let contentMetadata: ContentMetadataI | undefined = undefined;
		const user = { uid: userId, username: username };
		try {
			const contentItemResult =
				await this.contentRepository.getContentDetail(contentId);
			if (!contentItemResult.status) {
				return contentItemResult;
			}

			const contentFormatResult = await this.formatContent(contentId);
			if (!contentFormatResult.status) {
				return contentFormatResult;
			}

			const items = contentFormatResult?.data.items;
			if ((Array.isArray(items) && !items.length) || !items)
				return {
					status: false,
					error: jp.message.content.emptyContent,
				};
			const contentData = contentItemResult.data;
			const fields = contentData.schema.fields;
			const columns = fields.map((field) => ({ jp_name: field.key }));

			({
				contentManagement,
				contentVisualize,
				duplicateContent,
				contentAssetCreationLog,
				contentMetadata,
			} = await this.getContentData(contentId, contentAssetType, user));

			const firstItem =
				contentFormatResult.data.type === OUTPUT_TYPE.JSON
					? items[0]
					: items.features[0].properties;
			// Re update autofill field with latest value
			metaData.modified = contentData.lastModified;
			metaData.source = firstItem?._src_name ?? null;
			metaData.documentName = firstItem?._document_name ?? null;
			const metadata = {
				contentId: contentId,
				username: username,
				userId: userId,
				metadataJson: JSON.stringify(metaData),
			};
			if (!contentMetadata || !contentMetadata.id) {
				contentMetadata = await this.contentMetadataRepository.create(metadata);
			} else {
				contentMetadata = await this.contentMetadataRepository.update(
					contentMetadata.id,
					metadata,
				);
			}
			if (
				columns.length &&
				contentAssetType === CONTENT_ASSET_TYPE.MANAGEMENT
			) {
				const convertResult = await this.convertAndUpdateContentFields(
					contentId,
					columns,
					fields,
				);
				if (!convertResult.status) {
					await this.updateAssetInfo(
						contentId,
						contentAssetType,
						PROCESSING_STATUS.FAILED,
						user,
						undefined,
						undefined,
						contentManagement,
						contentVisualize,
						duplicateContent,
						contentAssetCreationLog,
					);
					return convertResult;
				}
			}

			const { assetId, assetUrl, totalSize } =
				await this.handleFileProcessingAndUpload(
					basePath,
					contentData,
					contentFormatResult,
					metaData,
					user,
				);
			const updatedContent = await this.updateAssetInfo(
				contentId,
				contentAssetType,
				PROCESSING_STATUS.DONE,
				user,
				assetId ?? "",
				assetUrl ?? "",
				contentManagement,
				contentVisualize,
				duplicateContent,
				contentAssetCreationLog,
			);

			// Update total size of content
			if (contentMetadata?.id) {
				metaData.byteSize = totalSize;
				contentMetadata = await this.contentMetadataRepository.update(
					contentMetadata.id,
					{ metadataJson: JSON.stringify(metaData) },
				);
			}

			updatedContent.metadata = contentMetadata;

			return { status: true, data: updatedContent };
		} catch (error) {
			console.log("Generate content asset error", error);
			const errorMessage =
				error instanceof Error ? error.message : String(error);
			logger.error({
				message: "Generate content asset failed",
				err: errorMessage,
			});
			await this.updateAssetInfo(
				contentId,
				contentAssetType,
				PROCESSING_STATUS.FAILED,
				user,
				undefined,
				undefined,
				contentManagement,
				contentVisualize,
				duplicateContent,
				contentAssetCreationLog,
			);
			return {
				status: false,
				error: errorMessage,
			};
		} finally {
			if (fs.existsSync(basePath)) {
				fs.rmSync(basePath, { recursive: true, force: true });
			}
		}
	}

	private async getContentData(
		contentId: string,
		contentAssetType: CONTENT_ASSET_TYPE,
		user: UserInfo,
	) {
		const contentManagements = await this.contentManagementRepository.find(
			{ OR: [{ contentId: contentId }, { parentContentId: contentId }] },
			{
				id: true,
				parentContentId: true,
				contentId: true,
				assetUrl: true,
				status: true,
			},
		);

		const contentManagementMap: Map<string, ContentManagementI> = new Map(
			contentManagements.map((management: ContentManagementI) => [
				management.contentId,
				management,
			]),
		);

		const duplicateContentManagementMap: Map<string, ContentManagementI> =
			new Map(
				contentManagements
					.filter(
						(management: ContentManagementI) =>
							management.parentContentId !== null,
					)
					.map((management: ContentManagementI) => [
						management.parentContentId as string,
						management,
					]),
			);

		const contentManagement = contentManagementMap.get(contentId);
		const duplicateContent = duplicateContentManagementMap.get(contentId);
		const contentVisualize = await this.contentVisualizesRepository.findFirst(
			{ contentId },
			{ id: true, assetId: true },
		);

		const contentAssetCreationLog =
			await this.contentAssetCreationLogRepository.create({
				type: contentAssetType,
				status: PROCESSING_STATUS.CREATED,
				contentId: contentId,
				userId: user.uid,
				username: user.username,
			});

		const contentMetadata = await this.contentMetadataRepository.findFirst({
			contentId: contentId,
		});

		return {
			contentManagement,
			contentVisualize,
			duplicateContent,
			contentAssetCreationLog,
			contentMetadata,
		};
	}

	private async convertAndUpdateContentFields(
		contentId: string,
		columns: JapaneseColumn[],
		fields: ContentField[],
	) {
		const convertedColumnResult =
			await this.mbRepository.convertJapaneseCharacter({ columns });

		if (!convertedColumnResult.status) return convertedColumnResult;

		const convertedColumns =
			(convertedColumnResult as ConvertJapaneseCharacterResponse).data ?? [];
		const updatedFields = fields.map((field) => {
			const matchingColumn = convertedColumns.find(
				(column) => column.jp_name === field.key,
			);
			return matchingColumn
				? { ...field, key: matchingColumn.en_name, multiple: false }
				: field;
		});

		for (const updatedField of updatedFields) {
			await this.updateContentField(contentId, updatedField);
		}

		return {
			status: true,
		};
	}

	private async handleFileProcessingAndUpload(
		basePath: string,
		contentData: ContentItem,
		// biome-ignore lint/suspicious/noExplicitAny: FIXME
		contentFormatResult: any,
		metaData: ContentMetaData,
		user: UserInfo,
	) {
		const items = contentFormatResult.data.items;
		const dataPath = `${basePath}/files`;
		const fields = contentData.schema.fields;
		const filePaths: string[] = [];

		if (!fs.existsSync(dataPath)) fs.mkdirSync(dataPath, { recursive: true });

		const filePath1 = path.join(
			dataPath,
			`${contentData.name}.${contentFormatResult.data.type}`,
		);
		fs.writeFileSync(filePath1, JSON.stringify(items));
		filePaths.push(filePath1);

		const filePath2 = path.join(
			dataPath,
			`${contentData.name}_スキーマ情報.json`,
		);
		const file2Result = await this.contentRepository.getSchemata(
			contentData.schemaId,
		);
		if (!file2Result.status) throw new Error("Failed to get content info");
		fs.writeFileSync(filePath2, JSON.stringify(file2Result.data));
		filePaths.push(filePath2);

		if (contentFormatResult.data.type === OUTPUT_TYPE.JSON) {
			const filePath3 = path.join(dataPath, `${contentData.name}.csv`);
			fs.writeFileSync(filePath3, json2csv(items, { excelBOM: true }));
			filePaths.push(filePath3);
			const fileName4 = `${contentData.name}.jsonl`;
			const filePath4 = path.join(dataPath, fileName4);
			const contentL = items
				?.map(
					(
						// biome-ignore lint/suspicious/noExplicitAny: FIXME
						item: any,
					) => JSON.stringify(item),
				)
				.join("\n");
			fs.writeFileSync(filePath4, contentL);
			filePaths.push(filePath4);
		} else {
			const minZoom = 3;
			const maxZoom = 13;
			const tileIndex = geojsonvt(items, {
				maxZoom: maxZoom,
			});
			const mvtFolder = path.join(dataPath, "mvt");
			fs.mkdirSync(mvtFolder, { recursive: true });
			const [minLon, minLat, maxLon, maxLat] = getGeoJSONBoundingBox(items);

			for (let z = minZoom; z <= maxZoom; z++) {
				const tileXMin = long2tile(minLon, z);
				const tileXMax = long2tile(maxLon, z);
				const tileYMin = lat2tile(maxLat, z);
				const tileYMax = lat2tile(minLat, z);

				for (let x = tileXMin; x <= tileXMax; x++) {
					for (let y = tileYMin; y <= tileYMax; y++) {
						const tile = tileIndex.getTile(z, x, y);
						if (tile) {
							const mvtData = vtpbf.fromGeojsonVt({ geojsonLayer: tile });
							// Create folder for tile file: mvt/z/x/
							const tileDir = path.join(mvtFolder, z.toString(), x.toString());
							if (!fs.existsSync(tileDir)) {
								fs.mkdirSync(tileDir, { recursive: true });
							}
							const tileFilePath = path.join(tileDir, `${y}.mvt`);
							fs.writeFileSync(tileFilePath, mvtData);
							filePaths.push(tileFilePath);
						}
					}
				}
			}

			const fileName4 = `${contentData.name}.geojsonl`;
			const filePath4 = path.join(dataPath, fileName4);
			const contentL = items?.features
				?.map((feature: Feature) => JSON.stringify(feature))
				.join("\n");
			fs.writeFileSync(filePath4, contentL);
			filePaths.push(filePath4);
		}

		const totalSize = filePaths.reduce(
			(sum, filePath) => sum + fs.statSync(filePath).size,
			0,
		);
		const fileName5 = "metadata.md";
		const filePath5 = path.join(dataPath, fileName5);
		const mdContent = `### メタデータ\n\n${(
			Object.keys(ContentMetaDataLabel) as Array<
				keyof typeof ContentMetaDataLabel
			>
		)
			.map((key) => {
				const label = ContentMetaDataLabel[key] || key;
				let value = "";
				switch (key) {
					case "byteSize":
						value = formatFileSize(totalSize);
						break;
					case "issued":
					case "modified":
						value = dateTimeFormat(metaData[key], "YYYY-MM-DD");
						break;
					default:
						value = metaData[key] ?? "";
				}
				return `- **${label}**：${value}\n`;
			})
			.join("\n")}`;
		fs.writeFileSync(filePath5, mdContent);

		const fileName = `${contentData.name}.tar.gz`;
		const filePath = path.join(basePath, fileName);
		await tar.c(
			{
				gzip: true,
				file: filePath,
				cwd: dataPath,
			},
			["."],
		);
		const file = await blob(fs.createReadStream(filePath));
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
			throw new Error(jp.message.asset.signedURLFailed);

		await assetService.uploadFileSignedUrl(item);
		const assetResult = await assetService.createAsset(
			item,
			user.uid,
			user.username,
			false,
		);

		if (!assetResult.success)
			throw new Error(jp.message.asset.unableCreateAsset);

		return {
			assetId: assetResult?.asset?.id,
			assetUrl: assetResult?.asset?.url,
			basePath: basePath,
			totalSize: totalSize,
		};
	}

	private async updateAssetInfo(
		contentId: string,
		contentAssetType: CONTENT_ASSET_TYPE,
		assetStatus: PROCESSING_STATUS,
		user: UserInfo,
		assetId?: string,
		assetUrl?: string,
		contentManagement?: ContentManagementI,
		contentVisualize?: ContentVisualizeI,
		duplicateContent?: ContentManagementI,
		contentAssetCreationLog?: ContentAssetCreationLogI,
	) {
		let updatedContentManagement = contentManagement;
		let updatedContentVisualize = contentVisualize;
		let oldAssetId = null;
		const contentResult = await this.getContentDetail(contentId);
		if (!contentResult.ok)
			throw new Error(`Content with ID = ${contentId} not found`);

		const content = (await contentResult.json()).data;
		const assetService = ServiceFactory.getAssetService();
		const data: Partial<ContentManagementI | ContentVisualizeI> = {
			status: CONTENT_MANAGEMENT_PUBLISH.UN_PUBLISH,
			contentId: contentId,
			username: user.username,
			userId: user.uid,
			assetId: assetId ?? null,
			assetUrl: assetUrl ?? null,
		};

		if (contentAssetType === CONTENT_ASSET_TYPE.MANAGEMENT) {
			oldAssetId = contentManagement?.assetId;
			if (!contentManagement || !contentManagement.id) {
				updatedContentManagement =
					await this.contentManagementRepository.create(data);
			} else {
				updatedContentManagement =
					await this.contentManagementRepository.update(
						contentManagement.id,
						data,
					);
			}
		} else {
			oldAssetId = contentVisualize?.assetId;
			if (!contentVisualize || !contentVisualize.id) {
				updatedContentVisualize =
					await this.contentVisualizesRepository.create(data);
			} else {
				updatedContentVisualize = await this.contentVisualizesRepository.update(
					contentVisualize.id,
					data,
				);
			}
		}

		if (oldAssetId) {
			await assetService.deleteAsset(oldAssetId, user.uid);
		}

		if (contentAssetCreationLog?.id)
			await this.contentAssetCreationLogRepository.update(
				contentAssetCreationLog.id,
				{
					status: assetStatus,
					assetId: assetId ?? null,
					assetUrl: assetUrl ?? null,
				},
			);

		content.visualize = updatedContentVisualize;
		content.management = updatedContentManagement;
		content.duplicateContent = duplicateContent;

		return content;
	}

	async publishContent(
		contentId: string,
		isPublish: CONTENT_MANAGEMENT_PUBLISH,
		contentAssetType: CONTENT_ASSET_TYPE,
	) {
		try {
			const contentResult = await this.getContentDetail(contentId);
			if (!contentResult.ok) {
				return {
					status: false,
					error: jp.message.content.contentNotFound(contentId),
				};
			}

			const content = (await contentResult.json()).data;

			if (contentAssetType === CONTENT_ASSET_TYPE.MANAGEMENT) {
				if (!content.management.assetUrl) {
					return {
						status: false,
						error: jp.message.content.assetNotCreated(contentId),
					};
				}

				// Logic Handle dataset when on/off public management
				if (isPublish === CONTENT_MANAGEMENT_PUBLISH.UN_PUBLISH) {
					const resourceIds =
						await this.datasetContentManagementRepository.find({
							contentManagementId: content.management.id,
							contentId: content.id,
							deletedAt: null,
						});
					await Promise.all(
						resourceIds.map(async (resource: DatasetContentManagementI) => {
							if (resource.resourceId) {
								const result = await this.gSpatialRepository.deleteResource(
									resource.resourceId,
								);
								if (!result.status) {
									logger.info({
										message: `Failed to delete resource with ID: ${resource.resourceId}`,
										error: `${result.error}`,
									});
								}
							}
						}),
					);
				}

				const contentManagementData = {
					status: isPublish,
				};
				await this.contentManagementRepository.updateByConditions(
					{ contentId: contentId },
					contentManagementData,
				);
				content.management = {
					...content.management,
					...contentManagementData,
				};
			} else {
				if (!content.visualize || !content.visualize.assetUrl) {
					return {
						status: false,
						error: jp.message.content.visualizeAssetNotCreated(contentId),
					};
				}

				// Logic Handle dataset when on/off public visualize
				if (isPublish === CONTENT_MANAGEMENT_PUBLISH.UN_PUBLISH) {
					const resourceIds =
						await this.datasetContentManagementRepository.find({
							contentVisualizeId: content.visualize.id,
							contentId: content.id,
							deletedAt: null,
						});
					await Promise.all(
						resourceIds.map(async (resource: DatasetContentManagementI) => {
							if (resource.resourceId) {
								const result = await this.gSpatialRepository.deleteResource(
									resource.resourceId,
								);
								if (!result.status) {
									logger.info({
										message: `Failed to delete resource with ID: ${resource.resourceId}`,
										error: `${result.error}`,
									});
								}
							}
						}),
					);
					await this.datasetContentManagementRepository.deleteByConditions({
						contentVisualizeId: content.visualize.id,
						contentId: content.id,
					});
				}

				const contentVisualizeData = {
					status: isPublish,
				};
				await this.contentVisualizesRepository.updateByConditions(
					{ contentId: contentId },
					contentVisualizeData,
				);
				content.visualize = {
					...content.visualize,
					...contentVisualizeData,
				};
			}

			return {
				status: true,
				data: content,
			};
		} catch (error) {
			logger.error({
				message: "Public content failed",
				err: error,
			});
			return {
				status: false,
				error: error,
			};
		}
	}

	async createContentChat(contentId: string, user: UserInfo) {
		try {
			const contentResult = await this.getContentDetail(contentId);
			if (!contentResult.ok) {
				return {
					status: false,
					error: jp.message.content.contentNotFound(contentId),
				};
			}

			const content = (await contentResult.json()).data;
			const result = await this.mbRepository.createChat(
				contentId,
				routes.chatCallback,
			);
			if (!result.status) {
				return { status: false, error: (result as ErrorResponse).error };
			}

			const contentChatData = {
				chatId: (result as ChatResponse).ticketId,
				contentId: contentId,
				userId: user.uid,
				status: CHAT_STATUS.IN_PROGRESS,
				username: user.username,
			};
			if (content.chat) {
				await this.contentChatRepository.update(
					content.chat.id,
					contentChatData,
				);
			} else {
				await this.contentChatRepository.create(contentChatData);
			}
			content.chat = {
				...content.chat,
				...contentChatData,
			};

			return {
				status: true,
				data: content,
			};
		} catch (error) {
			logger.error({
				message: "Create content chat failed",
				err: error,
			});
			return {
				status: false,
				error: error,
			};
		}
	}

	async sendMessage(targetIds: string[], message: string, category: string) {
		try {
			const result = await this.mbRepository.sendMessageChat(
				targetIds,
				message,
				category,
			);
			if (!result.status) {
				return { status: false, error: (result as ErrorResponse).error };
			}

			const contentChatData = {
				answer: (result as SendMessageResponse).answer,
			};

			return {
				status: true,
				data: contentChatData,
			};
		} catch (error) {
			logger.error({
				message: "Send message chat failed",
				err: error,
			});
			return {
				status: false,
				error: error,
			};
		}
	}

	async duplicateContent(
		contentId: string,
		name: string,
		user: UserInfo,
	): Promise<ApiResponse<{ duplicateContent: ContentManagementI } | null>> {
		const validationError = validate(
			!contentId || !name,
			jp.message.content.contentIdAndNameRequired,
		);
		if (validationError) {
			return validationError;
		}

		const result = await this.contentRepository.duplicateContent(
			contentId,
			name,
		);
		if (!result.status) return result;

		const duplicateContentId = result.data?.id;
		const duplicateContent = await this.contentManagementRepository.create({
			contentId: duplicateContentId,
			parentContentId: contentId,
			status: CONTENT_MANAGEMENT_PUBLISH.UN_PUBLISH,
			userId: user.uid,
			username: user.username,
		});

		await this.resourcePermissionRepository.create({
			userId: user.uid,
			username: user.username,
			resourceType: RESOURCE_PERMISSION_TYPE.CONTENT,
			resourceId: duplicateContentId,
			role: RESOURCE_PERMISSION_ROLE.EDIT,
		});

		return {
			status: true,
			data: {
				duplicateContent: {
					...duplicateContent,
					name,
				},
			},
		};
	}

	async saveMetadata(
		contentId: string,
		metaData: ContentMetaData,
		userId: string,
		username: string,
	) {
		const result = await this.contentRepository.getContentDetail(contentId);
		if (!result.status) return result;

		const content = (result as SuccessResponse<ContentItem>).data;
		let contentMetadata = await this.contentMetadataRepository.findFirst({
			contentId: contentId,
		});
		const firstItem = await this.getFirstContentItem(contentId);
		// Re update autofill field with latest value
		metaData.modified = content.lastModified;
		metaData.source = firstItem?._src_name ?? null;
		metaData.documentName = firstItem?._document_name ?? null;
		const metadata = {
			contentId: contentId,
			username: username,
			userId: userId,
			metadataJson: JSON.stringify(metaData),
		};
		if (!contentMetadata || !contentMetadata.id) {
			contentMetadata = await this.contentMetadataRepository.create(metadata);
		} else {
			contentMetadata = await this.contentMetadataRepository.update(
				contentMetadata.id,
				metadata,
			);
		}

		return {
			status: true,
			data: { metadata: contentMetadata },
		};
	}

	private async getFirstContentItem(contentId: string) {
		const initialResult = await this.contentRepository.getContentItems(
			contentId,
			{ perPage: 1, page: 1 },
		);
		// biome-ignore lint/suspicious/noExplicitAny: FIXME
		let firstItem: any = null;
		if (initialResult.status && initialResult.data.items) {
			const itemResult = await this.formatContentItems(
				initialResult.data.items,
				contentId,
			);
			if (itemResult.status) {
				const items = itemResult?.data.items;
				if (
					Array.isArray(items) &&
					items.length > 0 &&
					itemResult.data.type === OUTPUT_TYPE.JSON
				) {
					firstItem = items[0];
				} else if (
					"features" in items &&
					Array.isArray(items.features) &&
					items.features.length > 0
				) {
					firstItem = items.features[0]?.properties ?? {};
				}
			}
		}
		return firstItem;
	}
}

// Handle format create file json, geojson for import service
export function formatJSONData(
	renderFields: RenderContentField[],
	renderItems: TableItem[],
) {
	const newData = renderItems
		.map((item) => {
			if (item?.mode !== CELL_MODE.DELETED) {
				// biome-ignore lint/suspicious/noExplicitAny: FIXME
				const newItem: Record<string, any> =
					item?.mode === CELL_MODE.NEW ? {} : { id: item?.id };

				const filteredFields = renderFields.filter(
					(field) => field.mode !== "DELETED",
				);

				for (const field of filteredFields) {
					const fieldKey = field.id;

					if (item.fieldsKey[fieldKey]) {
						const itemField = item.fieldsKey[fieldKey];

						if (
							itemField.mode !== "DELETED" &&
							itemField.mode !== "NO_DATA" &&
							!(
								itemField.type !== FIELD_TYPE.Text &&
								itemField.type !== FIELD_TYPE.Integer &&
								itemField.type !== FIELD_TYPE.Number &&
								itemField.type !== FIELD_TYPE.Bool &&
								itemField.type !== FIELD_TYPE.Multiple
							)
						) {
							const newKey = itemField.key;
							const value = Array.isArray(itemField.value)
								? (itemField.value as string[])?.map((i) => i.trim()) ?? []
								: itemField.value;
							newItem[newKey] = value;
						}
					}
				}

				return newItem;
			}
		})
		.filter(Boolean);

	return newData;
}

export function formatGEOJSONData(
	renderFields: RenderContentField[],
	renderItems: TableItem[],
	contentDetail: ContentItem,
	items: ItemModel[],
): FeatureCollection {
	const newFeatures: Feature[] = [];

	const filteredRenderItems = renderItems.filter(
		(item) => item?.mode !== CELL_MODE.DELETED,
	);

	const filteredRenderFields = renderFields.filter(
		(field) => field.mode !== CELL_MODE.DELETED,
	);

	for (const renderItem of filteredRenderItems) {
		const feature: Feature = {
			type: "Feature",
			geometry: null,
			properties:
				renderItem?.mode === CELL_MODE.NEW ? {} : { id: renderItem?.id },
		};

		// Handle for geometry part
		const item = items.find((i) => i.id === renderItem.id);
		if (item) {
			const geometryField = item.fields.find(
				(field) => field.type === CONTENT_FIELD_TYPE.GEO,
			);
			if (geometryField?.value) {
				feature.geometry = JSON.parse(geometryField.value);
			}
		}

		// Handle for properties part
		const fields = Object.values(renderItem.fieldsKey).filter(
			(field) =>
				field.mode !== "NO_DATA" &&
				field.type !== CONTENT_FIELD_TYPE.GEO &&
				filteredRenderFields.some((f) => f.id === field.id),
		);
		for (const field of fields) {
			feature.properties[field.key] = field.value;
		}

		// Add new feature to newFeatures
		newFeatures.push(feature);
	}

	const newData: FeatureCollection = {
		type: "FeatureCollection",
		features: newFeatures,
		name: contentDetail?.id || "Unnamed Content",
		crs: DEFAULT_GEOMETRY_CRS,
	};

	return newData;
}
