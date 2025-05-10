import type { LoaderFunctionArgs } from "@remix-run/node";
import type { ItemParams } from "~/models/items";
import { ItemsRepository } from "~/repositories/itemsRepository";
import { ItemsService } from "~/services/itemsService";

const itemsRepository = new ItemsRepository();
const itemsService = new ItemsService(itemsRepository);

export async function itemsLoader({ request }: LoaderFunctionArgs) {
	const url = new URL(request.url);

	const params: Partial<ItemParams> = {};

	const page =
		url.searchParams.get("page") ?? Number(url.searchParams.get("page"));
	const perPage =
		url.searchParams.get("perPage") ?? Number(url.searchParams.get("page"));
	const sort = url.searchParams.get("sort");
	const dir = url.searchParams.get("dir");
	const ref = url.searchParams.get("ref");
	const asset = url.searchParams.get("asset");
	const query = url.searchParams.get("query");
	const confident = url.searchParams.get("confident");
	const modelId = url.searchParams.get("modelId");
	const useCase = url.searchParams.get("useCase");
	const ufn = url.searchParams.get("ufn");

	if (page) params.page = Number(page);
	if (perPage) params.perPage = Number(perPage);
	if (sort) params.sort = sort;
	if (dir) params.dir = dir;
	if (ref) params.ref = ref;
	if (asset) params.asset = asset;
	if (query) params.query = query;
	if (confident) params.confident = confident === "true";
	if (modelId) params.modelId = modelId;
	if (useCase) params.useCase = useCase;
	if (ufn) params.ufn = ufn;

	if (useCase === "14" && ufn === "1") {
		const startTime = url.searchParams.get("startTime");
		const finishTime = url.searchParams.get("finishTime");
		const seaArea = url.searchParams.get("seaArea");
		const windSpeed = url.searchParams.get("windSpeed");
		const waveHeight = url.searchParams.get("waveHeight");
		const visibility = url.searchParams.get("visibility");
		const windSpeedOP = url.searchParams.get("windSpeedOP");
		const waveHeightOP = url.searchParams.get("waveHeightOP");
		const visibilityOP = url.searchParams.get("visibilityOP");
		const shipTonnage = url.searchParams.get("shipTonnage");
		const shipQuality = url.searchParams.get("shipQuality");
		const shipUsage = url.searchParams.get("shipUsage");
		const shipCapacity = url.searchParams.get("shipCapacity");

		if (startTime) params.startTime = startTime;
		if (finishTime) params.finishTime = finishTime;
		if (seaArea) params.seaArea = seaArea;
		if (windSpeed) params.windSpeed = windSpeed;
		if (waveHeight) params.waveHeight = waveHeight;
		if (visibility) params.visibility = visibility;
		if (windSpeedOP) params.windSpeedOP = windSpeedOP;
		if (waveHeightOP) params.waveHeightOP = waveHeightOP;
		if (visibilityOP) params.visibilityOP = visibilityOP;
		if (shipTonnage) params.shipTonnage = shipTonnage;
		if (shipQuality) params.shipQuality = shipQuality;
		if (shipUsage) params.shipUsage = shipUsage;
		if (shipCapacity) params.shipCapacity = shipCapacity;
	}
	return await itemsService.listItems(params as ItemParams);
}

export async function itemDetailLoader({ params }: LoaderFunctionArgs) {
	const { itemId } = params;
	const result = await itemsService.getItemDetail(itemId as string);

	return result;
}
