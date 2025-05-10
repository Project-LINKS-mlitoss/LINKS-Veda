import type { LoaderFunctionArgs } from "@remix-run/node";
import { ServiceFactory } from "~/services/serviceFactory";

const operatorService = ServiceFactory.getOperatorService();

export async function operatorDetailLoader({ params }: LoaderFunctionArgs) {
	const { operatorId } = params;
	return await operatorService.getOperatorDetail(Number(operatorId ?? 0));
}

export async function operatorPreProcessingDetailLoader({
	params,
}: LoaderFunctionArgs) {
	const { operatorId } = params;
	return await operatorService.getOperatorProPressingDetail(
		Number(operatorId ?? 0),
	);
}

export async function operatorTextMatchingDetailLoader({
	params,
}: LoaderFunctionArgs) {
	const { operatorId } = params;
	return await operatorService.getOperatorTextMatchingDetail(
		Number(operatorId ?? 0),
	);
}

export async function operatorCrossTabDetailLoader({
	params,
}: LoaderFunctionArgs) {
	const { operatorId } = params;
	return await operatorService.getOperatorCrossTabDetail(
		Number(operatorId ?? 0),
	);
}

export async function operatorSpatialJoinDetailLoader({
	params,
}: LoaderFunctionArgs) {
	const { operatorId } = params;
	return await operatorService.getOperatorSpatialJoinDetail(
		Number(operatorId ?? 0),
	);
}

export async function operatorSpatialAggregationDetailLoader({
	params,
}: LoaderFunctionArgs) {
	const { operatorId } = params;
	return await operatorService.getOperatorSpatialAggregateDetail(
		Number(operatorId ?? 0),
	);
}
