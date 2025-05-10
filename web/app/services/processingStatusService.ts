import { json } from "@remix-run/node";
import {
	CONTENT_CALLBACK_API_STATUS,
	RESOURCE_PERMISSION_TYPE,
	ROLE,
} from "~/commons/core.const";
import type { ContentAssetCreationLogI } from "~/models/contentAssetCreationLogModel";
import {
	type ContentConfig,
	type CrossTabContentConfigs,
	InputTypeDB,
	type PreprocessContentConfigs,
	type SpatialAggregationContentConfigs,
	type SpatialJoinContentConfigs,
	type TextMatchingContentConfigs,
} from "~/models/operators";
import {
	OPERATOR_TYPE_FOLLOW_PREPROCESSING_TYPE,
	PREPROCESSING_TYPE,
	PREPROCESSING_TYPE_FOLLOW_OPERATOR_TYPE,
	PREPROCESSING_TYPE_JAPAN,
	type ProcessingStatusParams,
} from "~/models/processingStatus";
import type { ResourcePermissionI } from "~/models/resourcePermissionModel.js";
import type { AccountManagementRepository } from "~/repositories/accountManagementRepository";
import type { AssetRepository } from "~/repositories/assetRepository";
import type { ContentRepository } from "~/repositories/contentRepository";
import type { MbRepository } from "~/repositories/mbRepository";
import type { ProcessingStatusRepository } from "~/repositories/processingStatusRepository";
import type { ResourcePermissionRepository } from "~/repositories/resourcePermissionRepository.js";

export class ProcessingStatusService {
	private processingStatusRepository: ProcessingStatusRepository;
	private assetRepository: AssetRepository;
	private contentRepository: ContentRepository;
	private mbRepository: MbRepository;
	private resourcePermissionRepository: ResourcePermissionRepository;
	private accountManagementRepository: AccountManagementRepository;

	constructor(
		processingStatusRepository: ProcessingStatusRepository,
		assetRepository: AssetRepository,
		contentRepository: ContentRepository,
		mbRepository: MbRepository,
		resourcePermissionRepository: ResourcePermissionRepository,
		accountManagementRepository: AccountManagementRepository,
	) {
		this.processingStatusRepository = processingStatusRepository;
		this.assetRepository = assetRepository;
		this.contentRepository = contentRepository;
		this.mbRepository = mbRepository;
		this.resourcePermissionRepository = resourcePermissionRepository;
		this.accountManagementRepository = accountManagementRepository;
	}

	private async getInputDetail(inputType: InputTypeDB, inputId: string) {
		if (inputType === InputTypeDB.ASSET) {
			const assetDetail = await this.assetRepository.getAssetDetail(inputId);
			return assetDetail?.status ? assetDetail.data : null;
		}
		const contentDetail =
			await this.contentRepository.getContentDetail(inputId);
		return contentDetail?.status
			? contentDetail.data
			: {
					name: "-",
				};
	}

