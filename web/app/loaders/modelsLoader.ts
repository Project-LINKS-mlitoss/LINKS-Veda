import type { LoaderFunctionArgs } from "@remix-run/node";
import type { ModelParams } from "~/models/models";
import { ModelsRepository } from "~/repositories/modelsRepository";
import { ModelsService } from "~/services/modelsService";

const modelsRepository = new ModelsRepository();
const modelsService = new ModelsService(modelsRepository);

export async function modelsLoader({ request }: LoaderFunctionArgs) {
	const url = new URL(request.url);

	const params: Partial<ModelParams> = {};

	const page =
		url.searchParams.get("page") ?? Number(url.searchParams.get("page"));
	const perPage =
		url.searchParams.get("perPage") ?? Number(url.searchParams.get("page"));
	const sort = url.searchParams.get("sort");
	const keyword = url.searchParams.get("keyword");

	if (page) params.page = Number(page);
	if (perPage) params.perPage = Number(perPage);
	if (sort) params.sort = sort;
	if (keyword) params.keyword = keyword;

	return await modelsService.listModel(params as ModelParams);
}

export async function modelDetailLoader({ params }: LoaderFunctionArgs) {
	const { modelId } = params;
	const result = await modelsService.getModelDetail(modelId as string);

	return result;
}
