import { json } from "@remix-run/node";
import jp from "~/commons/locales/jp";
import { logger } from "~/logger";
import {
	OPERATOR_TYPE,
	type SaveTemplateCrossTabParamsT,
	type SaveTemplateDataStructureParamsT,
	type SaveTemplatePreProcessingParamsT,
	type SaveTemplateSpatialAggregationParamsT,
	type SaveTemplateSpatialJoinParamsT,
	type SaveTemplateTextMatchingParamsT,
	type SaveWorkflowDBT,
	type TemplatesParams,
	type TemplatesT,
} from "~/models/templates";
import type { TemplatesRepository } from "~/repositories/templatesRepository";
import type { ApiResponse } from "~/repositories/utils";
import { validate } from "./utils";

export class TemplatesService {
	private templatesRepository: TemplatesRepository;

	constructor(templatesRepository: TemplatesRepository) {
		this.templatesRepository = templatesRepository;
	}

	async getListTemplatesAndWorkflows(params: TemplatesParams) {
		const { keyword, operatorType } = params;

		const templatesResult = await this.templatesRepository.fetchTemplates({
			keyword,
			operatorType,
		});
		const workflowsResult =
			await this.templatesRepository.fetchWorkflows(keyword);

		if (operatorType) {
			if (operatorType !== OPERATOR_TYPE.WORK_FLOW) {
				return json(templatesResult);
			}
			if (operatorType === OPERATOR_TYPE.WORK_FLOW) {
				return json(workflowsResult);
			}
		}

		return json({
			templates: templatesResult,
			workflows: workflowsResult,
		});
	}

	async getDetailTemplate(templateId: number) {
		const validationError = validate(
			!templateId,
			jp.message.template.templateIdRequired,
		);
		if (validationError) {
			return validationError;
		}
		const result = await this.templatesRepository.getDetailTemplate(templateId);
		return json(result);
	}

	async getDetailWorkflow(workflowId: number) {
		const validationError = validate(
			!workflowId,
			jp.message.template.workflowIdRequired,
		);
		if (validationError) {
			return validationError;
		}
		const result = await this.templatesRepository.getDetailWorkflow(workflowId);
		return json(result);
	}

	async deleteTemplate(templateId: number): Promise<ApiResponse<null>> {
		try {
			const validationError = validate(
				!templateId,
				jp.message.template.templateIdRequired,
			);
			if (validationError) {
				return validationError;
			}
			const result = await this.templatesRepository.deleteTemplate(templateId);

			return result;
		} catch (e) {
			logger.error({
				message: `Delete template ${templateId} failed`,
				err: e,
			});
			return Promise.resolve({
				status: false,
				error: "Unable to delete template",
			});
		}
	}

	async deleteWorkflow(workflowId: number): Promise<ApiResponse<null>> {
		try {
			const validationError = validate(
				!workflowId,
				jp.message.template.workflowIdRequired,
			);
			if (validationError) {
				return validationError;
			}
			const result = await this.templatesRepository.deleteWorkflow(workflowId);

			return result;
		} catch (e) {
			logger.error({
				message: `Delete template ${workflowId} failed`,
				err: e,
			});
			return Promise.resolve({
				status: false,
				error: "Unable to delete template",
			});
		}
	}

	async saveWorkflow(data: SaveWorkflowDBT) {
		const result = await this.templatesRepository.saveWorkflow(data);
		return result;
	}

	async updateWorkflow(templateId: number, data: SaveWorkflowDBT) {
		const result = await this.templatesRepository.updateWorkflow(
			templateId,
			data,
		);
		return result;
	}

	async saveTemplateDataStructure(data: SaveTemplateDataStructureParamsT) {
		const templateData = {
			name: data?.templateName,
			operatorType: OPERATOR_TYPE.DATA_STRUCTURE,
			configJson: JSON.stringify({
				content: data?.content,
				genSourceName: data?.genSourceName,
				prompt: data?.prompt,
				typeOutput: data?.typeOutput,
			}),
		};
		const result = await this.templatesRepository.saveTemplate(templateData);
		return json(result);
	}

