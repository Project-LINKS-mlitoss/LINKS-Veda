import type { ActionFunctionArgs } from "@remix-run/node";
import { json, useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";
import {
	generatePreProcessingAction,
	renameContentAction,
} from "~/actions/OperatorAction";
import { saveTemplatePreProcessing } from "~/actions/TemplateAction";
import {
	CONTENT_CALLBACK_API_STATUSES_NO_REFETCH,
	OPERATOR_FETCH_TIMEOUT,
} from "~/commons/core.const";
import jp from "~/commons/locales/jp";
import PreProcessing from "~/components/pages/Operators/PreProcessing";
import { useFetcherWithReset } from "~/hooks/useFetcherWithReset";
import { operatorPreProcessingDetailLoader } from "~/loaders/OperatorLoader";
import {
	ACTION_TYPES_OPERATOR,
	type PreprocessContentConfigs,
} from "~/models/operators";
import { OPERATOR_TYPE } from "~/models/templates";
import type { ApiResponse } from "~/repositories/utils";
import { routes } from "~/routes/routes";

export { operatorPreProcessingDetailLoader as loader };

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
			return generatePreProcessingAction({
				...actionFunctionArgs,
				request: newRequest,
			});
		}
		case ACTION_TYPES_OPERATOR.SAVE: {
			return saveTemplatePreProcessing({
				...actionFunctionArgs,
				request: newRequest,
			});
		}
		case ACTION_TYPES_OPERATOR.RENAME: {
			return renameContentAction(formData);
		}
		default: {
			return json(
				{ status: false, error: jp.message.common.invalidActionType },
				{ status: 400 },
			);
		}
	}
}

export default function PreProcessingDetail() {
	const fetcher = useFetcherWithReset<ApiResponse<PreprocessContentConfigs>>();
	const initialResult = useLoaderData<ApiResponse<PreprocessContentConfigs>>();
	const [result, setResult] =
		useState<ApiResponse<PreprocessContentConfigs> | null>(null);
	let timeoutId: string | number | NodeJS.Timeout | undefined;

	// biome-ignore lint/correctness/useExhaustiveDependencies: FIXME
	useEffect(() => {
		setResult(initialResult);
		fetcher.reset();
	}, [initialResult]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: FIXME
	useEffect(() => {
		if (
			!result?.status ||
			(result?.status &&
				result.data.id &&
				CONTENT_CALLBACK_API_STATUSES_NO_REFETCH.includes(result?.data?.status))
		) {
			fetcher.reset();
			clearTimeout(timeoutId);
			return;
		}

		timeoutId = setTimeout(() => {
			fetcher.load(
				`${routes.operator}/${result.data.id}?operatorType=${OPERATOR_TYPE.PRE_PROCESSING}`,
			);
		}, OPERATOR_FETCH_TIMEOUT);

		return () => clearTimeout(timeoutId);
	}, [result]);

	useEffect(() => {
		if (fetcher.data?.status) {
			setResult(fetcher.data);
		}
	}, [fetcher.data]);

	return (
		<PreProcessing
			initialData={initialResult?.status ? initialResult?.data : null}
			data={result?.status ? result?.data : null}
		/>
	);
}
