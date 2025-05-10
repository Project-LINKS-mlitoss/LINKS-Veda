import { prisma } from "~/prisma";
import { BaseRepository } from "~/repositories/baseRepository";

export class ContentAssetCreationLogRepository extends BaseRepository<
	typeof prisma.contentAssetCreationLog
> {
	constructor() {
		super(prisma.contentAssetCreationLog);
	}
}
