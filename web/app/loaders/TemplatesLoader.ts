import type { LoaderFunctionArgs } from "@remix-run/node";
import type { TemplatesParams } from "~/models/templates";
import { ServiceFactory } from "~/services/serviceFactory";

const templateService = ServiceFactory.getTemplateService();

export async function templatesLoader({ request }: LoaderFunctionArgs) {
	const url = new URL(request.url);
	const params: Partial<TemplatesParams> = {};

	const keyword = url.searchParams.get("keyword") || "";
	if (keyword) params.keyword = keyword;
	const operatorType = url.searchParams.get("operatorType") || "";
	if (operatorType) params.operatorType = operatorType;

	return await templateService.getListTemplatesAndWorkflows(
		params as TemplatesParams,
	);
}

export async function templatesDetailLoader({ params }: LoaderFunctionArgs) {
	const { templateId } = params;

	return await templateService.getDetailTemplate(Number(templateId));
}

export async function workflowDetailLoader({ params }: LoaderFunctionArgs) {
	const { workflowId } = params;

	return await templateService.getDetailWorkflow(Number(workflowId));
}
