import { prisma } from "~/prisma";
import { BaseRepository } from "~/repositories/baseRepository";

export class ContentManagementRepository extends BaseRepository<
	typeof prisma.contentManagements
> {
	constructor() {
		super(prisma.contentManagements);
	}
}
