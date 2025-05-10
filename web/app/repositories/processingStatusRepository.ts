import { logger } from "~/logger";
import type { ProcessingStatusResponse } from "~/models/processingStatus";
import { prisma } from "~/prisma";
import { type ApiResponse, GENERAL_ERROR_MESSAGE } from "./utils";

export class ProcessingStatusRepository {
	async fetchProcessingStatus(
		contentIds: string[],
		userId: string,
		isAdminRole = false,
	): Promise<ApiResponse<ProcessingStatusResponse>> {
		try {
			const [
				preprocessContentConfigs,
				contentConfigs,
				textMatchingContentConfigs,
				crossJoinContentConfigs,
				spatialJoinContentConfigs,
				spatialAggregateContentConfigs,
				contentAssetCreationLogs,
			] = await Promise.all([
				prisma.preprocessContentConfigs.findMany({
					where: isAdminRole ? {} : { modelId: { in: contentIds } },
				}),
				prisma.contentConfigs.findMany({
					where: isAdminRole ? {} : { modelId: { in: contentIds } },
				}),
				prisma.textMatchingContentConfigs.findMany({
					where: isAdminRole ? {} : { modelId: { in: contentIds } },
				}),
				prisma.crossJoinContentConfigs.findMany({
					where: isAdminRole ? {} : { modelId: { in: contentIds } },
				}),
				prisma.spatialJoinContentConfigs.findMany({
					where: isAdminRole ? {} : { modelId: { in: contentIds } },
				}),
				prisma.spatialAggregateContentConfigs.findMany({
					where: isAdminRole ? {} : { modelId: { in: contentIds } },
				}),
				prisma.contentAssetCreationLog.findMany({
					where: isAdminRole ? {} : { userId: userId },
				}),
			]);

			if (!preprocessContentConfigs.length) {
				logger.error({ message: "No preprocessContentConfigs found" });
			}
			if (!contentConfigs.length) {
				logger.error({ message: "No contentConfigs found" });
			}
			if (!textMatchingContentConfigs.length) {
				logger.error({ message: "No textMatchingContentConfigs found" });
			}
			if (!crossJoinContentConfigs.length) {
				logger.error({ message: "No crossJoinContentConfigs found" });
			}
			if (!spatialJoinContentConfigs.length) {
				logger.error({ message: "No spatialJoinContentConfigs found" });
			}
			if (!spatialAggregateContentConfigs.length) {
				logger.error({ message: "No spatialAggregateContentConfigs found" });
			}
			if (!contentAssetCreationLogs.length) {
				logger.error({ message: "No contentAssetCreationLogs found" });
			}

			return {
				status: true,
				data: {
					preprocessContentConfigs,
					contentConfigs,
					textMatchingContentConfigs,
					crossJoinContentConfigs,
					spatialJoinContentConfigs,
					spatialAggregateContentConfigs,
					contentAssetCreationLogs,
				},
			};
		} catch (error) {
			logger.error({
				message: "Error fetching processing",
				err: error,
			});
			return {
				status: false,
				error: GENERAL_ERROR_MESSAGE,
			};
		}
	}

	async fetchPendingProcesses(
		userId: string,
		isAdminRole: boolean,
	): // biome-ignore lint/suspicious/noExplicitAny: FIXME
	Promise<ApiResponse<any[]>> {
		try {
			const condition = isAdminRole
				? { operatorId: null }
				: { operatorId: null, userId: userId };
			const pendingProcesses = await prisma.workflowDetailExecution.findMany({
				where: condition,
				include: {
					workflowDetail: true,
				},
			});

			if (!pendingProcesses.length) {
				logger.info({
					message: "No pending processes found in workflowDetailExecutions",
				});
			}

			return {
				status: true,
				data: pendingProcesses,
			};
		} catch (error) {
			logger.error({
				message: "Error fetching pending processes",
				err: error,
			});
			return {
				status: false,
				error: GENERAL_ERROR_MESSAGE,
			};
		}
	}

	async checkProcessInExecution(
		operatorId: number,
		operatorType: string,
		// biome-ignore lint/suspicious/noExplicitAny: FIXME
	): Promise<any | null> {
		try {
			const execution = await prisma.workflowDetailExecution.findFirst({
				where: {
					operatorId: operatorId,
					operatorType: operatorType,
				},
			});
			return execution;
		} catch (error) {
			console.error(
				"Error checking process in workflowDetailExecutions",
				error,
			);
			return null;
		}
	}

	async getStepCount(executionUuid: string): Promise<number> {
		try {
			const steps = await prisma.workflowDetailExecution.findMany({
				where: { executionUuid: executionUuid },
			});
			return steps.length;
		} catch (error) {
			logger.error({
				message: "Error fetching steps for execution",
				err: error,
			});
			return 0;
		}
	}
}
