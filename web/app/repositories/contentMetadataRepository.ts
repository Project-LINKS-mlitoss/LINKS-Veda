import { prisma } from "~/prisma";
import { BaseRepository } from "~/repositories/baseRepository";

export class ContentMetadataRepository extends BaseRepository<
	typeof prisma.contentMetadata
> {
	constructor() {
		super(prisma.contentMetadata);
	}
}
