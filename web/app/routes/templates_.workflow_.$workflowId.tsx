import type { MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { saveWorkflow } from "~/actions/TemplateAction";
import TemplateCreateEdit from "~/components/pages/Templates/TemplateCreateEdit";
import { MODE_TEMPLATE } from "~/components/pages/Templates/types";
import { workflowDetailLoader } from "~/loaders/TemplatesLoader";
import type { WorkflowT } from "~/models/templates";
import type { ApiResponse } from "~/repositories/utils";

export const meta: MetaFunction = () => {
	return [{ title: "Templates edit" }, { name: "templates", content: "" }];
};

export { workflowDetailLoader as loader };

export { saveWorkflow as action };

export default function TemplateCreateEditPage() {
	const result = useLoaderData<ApiResponse<WorkflowT>>();

	if (result.status === false) {
		return <div>Error: {result.error}</div>;
	}

	return (
		<TemplateCreateEdit
			modeTemplate={MODE_TEMPLATE.EDITING}
			data={result.data}
		/>
	);
}
