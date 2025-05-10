import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, useLoaderData } from "@remix-run/react";
import { getUserInfo } from "server/cookie.server";
import { saveDataset, uploadAction } from "~/actions/DatasetAction";
import jp from "~/commons/locales/jp";
import DatasetCreateEdit from "~/components/pages/Dataset/DatasetCreateEdit";
import { MODE_DATASET_COMPONENT } from "~/components/pages/Dataset/types";
import { datasetDetailLoader } from "~/loaders/DatasetLoader";
import { ACTION_TYPES_DATASET, type DatasetT } from "~/models/dataset";
import type { ApiResponse } from "~/repositories/utils";

export const meta: MetaFunction = () => {
	return [{ title: "Dataset edit" }, { name: "dataset", content: "" }];
};

export { datasetDetailLoader as loader };

export async function action(actionFunctionArgs: ActionFunctionArgs) {
	const { request } = actionFunctionArgs;
	const requestBody = await request.text();
	const formData = new URLSearchParams(requestBody);
	const { uid, username } = await getUserInfo(request);
	formData.append("uid", uid);
	formData.append("username", username);
	const actionType = formData.get("actionType");

	const newRequest = new Request(request.url, {
		method: request.method,
		headers: request.headers,
		body: formData.toString(),
	});

	switch (actionType) {
		case ACTION_TYPES_DATASET.UPLOADFILE: {
			return uploadAction(formData);
		}
		case ACTION_TYPES_DATASET.SAVE: {
			return saveDataset({
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

export default function DatasetCreateEditPage() {
	const result = useLoaderData<ApiResponse<DatasetT>>();

	if (result.status === false) {
		return <div>Error: {result.error}</div>;
	}

	return (
		<DatasetCreateEdit
			mode={MODE_DATASET_COMPONENT.CREATE_EDIT}
			data={result.data}
		/>
	);
}