	async updateTemplateDataStructure(
		templateId: number,
		data: SaveTemplateDataStructureParamsT,
	): Promise<ApiResponse<TemplatesT | null>> {
		const validationError = validate(
			!templateId,
			jp.message.template.templateIdRequired,
		);
		if (validationError) {
			return validationError;
		}

		const templateData = {
			name: data?.templateName,
			operatorType: OPERATOR_TYPE.DATA_STRUCTURE,
			configJson: JSON.stringify({
				content: data?.content,
				genSourceName: data?.genSourceName,
				prompt: data?.prompt,
				typeOutput: data?.typeOutput,
			}),
		};

		try {
			const result = await this.templatesRepository.updateTemplate(
				templateId,
				templateData,
			);
			return result;
		} catch (e) {
			logger.error({
				message: `Update template ${templateId} failed`,
				err: e,
			});
			return {
				status: false,
				error: jp.message.template.updateTemplateFailed,
			};
		}
	}

	async saveTemplatePreProcessing(data: SaveTemplatePreProcessingParamsT) {
		const templateData = {
			name: data?.templateName,
			operatorType: OPERATOR_TYPE.PRE_PROCESSING,
			configJson: JSON.stringify({
				cleansing: data?.cleansing,
				preProcessType: data?.preProcessType,
				masking: data?.masking,
				documentName: data?.documentName,
				geocoding: data?.geocoding,
				options: data?.options,
			}),
		};
		const result = await this.templatesRepository.saveTemplate(templateData);
		return json(result);
	}

	async updateTemplatePreProcessing(
		templateId: number,
		data: SaveTemplatePreProcessingParamsT,
	): Promise<ApiResponse<TemplatesT | null>> {
		const validationError = validate(
			!templateId,
			jp.message.template.templateIdRequired,
		);
		if (validationError) {
			return validationError;
		}

		const templateData = {
			name: data?.templateName,
			operatorType: OPERATOR_TYPE.PRE_PROCESSING,
			configJson: JSON.stringify({
				cleansing: data?.cleansing,
				preProcessType: data?.preProcessType,
				masking: data?.masking,
				documentName: data?.documentName,
				geocoding: data?.geocoding,
				options: data?.options,
			}),
		};

		try {
			const result = await this.templatesRepository.updateTemplate(
				templateId,
				templateData,
			);
			return result;
		} catch (e) {
			logger.error({
				message: `Update template ${templateId} failed`,
				err: e,
			});
			return {
				status: false,
				error: jp.message.template.updateTemplateFailed,
			};
		}
	}

	async saveTemplateTextMatching(data: SaveTemplateTextMatchingParamsT) {
		const templateData = {
			name: data?.templateName,
			operatorType: OPERATOR_TYPE.TEXT_MATCHING,
			configJson: JSON.stringify({
				settingTextMatching: data?.settingTextMatching,
				contents: data?.contents,
			}),
		};
		const result = await this.templatesRepository.saveTemplate(templateData);
		return json(result);
	}

	async updateTemplateTextMatching(
		templateId: number,
		data: SaveTemplateTextMatchingParamsT,
	): Promise<ApiResponse<TemplatesT | null>> {
		const validationError = validate(
			!templateId,
			jp.message.template.templateIdRequired,
		);
		if (validationError) {
			return validationError;
		}

		const templateData = {
			name: data?.templateName,
			operatorType: OPERATOR_TYPE.TEXT_MATCHING,
			configJson: JSON.stringify({
				settingTextMatching: data?.settingTextMatching,
				contents: data?.contents,
			}),
		};

		try {
			const result = await this.templatesRepository.updateTemplate(
				templateId,
				templateData,
			);
			return result;
		} catch (e) {
			logger.error({
				message: `Update template ${templateId} failed`,
				err: e,
			});
			return {
				status: false,
				error: jp.message.template.updateTemplateFailed,
			};
		}
	}

