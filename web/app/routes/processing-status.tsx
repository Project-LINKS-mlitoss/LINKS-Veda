import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { renameContentAction } from "~/actions/OperatorAction";
import ProcessingStatus from "~/components/pages/ProcessingStatus";
import { processingStatusLoader } from "~/loaders/ProcessingStatusLoader";
import type { ApiResponse } from "~/repositories/utils";

export const meta: MetaFunction = () => {
	return [
		{ title: "Processing Status" },
		{ name: "processingStatus", content: "" },
	];
};

export { processingStatusLoader as loader };
export async function action({ request }: ActionFunctionArgs) {
	const formData = new URLSearchParams(await request.text());
	return renameContentAction(formData);
}

export default function ProcessingStatusPage() {
	// biome-ignore lint/suspicious/noExplicitAny: FIXME
	const result = useLoaderData<ApiResponse<any>>();

	if (result.status === false) {
		return <div>Error: {result.error}</div>;
	}

	return <ProcessingStatus data={result.data} />;
}
