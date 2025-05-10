import type {
	ResourcePermissionConditions,
	ResourcePermissionI,
} from "~/models/resourcePermissionModel";
import { prisma } from "~/prisma";
import { BaseRepository } from "~/repositories/baseRepository";
import { getNow } from "~/utils/date";

export class ResourcePermissionRepository extends BaseRepository<
	typeof prisma.resourcePermissions
> {
	constructor() {
		super(prisma.resourcePermissions);
	}
	public async create(data: ResourcePermissionI) {
		return prisma.resourcePermissions.create({ data });
	}

	public async createMany(data: ResourcePermissionI[]) {
		return prisma.resourcePermissions.createMany({ data });
	}

	public async update(id: number, data: ResourcePermissionI) {
		return prisma.resourcePermissions.update({
			where: { id: id },
			data: data,
		});
	}

	public async delete(id: number) {
		return prisma.resourcePermissions.update({
			where: { id: id },
			data: {
				deletedAt: getNow(),
				updatedAt: getNow(),
			},
		});
	}

	public async deleteByConditions(conditions: ResourcePermissionConditions) {
		return prisma.resourcePermissions.updateMany({
			where: conditions,
			data: {
				deletedAt: getNow(),
				updatedAt: getNow(),
			},
		});
	}
}
