import type * as React from "react";
import Icon from "~/components/atoms/Icon";
import WrapContent from "~/components/molecules/Common/WrapContent";
import type { WorkflowT } from "~/models/templates";
import { routes } from "~/routes/routes";
import { theme } from "~/styles/theme";
import type { MODE_TEMPLATE } from "../types";
import WorkFlow from "./WorkFlow";

type TemplateProps = {
	modeTemplate: MODE_TEMPLATE;
	data?: WorkflowT;
};

const TemplateCreateEdit: React.FC<TemplateProps> = ({
	modeTemplate,
	data,
}) => {
	const breadcrumbItems = [
		{
			href: routes.template,
			title: (
				<>
					<Icon icon="dataset" size={24} color={theme.colors.semiBlack} />
					<span>テンプレート</span>
				</>
			),
		},
		{
			title: "新規作成（ワークフロー）",
		},
	];

	return (
		<WrapContent breadcrumbItems={breadcrumbItems}>
			<WorkFlow modeTemplate={modeTemplate} data={data} />
		</WrapContent>
	);
};

export default TemplateCreateEdit;