	async saveTemplateCrossTab(data: SaveTemplateCrossTabParamsT) {
		const templateData = {
			name: data?.templateName,
			operatorType: OPERATOR_TYPE.CROSS_TAB,
			configJson: JSON.stringify({
				settingCrossTabRequest: data?.settingCrossTabRequest,
				setting: data?.setting,
			}),
		};
		const result = await this.templatesRepository.saveTemplate(templateData);
		return json(result);
	}

	async updateTemplateCrossTab(
		templateId: number,
		data: SaveTemplateCrossTabParamsT,
	): Promise<ApiResponse<TemplatesT | null>> {
		const validationError = validate(
			!templateId,
			jp.message.template.templateIdRequired,
		);
		if (validationError) {
			return validationError;
		}

		const templateData = {
			name: data?.templateName,
			operatorType: OPERATOR_TYPE.CROSS_TAB,
			configJson: JSON.stringify({
				settingCrossTabRequest: data?.settingCrossTabRequest,
				setting: data?.setting,
			}),
		};

		try {
			const result = await this.templatesRepository.updateTemplate(
				templateId,
				templateData,
			);
			return result;
		} catch (e) {
			logger.error({
				message: `Update template ${templateId} failed`,
				err: e,
			});
			return {
				status: false,
				error: jp.message.template.updateTemplateFailed,
			};
		}
	}

	async saveTemplateSpatialJoin(data: SaveTemplateSpatialJoinParamsT) {
		const templateData = {
			name: data?.templateName,
			operatorType: OPERATOR_TYPE.SPATIAL_JOIN,
			configJson: JSON.stringify({
				requestSpatialJoin: data?.requestSpatialJoin,
				contents: data?.contents,
			}),
		};
		const result = await this.templatesRepository.saveTemplate(templateData);
		return json(result);
	}

	async updateTemplateSpatialJoin(
		templateId: number,
		data: SaveTemplateSpatialJoinParamsT,
	): Promise<ApiResponse<TemplatesT | null>> {
		const validationError = validate(
			!templateId,
			jp.message.template.templateIdRequired,
		);
		if (validationError) {
			return validationError;
		}

		const templateData = {
			name: data?.templateName,
			operatorType: OPERATOR_TYPE.SPATIAL_JOIN,
			configJson: JSON.stringify({
				requestSpatialJoin: data?.requestSpatialJoin,
				contents: data?.contents,
			}),
		};

		try {
			const result = await this.templatesRepository.updateTemplate(
				templateId,
				templateData,
			);
			return result;
		} catch (e) {
			logger.error({
				message: `Update template ${templateId} failed`,
				err: e,
			});
			return {
				status: false,
				error: jp.message.template.updateTemplateFailed,
			};
		}
	}

	async saveTemplateSpatialAggregation(
		data: SaveTemplateSpatialAggregationParamsT,
	) {
		const templateData = {
			name: data?.templateName,
			operatorType: OPERATOR_TYPE.SPATIAL_AGGREGATE,
			configJson: JSON.stringify({
				settingSpatialAggregateRequest: data?.settingSpatialAggregateRequest,
				settingDetail: data?.settingDetail,
			}),
		};
		const result = await this.templatesRepository.saveTemplate(templateData);
		return json(result);
	}

	async updateTemplateSpatialAggregation(
		templateId: number,
		data: SaveTemplateSpatialAggregationParamsT,
	): Promise<ApiResponse<TemplatesT | null>> {
		const validationError = validate(
			!templateId,
			jp.message.template.templateIdRequired,
		);
		if (validationError) {
			return validationError;
		}

		const templateData = {
			name: data?.templateName,
			operatorType: OPERATOR_TYPE.SPATIAL_AGGREGATE,
			configJson: JSON.stringify({
				settingSpatialAggregateRequest: data?.settingSpatialAggregateRequest,
				settingDetail: data?.settingDetail,
			}),
		};

		try {
			const result = await this.templatesRepository.updateTemplate(
				templateId,
				templateData,
			);
			return result;
		} catch (e) {
			logger.error({
				message: `Update template ${templateId} failed`,
				err: e,
			});
			return {
				status: false,
				error: jp.message.template.updateTemplateFailed,
			};
		}
	}
}
