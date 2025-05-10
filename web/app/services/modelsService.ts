import { json } from "@remix-run/node";
import _ from "lodash";
import jp from "~/commons/locales/jp";
import type { ModelParams } from "~/models/models";
import type { ModelsRepository } from "~/repositories/modelsRepository";
import { validate } from "./utils";

export class ModelsService {
	private modelsRepository: ModelsRepository;

	constructor(modelsRepository: ModelsRepository) {
		this.modelsRepository = modelsRepository;
	}

	async listModel(params: ModelParams) {
		const result = await this.modelsRepository.getModel(params);
		return json(result);
	}

	async getModelDetail(modelId: string) {
		const validationError = validate(
			!modelId,
			jp.message.content.modelIdRequired,
		);
		if (validationError) {
			return validationError;
		}
		const result = await this.modelsRepository.getModelDetail(modelId);
		return json(result);
	}
}
