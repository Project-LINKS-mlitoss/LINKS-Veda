import type { LoaderFunctionArgs } from "@remix-run/node";
import type { CONTENT_MANAGEMENT_PUBLISH } from "~/commons/core.const";
import { DefaultCurrent, DefaultPageSize } from "~/components/molecules/Common";
import { ServiceFactory } from "~/services/serviceFactory";
import { getUserInfo } from "../../server/cookie.server";

const contentService = ServiceFactory.getContentService();

export async function contentLoader({ request }: LoaderFunctionArgs) {
	const url = new URL(request.url);
	const { uid } = await getUserInfo(request);
	const { page, perPage, keyword, operatorTypes, workflows } =
		getQueryParams(url);

	return contentService.listContent(
		{ page, perPage, keyword, operatorTypes, workflows },
		uid,
	);
}

export async function contentDetailLoader({
	params,
	request,
}: LoaderFunctionArgs) {
	const { contentId } = params;
	const { uid } = await getUserInfo(request);

	return await contentService.getContentDetail(contentId as string, true, uid);
}

export async function contentVisualize({ request }: LoaderFunctionArgs) {
	const url = new URL(request.url);
	const { uid } = await getUserInfo(request);
	const { page, perPage, keyword } = getQueryParams(url);
	const statusVisualize = url.searchParams.get(
		"statusVisualize",
	) as CONTENT_MANAGEMENT_PUBLISH;

	if (keyword) {
		return contentService.listContent(
			{
				page: DefaultCurrent,
				perPage: 100,
				keyword,
				statusVisualize,
				maxRecord: true,
			},
			uid,
		);
	}

	return contentService.listContentVisualize(
		{ page, perPage, keyword, statusVisualize },
		uid,
	);
}

function getQueryParams(url: URL) {
	const keyword = url.searchParams.get("keyword") || "";
	const page =
		!Number(url.searchParams.get("page")) ||
		Number(url.searchParams.get("page")) < 0
			? DefaultCurrent
			: Number(url.searchParams.get("page"));
	const perPage =
		!Number(url.searchParams.get("perPage")) ||
		Number(url.searchParams.get("perPage")) < 0
			? DefaultPageSize
			: Number(url.searchParams.get("perPage"));

	const operatorTypes = url.searchParams.get("operatorTypes")?.split(",") || [];
	const workflows = url.searchParams.get("workflows")?.split(",") || [];

	return {
		keyword,
		page,
		perPage,
		operatorTypes,
		workflows,
	};
}
