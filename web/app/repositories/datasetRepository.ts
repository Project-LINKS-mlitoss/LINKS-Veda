import { Prisma } from "@prisma/client";
import jp from "~/commons/locales/jp";
import { logger } from "~/logger";
import type {
	DatasetParams,
	DatasetResponse,
	DatasetT,
} from "~/models/dataset";
import { prisma } from "~/prisma";
import { BaseRepository } from "~/repositories/baseRepository";
import { type ApiResponse, GENERAL_ERROR_MESSAGE } from "./utils";

export class DatasetRepository extends BaseRepository<typeof prisma.dataset> {
	constructor() {
		super(prisma.dataset);
	}

	async fetchDataset(
		params: DatasetParams,
	): Promise<ApiResponse<DatasetResponse>> {
		try {
			const { keyword, page = 1, perPage = 10 } = params;
			const skip = (page - 1) * perPage;

			// Get total count and matching IDs
			const matchingIds = await prisma.$queryRaw<{ id: number }[]>`
				SELECT DISTINCT d.id
				FROM datasets d
				${keyword ? Prisma.sql`WHERE ` : Prisma.empty}
				${
					keyword
						? Prisma.join(
								[
									Prisma.sql`LOWER(d.name) LIKE LOWER(${`%${keyword}%`})`,
									Prisma.sql`EXISTS (
						SELECT 1
						FROM JSON_TABLE(
							d.metaData,
							'$[*]' COLUMNS(value VARCHAR(255) PATH '$.value')
						) AS jt
						WHERE LOWER(jt.value) LIKE LOWER(${`%${keyword}%`})
					)`,
								],
								" OR ",
							)
						: Prisma.empty
				}
			`;

			const totalCount = matchingIds.length;

			// Get paginated data
			const datasetResponse = await prisma.dataset.findMany({
				where: {
					id: {
						in: matchingIds.map((id) => id.id),
					},
				},
				include: {
					useCase: true,
					datasetContentManagements: {
						where: {
							deletedAt: null,
						},
					},
				},
				orderBy: {
					createdAt: "desc",
				},
				skip,
				take: perPage,
			});

			if (!datasetResponse.length) {
				logger.error({ message: "No dataset found" });
			}

			return {
				status: true,
				data: {
					data: datasetResponse,
					totalCount,
				},
			};
		} catch (error) {
			logger.error({
				message: "Error fetching dataset",
				err: error,
			});
			return {
				status: false,
				error: GENERAL_ERROR_MESSAGE,
			};
		}
	}

	async getDetailDataset(
		datasetId: number,
	): Promise<ApiResponse<DatasetT | null>> {
		try {
			const datasetDetail = await prisma.dataset.findUnique({
				where: { id: datasetId },
				include: {
					useCase: true,
					datasetContentManagements: {
						where: {
							deletedAt: null,
						},
					},
				},
			});

			if (!datasetDetail) {
				logger.error({ message: `Dataset with ID ${datasetId} not found` });
				return {
					status: false,
					error: `Dataset with ID ${datasetId} not found`,
				};
			}

			return {
				status: true,
				data: datasetDetail,
			};
		} catch (error) {
			logger.error({
				message: "Error fetching dataset details",
				err: error,
			});
			return {
				status: false,
				error: GENERAL_ERROR_MESSAGE,
			};
		}
	}

	async deleteDataset(datasetId: number): Promise<ApiResponse<null>> {
		try {
			const existingDataset = await prisma.dataset.findUnique({
				where: { id: datasetId },
			});

			if (!existingDataset) {
				logger.warn({
					message: `Dataset with ID ${datasetId} not found`,
				});
				return {
					status: false,
					error: jp.message.dataset.datasetNotFound,
				};
			}

			await prisma.$transaction([
				prisma.datasetContentManagement.deleteMany({
					where: { datasetId: datasetId },
				}),
				prisma.dataset.delete({
					where: { id: datasetId },
				}),
			]);

			logger.info({
				message: `Dataset with ID ${datasetId} deleted successfully`,
			});
			return {
				status: true,
				data: null,
			};
		} catch (error) {
			logger.error({
				message: `Error deleting dataset with ID ${datasetId}`,
				err: error,
			});
			return {
				status: false,
				error: GENERAL_ERROR_MESSAGE,
			};
		}
	}
}
