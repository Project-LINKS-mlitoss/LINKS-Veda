import type { MetaFunction } from "@remix-run/node";
import { saveWorkflow } from "~/actions/TemplateAction";
import TemplateCreateEdit from "~/components/pages/Templates/TemplateCreateEdit";
import { MODE_TEMPLATE } from "~/components/pages/Templates/types";

export const meta: MetaFunction = () => {
	return [{ title: "Templates create" }, { name: "templates", content: "" }];
};

export { saveWorkflow as action };

export default function TemplateCreateEditPage() {
	return <TemplateCreateEdit modeTemplate={MODE_TEMPLATE.CREATE} />;
}
