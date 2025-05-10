import type { LoaderFunctionArgs } from "@remix-run/node";
import { ServiceFactory } from "~/services/serviceFactory";
import { getUserInfo } from "../../server/cookie.server";

const userService = ServiceFactory.getUserService();

export async function accountLoader({ request }: LoaderFunctionArgs) {
	const url = new URL(request.url);
	const perPage =
		!Number(url.searchParams.get("perPage")) ||
		Number(url.searchParams.get("perPage")) < 0
			? 1000
			: Number(url.searchParams.get("perPage"));
	const keyword = url.searchParams.get("keyword")?.toLowerCase() || "";

	const data = await userService.listUser({ perPage, keyword });
	const { uid } = await getUserInfo(request);
	const user = await userService.getUserPermission(uid);

	return { status: true, data: { items: { users: data } }, currentUser: user };
}
