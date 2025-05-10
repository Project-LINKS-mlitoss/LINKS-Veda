import { prisma } from "~/prisma";
import { BaseRepository } from "~/repositories/baseRepository";

export class WorkflowDetailExecutionRepository extends BaseRepository<
	typeof prisma.workflowDetailExecution
> {
	constructor() {
		super(prisma.workflowDetailExecution);
	}
}
