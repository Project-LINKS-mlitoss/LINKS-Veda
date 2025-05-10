import { json } from "@remix-run/node";
import { logger } from "~/logger";
import type { UseCaseRepository } from "~/repositories/useCaseRepository";
import { GENERAL_ERROR_MESSAGE } from "~/repositories/utils";

export class UseCaseService {
	private useCaseRepository: UseCaseRepository;

	constructor(useCaseRepository: UseCaseRepository) {
		this.useCaseRepository = useCaseRepository;
	}

	async listUseCase() {
		try {
			const data = await this.useCaseRepository.find({});

			return {
				status: true,
				data: data,
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
}
