import { prisma } from "~/prisma";
import { BaseRepository } from "~/repositories/baseRepository";

export class ContentVisualizesRepository extends BaseRepository<
	typeof prisma.contentVisualizes
> {
	constructor() {
		super(prisma.contentVisualizes);
	}
}
