import { Prisma } from "@prisma/client";
import jp from "~/commons/locales/jp";
import { logger } from "~/logger";
import type {
	SaveTemplateDBT,
	SaveWorkflowDBT,
	TemplatesParams,
	TemplatesResponse,
	TemplatesT,
	WorkflowDetail,
	WorkflowT,
} from "~/models/templates";
import { prisma } from "~/prisma";
import { BaseRepository } from "~/repositories/baseRepository";
import { type ApiResponse, GENERAL_ERROR_MESSAGE } from "~/repositories/utils";

export class TemplatesRepository extends BaseRepository<typeof prisma.dataset> {
	constructor() {
		super(prisma.dataset);
	}

	async fetchTemplates(
		params: TemplatesParams,
	): Promise<ApiResponse<TemplatesResponse>> {
		try {
			const { keyword, operatorType } = params;

			const templatesResponse = await prisma.templates.findMany({
				where: {
					AND: [
						keyword
							? {
									name: { contains: keyword },
								}
							: {},
						operatorType
							? {
									operatorType: operatorType,
								}
							: {},
					],
				},
			});

			if (!templatesResponse.length) {
				logger.error({ message: "No templates found" });
			}

			return {
				status: true,
				data: templatesResponse,
			};
		} catch (error) {
			logger.error({
				message: "Error fetching templates",
				err: error,
			});
			return {
				status: false,
				error: GENERAL_ERROR_MESSAGE,
			};
		}
	}

	async getDetailTemplate(
		templateId: number,
	): Promise<ApiResponse<TemplatesT | null>> {
		try {
			const templateDetail = await prisma.templates.findUnique({
				where: { id: templateId },
			});

			if (!templateDetail) {
				logger.error({ message: `Template with ID ${templateId} not found` });
				return {
					status: false,
					error: jp.message.template.templateNotFound(String(templateId)),
				};
			}

			return {
				status: true,
				data: templateDetail,
			};
		} catch (error) {
			logger.error({
				message: "Error fetching template details",
				err: error,
			});
			return {
				status: false,
				error: GENERAL_ERROR_MESSAGE,
			};
		}
	}

	async deleteTemplate(templateId: number): Promise<ApiResponse<null>> {
		try {
			await prisma.templates.delete({
				where: { id: templateId },
			});

			logger.info({
				message: `Template with ID ${templateId} deleted successfully`,
			});
			return {
				status: true,
				data: null,
			};
		} catch (error) {
			logger.error({
				message: "Error deleting template",
				err: error,
			});
			return {
				status: false,
				error: GENERAL_ERROR_MESSAGE,
			};
		}
	}

	async saveTemplate(
		templateData: SaveTemplateDBT,
	): Promise<ApiResponse<TemplatesT>> {
		try {
			const savedTemplate = await prisma.templates.create({
				data: {
					...templateData,
					configJson: templateData.configJson ?? Prisma.JsonNull,
				},
			});

			logger.info({
				message: "Template created successfully",
				templateId: savedTemplate.id,
			});
			return {
				status: true,
				data: savedTemplate,
			};
		} catch (error) {
			logger.error({
				message: "Error saving template",
				err: error,
			});
			return {
				status: false,
				error: GENERAL_ERROR_MESSAGE,
			};
		}
	}

	async updateTemplate(
		templateId: number,
		templateData: SaveTemplateDBT,
	): Promise<ApiResponse<TemplatesT | null>> {
		try {
			const updatedTemplate = await prisma.templates.update({
				where: { id: templateId },
				data: {
					...templateData,
					configJson: templateData.configJson ?? Prisma.JsonNull,
				},
			});

			logger.info({
				message: `Template with ID ${templateId} updated successfully`,
			});
			return {
				status: true,
				data: updatedTemplate,
			};
		} catch (error) {
			logger.error({
				message: `Error updating template with ID ${templateId}`,
				err: error,
			});
			return {
				status: false,
				error: GENERAL_ERROR_MESSAGE,
			};
		}
	}

	// Workflows
	async fetchWorkflows(keyword?: string): Promise<ApiResponse<WorkflowT[]>> {
		try {
			const workflows = await prisma.workflow.findMany({
				where: {
					...(keyword
						? {
								name: {
									contains: keyword,
								},
							}
						: {}),
					deletedAt: null,
				},
				include: {
					workflowDetails: {
						where: { deletedAt: null },
					},
				},
			});

			return {
				status: true,
				data: workflows,
			};
		} catch (error) {
			logger.error({
				message: "Error fetching workflow list",
				err: error,
			});
			return {
				status: false,
				error: GENERAL_ERROR_MESSAGE,
			};
		}
	}

	async getDetailWorkflowDetail(
		workflowDetailId: number,
	): Promise<WorkflowDetail | null> {
		try {
			const workflowDetail = await prisma.workflowDetail.findUnique({
				where: {
					id: workflowDetailId,
				},
			});

			return workflowDetail;
		} catch (error) {
			logger.error({
				message: `Error fetching details for workflow ID ${workflowDetailId}`,
				err: error,
			});

			return null;
		}
	}

	async getDetailWorkflow(
		workflowId: number,
		includeDeleted = false,
	): Promise<ApiResponse<WorkflowT | null>> {
		try {
			const workflow = await prisma.workflow.findFirst({
				where: {
					id: workflowId,
					...(includeDeleted ? {} : { deletedAt: null }),
				},
				include: {
					workflowDetails: {
						where: includeDeleted ? {} : { deletedAt: null },
					},
				},
			});

			if (!workflow) {
				return {
					status: false,
					error: jp.message.template.workflowNotFound,
				};
			}

			return {
				status: true,
				data: workflow,
			};
		} catch (error) {
			logger.error({
				message: `Error fetching details for workflow ID ${workflowId}`,
				err: error,
			});

			return {
				status: false,
				error: GENERAL_ERROR_MESSAGE,
			};
		}
	}

