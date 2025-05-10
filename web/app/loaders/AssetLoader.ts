import type { LoaderFunctionArgs } from "@remix-run/node";
import { DefaultCurrent, DefaultPageSize } from "~/components/molecules/Common";
import { ServiceFactory } from "~/services/serviceFactory";
import { getUserInfo } from "../../server/cookie.server";

const assetService = ServiceFactory.getAssetService();
export async function assetLoader({ request }: LoaderFunctionArgs) {
	const url = new URL(request.url);
	const { uid } = await getUserInfo(request);
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
	const sort = url.searchParams.get("sort") || "createdAt";
	const dir = url.searchParams.get("dir") || "desc";
	const keyword = url.searchParams.get("keyword") || "";
	return await assetService.listAssets(
		{
			page,
			perPage,
			sort,
			dir,
			keyword,
		},
		uid,
	);
}

export async function assetDetailLoader({
	params,
	request,
}: LoaderFunctionArgs) {
	const { assetId } = params;
	const { uid } = await getUserInfo(request);

	return await assetService.getAssetDetail(assetId as string, uid);
}
