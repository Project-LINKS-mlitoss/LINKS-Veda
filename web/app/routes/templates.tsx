import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, useLoaderData } from "@remix-run/react";
import { deleteTemplateAction } from "~/actions/TemplateAction";
import jp from "~/commons/locales/jp";
import Templates from "~/components/pages/Templates";
import { templatesLoader } from "~/loaders/TemplatesLoader";
import {
	ACTION_TYPES_TEMPLATE,
	type TemplatesResponse,
	type WorkflowT,
} from "~/models/templates";
import type { ApiResponse } from "~/repositories/utils";

export const meta: MetaFunction = () => {
	return [{ title: "Templates" }, { name: "templates", content: "" }];
};

export { templatesLoader as loader };
export async function action({ request }: ActionFunctionArgs) {
	const formData = new URLSearchParams(await request.text());
	const intent = formData.get("_action");
	switch (intent) {
		case ACTION_TYPES_TEMPLATE.DELETE: {
			return deleteTemplateAction(formData);
		}
		default: {
			return json(
				{ status: false, error: jp.message.common.invalidActionType },
				{ status: 400 },
			);
		}
	}
}

export default function TemplatesPage() {
	const result = useLoaderData<{
		templates: ApiResponse<TemplatesResponse>;
		workflows: ApiResponse<WorkflowT[]>;
	}>();

	return (
		<Templates
			templates={result.templates.status ? result.templates.data : []}
			workflows={result.workflows.status ? result.workflows.data : []}
		/>
	);
}