	async deleteWorkflow(workflowId: number): Promise<ApiResponse<null>> {
		try {
			const workflow = await prisma.workflow.findUnique({
				where: { id: workflowId },
			});

			if (!workflow) {
				return {
					status: false,
					error: jp.message.template.workflowNotFound,
				};
			}

			// delete in workflowDetail
			const existingWorkflowDetails = await prisma.workflowDetail.findMany({
				where: {
					workflowId: workflowId,
					deletedAt: null,
				},
				include: {
					workflowDetailExecutions: true,
				},
			});
			const dependentDetails = existingWorkflowDetails.filter(
				(detail) => detail.workflowDetailExecutions?.length > 0,
			);
			const independentDetails = existingWorkflowDetails.filter(
				(detail) => detail.workflowDetailExecutions?.length === 0,
			);
			if (dependentDetails.length > 0) {
				await prisma.workflowDetail.updateMany({
					where: {
						id: { in: dependentDetails.map((detail) => detail.id) },
					},
					data: { deletedAt: new Date() },
				});
			}
			if (independentDetails.length > 0) {
				await prisma.workflowDetail.deleteMany({
					where: {
						id: { in: independentDetails.map((detail) => detail.id) },
					},
				});
			}

			// delete in workflow
			const remainingWorkflowDetails = await prisma.workflowDetail.findMany({
				where: {
					workflowId: workflowId,
				},
			});
			if (remainingWorkflowDetails.length === 0) {
				await prisma.workflow.delete({
					where: {
						id: workflowId,
					},
				});
			} else {
				await prisma.workflow.update({
					where: {
						id: workflowId,
					},
					data: {
						deletedAt: new Date(),
					},
				});
			}

			return {
				status: true,
				data: null,
			};
		} catch (error) {
			logger.error({
				message: `Error deleting workflow with ID ${workflowId}`,
				err: error,
			});

			return {
				status: false,
				error: GENERAL_ERROR_MESSAGE,
			};
		}
	}

	async saveWorkflow(data: SaveWorkflowDBT): Promise<ApiResponse<WorkflowT>> {
		try {
			const existingWorkflow = await prisma.workflow.findFirst({
				where: {
					name: data.workflowName,
					deletedAt: null,
				},
			});

			if (existingWorkflow) {
				return {
					status: false,
					error: jp.message.template.workflowNameExists,
				};
			}

			const savedWorkflow = await prisma.workflow.create({
				data: { name: data.workflowName },
			});

			const workflowId = savedWorkflow.id;

			const workflowDetails = data.stepWorkflow.map((step) => ({
				workflowId,
				step: step.step,
				operatorType: step.operatorType,
				configJson: step.configJson ?? Prisma.JsonNull,
			}));

			await prisma.workflowDetail.createMany({
				data: workflowDetails,
			});

			logger.info({
				message: "Workflow and details created successfully",
				workflowId: workflowId,
			});

			return {
				status: true,
				data: savedWorkflow,
			};
		} catch (error) {
			logger.error({
				message: "Error saving Workflow or details",
				err: error,
			});
			return {
				status: false,
				error: GENERAL_ERROR_MESSAGE,
			};
		}
	}

	async updateWorkflow(
		templateId: number,
		data: SaveWorkflowDBT,
	): Promise<ApiResponse<WorkflowT>> {
		try {
			const existingWorkflow = await prisma.workflow.findFirst({
				where: {
					name: data.workflowName,
					id: { not: templateId },
					deletedAt: null,
				},
			});

			if (existingWorkflow) {
				return {
					status: false,
					error: jp.message.template.workflowNameExists,
				};
			}

			const updatedWorkflow = await prisma.workflow.update({
				where: { id: templateId },
				data: { name: data.workflowName },
			});

			// Check for dependencies in workflowDetailExecution.
			const existingWorkflowDetails = await prisma.workflowDetail.findMany({
				where: { workflowId: templateId },
				include: {
					workflowDetailExecutions: true,
				},
			});
			const dependentDetails = existingWorkflowDetails.filter(
				(detail) =>
					detail.workflowDetailExecutions &&
					detail.workflowDetailExecutions.length > 0,
			);
			const independentDetails = existingWorkflowDetails.filter(
				(detail) =>
					!detail.workflowDetailExecutions ||
					detail.workflowDetailExecutions.length === 0,
			);
			if (dependentDetails.length > 0) {
				await prisma.workflowDetail.updateMany({
					where: {
						id: { in: dependentDetails.map((detail) => detail.id) },
					},
					data: { deletedAt: new Date() },
				});
			}
			if (independentDetails.length > 0) {
				await prisma.workflowDetail.deleteMany({
					where: {
						id: { in: independentDetails.map((detail) => detail.id) },
					},
				});
			}

			const workflowDetails = data.stepWorkflow.map((step) => ({
				workflowId: templateId,
				step: step.step,
				operatorType: step.operatorType,
				configJson: step.configJson ?? Prisma.JsonNull,
			}));

			await prisma.workflowDetail.createMany({
				data: workflowDetails,
			});

			logger.info({
				message: `Workflow with ID ${templateId} and its details updated successfully`,
			});

			return {
				status: true,
				data: updatedWorkflow,
			};
		} catch (error) {
			logger.error({
				message: `Error updating workflow with ID ${templateId}`,
				err: error,
			});
			return {
				status: false,
				error: GENERAL_ERROR_MESSAGE,
			};
		}
	}
}
