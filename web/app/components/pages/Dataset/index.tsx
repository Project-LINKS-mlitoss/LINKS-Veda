import type * as React from "react";
import { useEffect, useRef, useState } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import Icon from "~/components/atoms/Icon";
import WrapContent from "~/components/molecules/Common/WrapContent";
import { DatasetLayoutS, DatasetS } from "~/components/pages/Dataset/styles";

import {
	DEFAULT_SIZE_LEFT,
	DEFAULT_SIZE_RIGHT,
	MIN_WIDTHS,
	MIN_WIDTH_LEFT_CENTER_LARGE,
	MIN_WIDTH_RIGHT,
} from "~/commons/core.const";
import {
	calculateMinWidths,
	togglePanelSize,
} from "~/components/molecules/Common/utils";
import useElementWidth from "~/hooks/useElementWidth";
import type { DatasetResponse, DatasetT } from "~/models/dataset";
import { routes } from "~/routes/routes";
import { theme } from "~/styles/theme";
import DatasetList from "./DatasetList";
import DatasetPreview from "./DatasetPreview";

type DatasetProps = {
	data: DatasetResponse;
};

const Dataset: React.FC<DatasetProps> = ({ data }) => {
	const [datasetChoose, setDatasetChoose] = useState<DatasetT>();

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
		<DatasetS>
			<WrapContent
				breadcrumbItems={[
					{
						href: routes.dataset,
						title: (
							<>
								<Icon icon="dataset" size={24} color={theme.colors.semiBlack} />
								<span>データセット</span>
							</>
						),
					},
				]}
			>
				<DatasetLayoutS>
					<PanelGroup direction="horizontal">
						<Panel
							defaultSize={DEFAULT_SIZE_LEFT}
							minSize={minWidths.minWidthLeftCenter}
							className="left-item"
						>
							<DatasetList
								data={data}
								setDatasetChoose={setDatasetChoose}
								datasetChoose={datasetChoose}
							/>
						</Panel>

						<PanelResizeHandle
							className="resize-handle"
							hidden={!datasetChoose}
						/>

						<Panel
							minSize={minWidths.minWidthRight}
							ref={rightRef}
							hidden={!datasetChoose}
							className="center-item"
						>
							<DatasetPreview
								key={datasetChoose?.id}
								datasetChoose={datasetChoose}
								onClickShrinkOutlined={toggleRight}
							/>
						</Panel>
					</PanelGroup>
				</DatasetLayoutS>
			</WrapContent>
		</DatasetS>
	);
};

export default Dataset;
