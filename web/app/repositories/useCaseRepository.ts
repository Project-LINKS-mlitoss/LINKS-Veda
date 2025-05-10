import { prisma } from "~/prisma";
import { BaseRepository } from "~/repositories/baseRepository";

export class UseCaseRepository extends BaseRepository<typeof prisma.useCase> {
	constructor() {
		super(prisma.useCase);
	}
}
