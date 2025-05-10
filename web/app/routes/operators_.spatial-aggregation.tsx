import { type ActionFunctionArgs, json } from "@remix-run/node";
import {
	generateSpatialAggregationAction,
	startWorkflowAction,
} from "~/actions/OperatorAction";
import { saveTemplateSpatialAggregation } from "~/actions/TemplateAction";
import jp from "~/commons/locales/jp";
import SpatialAggregation from "~/components/pages/Operators/SpatialAggregation";
import { ACTION_TYPES_OPERATOR } from "~/models/operators";

export async function action(actionFunctionArgs: ActionFunctionArgs) {
	const { request } = actionFunctionArgs;
	const requestBody = await request.text();
	const formData = new URLSearchParams(requestBody);
	const actionType = formData.get("actionType");

	const newRequest = new Request(request.url, {
		method: request.method,
		headers: request.headers,
		body: requestBody,
	});

	switch (actionType) {
		case ACTION_TYPES_OPERATOR.GENERATE: {
			return generateSpatialAggregationAction({
				...actionFunctionArgs,
				request: newRequest,
			});
		}
		case ACTION_TYPES_OPERATOR.SAVE: {
			return saveTemplateSpatialAggregation({
				...actionFunctionArgs,
				request: newRequest,
			});
		}
		case ACTION_TYPES_OPERATOR.START_WORKFLOW: {
			return startWorkflowAction({
				...actionFunctionArgs,
				request: newRequest,
			});
		}
		default: {
			return json(
				{ status: false, error: jp.message.common.invalidActionType },
				{ status: 400 },
			);
		}
	}
}

export default function OperatorsSpatialAggregation() {
	return <SpatialAggregation />;
}
