import { type Prisma, PrismaClient } from "@prisma/client";
import { getNow } from "~/utils/date";

const prisma = new PrismaClient();

export interface SearchParams {
	page: number;
	perPage: number;
}

export class BaseRepository<T> {
	private model: T;

	constructor(model: T) {
		this.model = model;
	}

	public async find(
		// biome-ignore lint/suspicious/noExplicitAny: FIXME
		conditions: any,
		// biome-ignore lint/suspicious/noExplicitAny: FIXME
		select?: Prisma.SelectSubset<any, any>,
		// biome-ignore lint/suspicious/noExplicitAny: FIXME
		include?: any,
	) {
		// biome-ignore lint/suspicious/noExplicitAny: FIXME
		return (this.model as any).findMany({
			where: conditions,
			select: select ?? undefined,
			include: include ?? undefined,
		});
	}

	public async findFirst(
		// biome-ignore lint/suspicious/noExplicitAny: FIXME
		conditions: any,
		// biome-ignore lint/suspicious/noExplicitAny: FIXME
		select?: Prisma.SelectSubset<any, any>,
	) {
		// biome-ignore lint/suspicious/noExplicitAny: FIXME
		return (this.model as any).findFirst({
			where: conditions,
			select: select ?? undefined,
		});
	}

	public async create(
		// biome-ignore lint/suspicious/noExplicitAny: FIXME
		data: any,
	) {
		// biome-ignore lint/suspicious/noExplicitAny: FIXME
		return (this.model as any).create({ data });
	}

	public async createMany(
		// biome-ignore lint/suspicious/noExplicitAny: FIXME
		data: any[],
	) {
		return (
			// biome-ignore lint/suspicious/noExplicitAny: FIXME
			(this.model as any).createMany({ data })
		);
	}

	public async update(
		id: number,
		// biome-ignore lint/suspicious/noExplicitAny: FIXME
		data: any,
	) {
		return (
			// biome-ignore lint/suspicious/noExplicitAny: FIXME
			(this.model as any).update({
				where: { id },
				data,
			})
		);
	}

	public async updateByConditions(
		// biome-ignore lint/suspicious/noExplicitAny: FIXME
		conditions: any,
		// biome-ignore lint/suspicious/noExplicitAny: FIXME
		data: any,
	) {
		return (
			// biome-ignore lint/suspicious/noExplicitAny: FIXME
			(this.model as any).updateMany({
				where: conditions,
				data,
			})
		);
	}

	public async delete(id: number) {
		return (
			// biome-ignore lint/suspicious/noExplicitAny: FIXME
			(this.model as any).update({
				where: { id },
				data: {
					deletedAt: getNow(),
					updatedAt: getNow(),
				},
			})
		);
	}

	public async deleteByConditions(
		// biome-ignore lint/suspicious/noExplicitAny: FIXME
		conditions: any,
		isSoftDelete = true,
	) {
		if (isSoftDelete) {
			// biome-ignore lint/suspicious/noExplicitAny: FIXME
			return (this.model as any).updateMany({
				where: conditions,
				data: {
					deletedAt: getNow(),
					updatedAt: getNow(),
				},
			});
		}

		// biome-ignore lint/suspicious/noExplicitAny: FIXME
		return (this.model as any).deleteMany({
			where: conditions,
		});
	}

	public async upsert(
		// biome-ignore lint/suspicious/noExplicitAny: FIXME
		data: any,
		uniqueField: string,
	) {
		return (
			// biome-ignore lint/suspicious/noExplicitAny: FIXME
			(this.model as any).upsert({
				where: { [uniqueField]: data[uniqueField] },
				update: data,
				create: data,
			})
		);
	}

	public async upsertNonUnique(
		// biome-ignore lint/suspicious/noExplicitAny: FIXME
		data: any,
		field: string,
	) {
		// biome-ignore lint/suspicious/noExplicitAny: FIXME
		const existingRecord = await (this.model as any).findFirst({
			where: { [field]: data[field] },
		});

		if (existingRecord) {
			return (
				// biome-ignore lint/suspicious/noExplicitAny: FIXME
				(this.model as any).update({
					where: { id: existingRecord.id },
					data,
				})
			);
		}

		return (
			// biome-ignore lint/suspicious/noExplicitAny: FIXME
			(this.model as any).create({ data })
		);
	}

	public async paginate(
		select: { [key: string]: boolean } | null | undefined,
		params: SearchParams,
		// biome-ignore lint/suspicious/noExplicitAny: FIXME
		conditions: any = {},
		// biome-ignore lint/suspicious/noExplicitAny: FIXME
		order: any = { createdAt: "desc" },
	) {
		try {
			const { page, perPage } = params;

			const pagination = {
				skip: (page - 1) * perPage,
				take: perPage,
			};

			const [models, totalCount] = await Promise.all([
				// biome-ignore lint/suspicious/noExplicitAny: FIXME
				(this.model as any).findMany({
					...(select ? { select } : {}),
					where: conditions,
					...pagination,
					orderBy: order,
				}),
				// biome-ignore lint/suspicious/noExplicitAny: FIXME
				(this.model as any).count({ where: conditions }),
			]);

			// biome-ignore lint/suspicious/noExplicitAny: FIXME
			const data = models.map((model: any) => ({
				...model,
				createdAt: model.createdAt ? String(model.createdAt) : undefined,
				updatedAt: model.updatedAt ? String(model.updatedAt) : undefined,
				deletedAt: model.deletedAt ? String(model.deletedAt) : undefined,
			}));

			return {
				status: true,
				data: {
					models: data,
					page,
					perPage,
					totalCount,
				},
			};
		} catch (e) {
			return {
				status: false,
				error: e,
			};
		}
	}
}
