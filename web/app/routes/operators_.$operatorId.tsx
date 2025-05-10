import { json } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";
import jp from "~/commons/locales/jp";
import {
	operatorCrossTabDetailLoader,
	operatorDetailLoader,
	operatorPreProcessingDetailLoader,
	operatorSpatialAggregationDetailLoader,
	operatorSpatialJoinDetailLoader,
	operatorTextMatchingDetailLoader,
} from "~/loaders/OperatorLoader";
import { OPERATOR_TYPE } from "~/models/templates";

export async function loader({ request, params, context }: LoaderFunctionArgs) {
	const url = new URL(request.url);
	const type = url.searchParams.get("operatorType");
	const { operatorId } = params;

	if (!type || !operatorId) {
		return json(
			{ status: false, error: jp.message.operator.typeAndOperatorIdRequired },
			{ status: 400 },
		);
	}

	try {
		// biome-ignore lint/suspicious/noExplicitAny: FIXME
		let data: any;
		switch (type) {
			case OPERATOR_TYPE.DATA_STRUCTURE:
				data = await operatorDetailLoader({
					request,
					params: { operatorId },
					context,
				});
				break;
			case OPERATOR_TYPE.PRE_PROCESSING:
				data = await operatorPreProcessingDetailLoader({
					request,
					params: { operatorId },
					context,
				});
				break;
			case OPERATOR_TYPE.TEXT_MATCHING:
				data = await operatorTextMatchingDetailLoader({
					request,
					params: { operatorId },
					context,
				});
				break;
			case OPERATOR_TYPE.CROSS_TAB:
				data = await operatorCrossTabDetailLoader({
					request,
					params: { operatorId },
					context,
				});
				break;
			case OPERATOR_TYPE.SPATIAL_JOIN:
				data = await operatorSpatialJoinDetailLoader({
					request,
					params: { operatorId },
					context,
				});
				break;
			case OPERATOR_TYPE.SPATIAL_AGGREGATE:
				data = await operatorSpatialAggregationDetailLoader({
					request,
					params: { operatorId },
					context,
				});
				break;
			default:
				return json(
					{ status: false, error: jp.message.operator.invalidType },
					{ status: 400 },
				);
		}

		return data;
	} catch (error) {
		console.error("Error:", error);
		return json(
			{ status: false, error: jp.message.common.internalServerError },
			{ status: 500 },
		);
	}
}
