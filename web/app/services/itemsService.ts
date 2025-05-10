import { json } from "@remix-run/node";
import jp from "~/commons/locales/jp";
import type { ItemParams, ItemsRequest } from "~/models/items";
import type { ItemsRepository } from "~/repositories/itemsRepository";
import type { ApiResponse } from "~/repositories/utils";
import { validate, validateV2 } from "./utils";

export class ItemsService {
	private itemsRepository: ItemsRepository;

	constructor(itemsRepository: ItemsRepository) {
		this.itemsRepository = itemsRepository;
	}

	async listItems(params: ItemParams) {
		const result = await this.itemsRepository.getItems(params);
		return json(result);
	}

	async getItemDetail(itemId: string) {
		const validationError = validate(
			!itemId,
			jp.message.content.itemIdRequired,
		);
		if (validationError) {
			return validationError;
		}
		const result = await this.itemsRepository.getItemDetail(itemId);
		return json(result);
	}

	async deleteItem(itemId: string): Promise<ApiResponse<null>> {
		const validationError = validate(
			!itemId,
			jp.message.content.itemIdRequired,
		);
		if (validationError) {
			return validationError;
		}
		return this.itemsRepository.deleteItem(itemId);
	}

	async deleteItems(itemIds: string[]) {
		const validationError = validate(
			itemIds.length === 0,
			"Item IDs are required",
		);
		if (validationError) {
			return validationError;
		}

		const results = await Promise.allSettled(
			itemIds.map((id) => this.deleteItem(id)),
		);

		const failedDeletions = results
			.map((result, index) => {
				if (result.status === "rejected") {
					return { id: itemIds[index], reason: result.reason };
				}
			})
			.filter(Boolean);

		if (failedDeletions.length > 0) {
			return {
				status: false,
				error: jp.message.content.deleteSomeItemsFailed,
				failedDeletions,
			};
		}

		return { status: true, data: null };
	}

	async createItems(modelId: string, data: ItemsRequest) {
		const validationError = validateV2(
			!modelId,
			jp.message.content.modelIdRequired,
		) as Response;
		if (validationError) {
			return await validationError.json();
		}
		return await this.itemsRepository.createItems(modelId, data);
	}
}