	async getProcessingStatus(params: ProcessingStatusParams, userId: string) {
		const user = await this.accountManagementRepository.findFirst(
			{ userId: userId },
			{
				id: true,
				role: true,
				userId: true,
				useCaseIds: true,
			},
		);
		let contentIds = [];
		const isAdminRole = user && user.role === ROLE.ADMIN;
		if (!isAdminRole) {
			const resources = await this.resourcePermissionRepository.find(
				{
					resourceType: RESOURCE_PERMISSION_TYPE.CONTENT,
					deletedAt: null,
					userId: userId,
				},
				{
					resourceId: true,
				},
			);
			contentIds = resources.map(
				(resource: ResourcePermissionI) => resource.resourceId,
			);
		}
		const result = await this.processingStatusRepository.fetchProcessingStatus(
			contentIds,
			userId,
			isAdminRole,
		);

		if (!result?.status || !result.data) {
			return json(result);
		}

		const pendingProcessesResult =
			await this.processingStatusRepository.fetchPendingProcesses(
				userId,
				isAdminRole,
			);
		const pendingProcesses = pendingProcessesResult.status
			? pendingProcessesResult.data
			: [];

		const data = result.data;

		const enrichedConfigs = [
			...data.contentConfigs.map((item) => ({
				...item,
				operatorType: PREPROCESSING_TYPE.CONTENT_CONFIGS,
			})),
			...data.preprocessContentConfigs.map((item) => ({
				...item,
				operatorType: PREPROCESSING_TYPE.PREPROCESS_CONTENT_CONFIGS,
			})),
			...data.textMatchingContentConfigs.map((item) => ({
				...item,
				operatorType: PREPROCESSING_TYPE.TEXT_MATCHING_CONTENT_CONFIGS,
			})),
			...data.crossJoinContentConfigs.map((item) => ({
				...item,
				operatorType: PREPROCESSING_TYPE.CROSS_JOIN_CONTENT_CONFIGS,
			})),
			...data.spatialJoinContentConfigs.map((item) => ({
				...item,
				operatorType: PREPROCESSING_TYPE.SPATIAL_JOIN_CONTENT_CONFIGS,
			})),
			...data.spatialAggregateContentConfigs.map((item) => ({
				...item,
				operatorType: PREPROCESSING_TYPE.SPATIAL_AGGREGATE_CONTENT_CONFIGS,
			})),
			...data.contentAssetCreationLogs.map((item) => ({
				...item,
				operatorType: PREPROCESSING_TYPE.CONTENT_CREATION,
				modeId: item.contentId,
			})),
		];

		const allConfigs = [
			...enrichedConfigs,
			...pendingProcesses
				.map((process) => {
					const operatorKey = process?.operatorType;
					if (operatorKey in PREPROCESSING_TYPE_FOLLOW_OPERATOR_TYPE) {
						return {
							...process,
							status: CONTENT_CALLBACK_API_STATUS.PENDING_PROCESS,
							operatorType:
								PREPROCESSING_TYPE_FOLLOW_OPERATOR_TYPE[
									operatorKey as keyof typeof PREPROCESSING_TYPE_FOLLOW_OPERATOR_TYPE
								],
						};
					}
					return null;
				})
				.filter((item) => item !== null),
		];

		let filteredConfigs = allConfigs;
		if (params.keyword) {
			const keyword = params.keyword.toLowerCase();
			filteredConfigs = filteredConfigs.filter((item) => {
				const operatorKey =
					item.operatorType as keyof typeof PREPROCESSING_TYPE_JAPAN;
				if (operatorKey in PREPROCESSING_TYPE_JAPAN) {
					return PREPROCESSING_TYPE_JAPAN[operatorKey]
						.toLowerCase()
						.includes(keyword);
				}

				return false;
			});
		}

		filteredConfigs.sort((a, b) => {
			const dateA = new Date(a.createdAt).getTime();
			const dateB = new Date(b.createdAt).getTime();
			return dateB - dateA;
		});

		const totalCount = filteredConfigs.length;

		const page = params.page || 1;
		const perPage = params.perPage || 10;
		const start = (page - 1) * perPage;
		const end = start + perPage;
		const paginatedConfigs = filteredConfigs.slice(start, end);

		const finalConfigs = await Promise.all(
			paginatedConfigs.map(async (configItem) => {
				// biome-ignore lint/suspicious/noExplicitAny: FIXME
				let inputDetail: any;
				switch (configItem.operatorType) {
					case PREPROCESSING_TYPE.CONTENT_CONFIGS:
						{
							const itemContentConfig = configItem as ContentConfig;
							inputDetail = await this.getInputDetail(
								InputTypeDB.ASSET,
								itemContentConfig.assetId as string,
							);
						}
						break;
					case PREPROCESSING_TYPE.PREPROCESS_CONTENT_CONFIGS:
						{
							const itemPreprocessContentConfigs =
								configItem as PreprocessContentConfigs;
							inputDetail = await this.getInputDetail(
								itemPreprocessContentConfigs.inputType as InputTypeDB,
								itemPreprocessContentConfigs.inputId as string,
							);
						}
						break;
					case PREPROCESSING_TYPE.TEXT_MATCHING_CONTENT_CONFIGS:
					case PREPROCESSING_TYPE.SPATIAL_JOIN_CONTENT_CONFIGS:
					case PREPROCESSING_TYPE.SPATIAL_AGGREGATE_CONTENT_CONFIGS:
						{
							const itemTextSpatialConfigs = configItem as
								| TextMatchingContentConfigs
								| SpatialJoinContentConfigs
								| SpatialAggregationContentConfigs;
							inputDetail = await this.getInputDetail(
								InputTypeDB.CONTENT,
								itemTextSpatialConfigs.leftContentId as string,
							);
						}
						break;
					case PREPROCESSING_TYPE.CROSS_JOIN_CONTENT_CONFIGS:
						{
							const itemCrossTabContentConfigs =
								configItem as CrossTabContentConfigs;
							inputDetail = await this.getInputDetail(
								InputTypeDB.CONTENT,
								itemCrossTabContentConfigs.inputContentId as string,
							);
						}
						break;
					case PREPROCESSING_TYPE.CONTENT_CREATION:
						{
							const content = configItem as ContentAssetCreationLogI;
							inputDetail = await this.getInputDetail(
								InputTypeDB.CONTENT,
								content.contentId as string,
							);
						}
						break;
					default:
						inputDetail = null;
						break;
				}

				// biome-ignore lint/suspicious/noExplicitAny: FIXME
				let error: any;
				let status: CONTENT_CALLBACK_API_STATUS = configItem.status;
				if (
					configItem.status !== CONTENT_CALLBACK_API_STATUS.DONE &&
					configItem.status !== CONTENT_CALLBACK_API_STATUS.SAVED &&
					configItem.operatorType !== PREPROCESSING_TYPE.CONTENT_CREATION
				) {
					const mbResult = await this.mbRepository.checkTicketStatus(
						configItem.ticketId,
					);
					if (mbResult.status) {
						if ("ticketStatus" in mbResult) {
							status = mbResult.ticketStatus;
						}

						if ("error" in mbResult) {
							error = mbResult?.error;
						}
					}
				}

				const operatorType =
					configItem?.operatorType &&
					configItem?.operatorType in OPERATOR_TYPE_FOLLOW_PREPROCESSING_TYPE
						? OPERATOR_TYPE_FOLLOW_PREPROCESSING_TYPE[
								configItem.operatorType as keyof typeof OPERATOR_TYPE_FOLLOW_PREPROCESSING_TYPE
							]
						: "";

				const execution =
					await this.processingStatusRepository.checkProcessInExecution(
						configItem.id,
						operatorType,
					);

				const isInExecution =
					configItem?.status === CONTENT_CALLBACK_API_STATUS.PENDING_PROCESS
						? true
						: !!execution;

				let stepCount = 0;
				if (isInExecution) {
					stepCount = await this.processingStatusRepository.getStepCount(
						configItem?.status === CONTENT_CALLBACK_API_STATUS.PENDING_PROCESS
							? configItem.executionUuid
							: execution?.executionUuid,
					);
				}

				const { username, createdBy, ...restConfigItem } = configItem || {};
				return {
					...restConfigItem,
					createdBy: createdBy ?? username,
					inputDetail,
					error,
					status,
					isInExecution,
					step:
						configItem?.status === CONTENT_CALLBACK_API_STATUS.PENDING_PROCESS
							? configItem?.step
							: execution?.step,
					stepCount,
				};
			}),
		);

		return json({
			...result,
			data: {
				data: finalConfigs,
				totalCount: totalCount,
			},
		});
	}
}
