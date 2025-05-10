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
import ProcessingTable from "~/components/pages/ProcessingStatus/ProcessingTable";
import RightComponent from "~/components/pages/ProcessingStatus/RightComponent";
import {
	ProcessingStatusS,
	ProcessingStatusViewerS,
} from "~/components/pages/ProcessingStatus/styles";
import useElementWidth from "~/hooks/useElementWidth";
import type {
	DataTableProcessingStatusType,
	DataTableProcessingStatusTypeArray,
} from "~/models/processingStatus";
import { routes } from "~/routes/routes";
import { theme } from "~/styles/theme";

type ProcessingStatusProps = {
	data: DataTableProcessingStatusTypeArray;
};

const ProcessingStatus: React.FC<ProcessingStatusProps> = ({ data }) => {
	const [items, setItems] = useState<DataTableProcessingStatusType[]>([]);
	const isPreview = items.length === 1;

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
		<ProcessingStatusS>
			<WrapContent
				breadcrumbItems={[
					{
						href: routes.processingStatus,
						title: (
							<>
								<Icon
									icon="processingStatusList"
									size={24}
									color={theme.colors.semiBlack}
								/>
								<span>処理状況一覧</span>
							</>
						),
					},
				]}
			>
				<ProcessingStatusViewerS>
					<PanelGroup direction="horizontal">
						<Panel
							defaultSize={DEFAULT_SIZE_LEFT}
							minSize={minWidths.minWidthLeftCenter}
							className="left-item"
						>
							<ProcessingTable data={data} items={items} setItems={setItems} />
						</Panel>

						<PanelResizeHandle className="resize-handle" hidden={!isPreview} />

						<Panel
							minSize={minWidths.minWidthRight}
							ref={rightRef}
							hidden={!isPreview}
							className="center-item"
						>
							{isPreview ? (
								<RightComponent
									item={items[0]}
									isPreview={isPreview}
									onClickShrinkOutlined={toggleRight}
								/>
							) : null}
						</Panel>
					</PanelGroup>
				</ProcessingStatusViewerS>
			</WrapContent>
		</ProcessingStatusS>
	);
};

export default ProcessingStatus;
