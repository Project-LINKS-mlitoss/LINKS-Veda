import type * as React from "react";
import jp from "~/commons/locales/jp";
import Icon from "~/components/atoms/Icon";
import WrapViewer from "~/components/molecules/Common/WrapViewer";
import { TemplateS } from "../styles";

interface TemplateProps {
	isPreview: boolean;
}

const Template: React.FC<TemplateProps> = ({ isPreview }) => {
	return (
		<WrapViewer
			title={jp.common.template}
			icon={<Icon icon="templateBox" size={16} />}
		>
			<TemplateS>{isPreview && "The feature is under development."}</TemplateS>
		</WrapViewer>
	);
};

export default Template;
