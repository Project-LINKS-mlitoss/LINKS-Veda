import type { LoaderFunctionArgs } from "@remix-run/node";
import type { DatasetParams } from "~/models/dataset";
import { ServiceFactory } from "~/services/serviceFactory";

const datasetService = ServiceFactory.getDatasetService();

export async function datasetLoader({ request }: LoaderFunctionArgs) {
	const url = new URL(request.url);
	const params: Partial<DatasetParams> = {};

	const page =
		url.searchParams.get("page") ?? Number(url.searchParams.get("page"));
	const perPage =
		url.searchParams.get("perPage") ?? Number(url.searchParams.get("page"));
	const keyword = url.searchParams.get("keyword") || "";

	if (page) params.page = Number(page);
	if (perPage) params.perPage = Number(perPage);
	if (keyword) params.keyword = keyword;

	return await datasetService.getListDataset(params as DatasetParams);
}

export async function datasetDetailLoader({ params }: LoaderFunctionArgs) {
	const { datasetId } = params;

	return await datasetService.getDetailDataset(Number(datasetId));
}
