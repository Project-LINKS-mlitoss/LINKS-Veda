import { ROLE } from "~/commons/core.const";
import { prisma } from "~/prisma";
import { BaseRepository } from "~/repositories/baseRepository";

export class AccountManagementRepository extends BaseRepository<
	typeof prisma.accountManagement
> {
	constructor() {
		super(prisma.accountManagement);
	}

	async isRoleAdmin(userId: string): Promise<boolean> {
		const user = await prisma.accountManagement.findFirst({
			where: { userId: userId },
			select: {
				id: true,
				role: true,
			},
		});

		return user !== null && user.role === ROLE.ADMIN;
	}
}
