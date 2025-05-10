import {
	type ActionFunctionArgs,
	type MetaFunction,
	json,
} from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getUserInfo } from "server/cookie.server";
import { deleteDatasetAction, publishDataset } from "~/actions/DatasetAction";
import jp from "~/commons/locales/jp";
import Dataset from "~/components/pages/Dataset";
import { datasetLoader } from "~/loaders/DatasetLoader";
import { ACTION_TYPES_DATASET, type DatasetResponse } from "~/models/dataset";
import type { ApiResponse } from "~/repositories/utils";

export const meta: MetaFunction = () => {
	return [{ title: "Dataset" }, { name: "dataset", content: "" }];
};

export { datasetLoader as loader };

export async function action({ request }: ActionFunctionArgs) {
	const formData = new URLSearchParams(await request.text());
	const intent = formData.get("actionType");
	const { uid, username } = await getUserInfo(request);
	formData.append("uid", uid);
	formData.append("username", username);
	switch (intent) {
		case ACTION_TYPES_DATASET.DELETE: {
			return deleteDatasetAction(formData);
		}
		case ACTION_TYPES_DATASET.SAVE: {
			return publishDataset(formData);
		}
		default: {
			return json(
				{ status: false, error: jp.message.common.invalidActionType },
				{ status: 400 },
			);
		}
	}
}

export default function DatasetPage() {
	const result = useLoaderData<ApiResponse<DatasetResponse>>();
	if (result.status === false) {
		return <div>Error: {result.error}</div>;
	}

	return <Dataset data={result.data} />;
}
