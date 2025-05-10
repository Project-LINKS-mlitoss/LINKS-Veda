import type * as React from "react";
import { useEffect, useRef, useState } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import {
	DEFAULT_SIZE_LEFT,
	DEFAULT_SIZE_RIGHT,
	MIN_WIDTHS,
	MIN_WIDTH_LEFT_CENTER_LARGE,
	MIN_WIDTH_RIGHT,
} from "~/commons/core.const";
import Icon from "~/components/atoms/Icon";
import WrapContent from "~/components/molecules/Common/WrapContent";
import {
	calculateMinWidths,
	togglePanelSize,
} from "~/components/molecules/Common/utils";
import TemplatePreview from "~/components/pages/Templates/TemplatePreview";
import TemplatesList from "~/components/pages/Templates/TemplatesList";
import {
	TemplateLayoutS,
	TemplateS,
} from "~/components/pages/Templates/styles";
import useElementWidth from "~/hooks/useElementWidth";
import type {
	TemplatesResponse,
	TemplatesT,
	WorkflowT,
} from "~/models/templates";
import { routes } from "~/routes/routes";
import { theme } from "~/styles/theme";

type TemplateProps = {
	templates: TemplatesResponse;
	workflows: WorkflowT[];
};

const Templates: React.FC<TemplateProps> = ({ templates, workflows }) => {
	const [tempChoose, setTempChoose] = useState<TemplatesT | WorkflowT>();

	// Resize col
	const maxSize = useElementWidth("wrap-content");
	const [minWidths, setMinWidths] = useState(MIN_WIDTHS);
	useEffect(() => {
		if (maxSize > 0) {
			setMinWidths(
				calculateMinWidths(
					maxSize,
					MIN_WIDTH_LEFT_CENTER_LARGE,
					MIN_WIDTH_RIGHT,
				),
			);
		}
	}, [maxSize]);
	// biome-ignore lint/suspicious/noExplicitAny: FIXME
	const rightRef = useRef<any>(null);
	const toggleRight = () =>
		togglePanelSize(rightRef, minWidths.minWidthRight, DEFAULT_SIZE_RIGHT);

	return (
		<TemplateS>
			<WrapContent
				breadcrumbItems={[
					{
						href: routes.template,
						title: (
							<>
								<Icon
									icon="templateBox"
									size={24}
									color={theme.colors.semiBlack}
								/>
								<span>テンプレート</span>
							</>
						),
					},
				]}
			>
				<TemplateLayoutS>
					<PanelGroup direction="horizontal">
						<Panel
							defaultSize={DEFAULT_SIZE_LEFT}
							minSize={minWidths.minWidthLeftCenter}
							className="left-item"
						>
							<TemplatesList
								templates={templates}
								workflows={workflows}
								setTempChoose={setTempChoose}
								tempChoose={tempChoose}
							/>
						</Panel>

						<PanelResizeHandle className="resize-handle" hidden={!tempChoose} />

						<Panel
							minSize={minWidths.minWidthRight}
							ref={rightRef}
							hidden={!tempChoose}
							className="center-item"
						>
							{tempChoose ? (
								<TemplatePreview
									tempChoose={tempChoose}
									onClickShrinkOutlined={toggleRight}
								/>
							) : null}
						</Panel>
					</PanelGroup>
				</TemplateLayoutS>
			</WrapContent>
		</TemplateS>
	);
};

export default Templates;
