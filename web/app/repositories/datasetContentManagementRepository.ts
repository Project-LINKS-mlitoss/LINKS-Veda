import { prisma } from "~/prisma";
import { BaseRepository } from "~/repositories/baseRepository";

export class DatasetContentManagementRepository extends BaseRepository<
	typeof prisma.datasetContentManagement
> {
	constructor() {
		super(prisma.datasetContentManagement);
	}
}
