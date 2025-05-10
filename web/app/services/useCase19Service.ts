import { type TypedResponse, json } from "@remix-run/node";
import type {
	UC19_01_倉庫業登録申請書,
	UC19_02_倉庫業実績報告書,
} from "~/models/useCase19";
import type { UseCase19Repository } from "~/repositories/useCase19Repository";
import type { ApiResponse } from "~/repositories/utils";

export class UseCase19Service {
	private usecaseRepository: UseCase19Repository;

	constructor(usecaseRepository: UseCase19Repository) {
		this.usecaseRepository = usecaseRepository;
	}

	async getWarehouse(): Promise<
		TypedResponse<ApiResponse<UC19_01_倉庫業登録申請書[]>>
	> {
		try {
			const records =
				await this.usecaseRepository.getUC19_01_倉庫業登録申請書データ();

			return json({
				status: true,
				data: records,
			});
		} catch (e) {
			return json({
				status: false,
				error: (e as Error).message,
			});
		}
	}

	async getResultReport(): Promise<
		TypedResponse<ApiResponse<UC19_02_倉庫業実績報告書[]>>
	> {
		try {
			const records =
				await this.usecaseRepository.getUC19_02_倉庫業実績報告書データ();

			return json({
				status: true,
				data: records,
			});
		} catch (e) {
			return json({
				status: false,
				error: (e as Error).message,
			});
		}
	}
}
