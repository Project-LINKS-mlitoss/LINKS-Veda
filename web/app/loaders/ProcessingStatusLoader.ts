import type { LoaderFunctionArgs } from "@remix-run/node";
import type { ProcessingStatusParams } from "~/models/processingStatus";
import { ServiceFactory } from "~/services/serviceFactory";
import { getUserInfo } from "../../server/cookie.server.js";

export async function processingStatusLoader({ request }: LoaderFunctionArgs) {
	const url = new URL(request.url);
	const { uid } = await getUserInfo(request);

	const params: ProcessingStatusParams = {};

	const page =
		url.searchParams.get("page") ?? Number(url.searchParams.get("page"));
	const perPage =
		url.searchParams.get("perPage") ?? Number(url.searchParams.get("page"));
	const keyword = url.searchParams.get("keyword") || "";

	if (page) params.page = Number(page);
	if (perPage) params.perPage = Number(perPage);
	if (keyword) params.keyword = keyword;

	const processingStatusService = ServiceFactory.getProcessingStatusService();

	return await processingStatusService.getProcessingStatus(params, uid);
}
