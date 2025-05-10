import { useFetcher, useNavigate } from "@remix-run/react";
import type * as React from "react";
import { useEffect, useRef, useState } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import type { SelectRowIdT } from "~/commons/core.const";
import {
	CONTENT_FIELD_TYPE,
	DEFAULT_SIZE_CENTER_THIRD,
	DEFAULT_SIZE_LEFT_THIRD,
	DEFAULT_SIZE_RIGHT_THIRD,
	DEFAULT_SIZE_TOTAL,
	MIN_WIDTHS,
	MIN_WIDTH_LEFT_CENTER,
	MIN_WIDTH_RIGHT,
} from "~/commons/core.const";
import jp from "~/commons/locales/jp";
import Icon from "~/components/atoms/Icon";
import WrapContent from "~/components/molecules/Common/WrapContent";
import { calculateMinWidths } from "~/components/molecules/Common/utils";
import ContentTable from "~/components/pages/Content/ContentTable";
import { Management } from "~/components/pages/Content/Management";
import { ContentLayoutS, ContentS } from "~/components/pages/Content/styles";
import type { DataTableContentType } from "~/components/pages/Content/types";
import ViewerContainer from "~/components/pages/Operators/ViewerContent/ViewerContainer";
import useElementWidth from "~/hooks/useElementWidth";
import type { ContentResponse } from "~/models/content";
import { routes } from "~/routes/routes";
import { theme } from "~/styles/theme";

type ContentProps = {
	data: ContentResponse;
};

const ContentsPage: React.FC<ContentProps> = ({ data }) => {
	const navigate = useNavigate();

	const [initData, setInitData] = useState<ContentResponse>(data);
	const [contentItems, setContentItems] = useState<DataTableContentType[]>([]);
	const isPreview = contentItems.length === 1;
	const isGeoJson = contentItems.length
		? contentItems[0]?.schema?.fields?.some(
				(field) => field?.type === CONTENT_FIELD_TYPE.GEO,
			)
		: false;
	const [isCollapsedGISViewer, setCollapsedGISViewer] = useState(false);
	const [selectedRowId, setSelectedRowId] = useState<SelectRowIdT | null>(null);
	useEffect(() => {
		setInitData(data);
	}, [data]);

	useEffect(() => {
		if (!isPreview) {
			setSelectedRowId(null);
		}
	}, [isPreview]);

	// Resize col
	const maxSize = useElementWidth("wrap-content");
	const [minWidths, setMinWidths] = useState(MIN_WIDTHS);
	useEffect(() => {
		if (maxSize > 0) {
			setMinWidths(
				calculateMinWidths(maxSize, MIN_WIDTH_LEFT_CENTER, MIN_WIDTH_RIGHT),
			);
		}
	}, [maxSize]);
	// biome-ignore lint/suspicious/noExplicitAny: FIXME
	const leftRef = useRef<any>(null);
	// biome-ignore lint/suspicious/noExplicitAny: FIXME
	const centerRef = useRef<any>(null);
	// biome-ignore lint/suspicious/noExplicitAny: FIXME
	const rightRef = useRef<any>(null);
	useEffect(() => {
		const leftPanel = leftRef.current;
		const centerPanel = centerRef.current;
		const rightPanel = rightRef.current;
		if (leftPanel && centerPanel && rightPanel) {
			if (isPreview) {
				leftPanel.resize(DEFAULT_SIZE_LEFT_THIRD);
				centerPanel.resize(DEFAULT_SIZE_CENTER_THIRD);
				rightPanel.resize(DEFAULT_SIZE_RIGHT_THIRD);
			} else {
				leftPanel.resize(DEFAULT_SIZE_TOTAL);
				centerPanel.resize(0);
				rightPanel.resize(0);
			}
		}
	}, [isPreview]);

	return (
		<ContentS>
			<WrapContent
				breadcrumbItems={[
					{
						href: routes.content,
						title: (
							<>
								<Icon icon="schema" size={24} color={theme.colors.semiBlack} />
								<span>{jp.common.content}</span>
							</>
						),
					},
				]}
			>
				<ContentLayoutS
					isPreview={isPreview}
					isDetail={false}
					isCollapsedGISViewer={isCollapsedGISViewer}
				>
					<PanelGroup direction="horizontal">
						<Panel
							defaultSize={50}
							minSize={minWidths.minWidthLeftCenter}
							ref={leftRef}
							className="left-item"
						>
							<ContentTable
								data={initData}
								contentItems={contentItems}
								setContentItems={setContentItems}
							/>
						</Panel>

						<PanelResizeHandle className="resize-handle" hidden={!isPreview} />

						<Panel
							defaultSize={30}
							minSize={isPreview ? minWidths.minWidthLeftCenter : 0}
							ref={centerRef}
							hidden={!isPreview}
							className="center-item"
						>
							{!isPreview ? null : (
								<>
									<ViewerContainer
										wrapperClassName="h-100"
										gisMapClassName="h-40 gis-viewer b-bottom"
										tableClassName={`content-viewer ${
											isGeoJson ? "h-60" : "h-100"
										}`}
										item={contentItems[0]}
										hasGeoData={Boolean(isGeoJson && contentItems[0]?.schema)}
										onGISCollapse={() =>
											setCollapsedGISViewer(!isCollapsedGISViewer)
										}
										onNavigateDetail={() => navigate(`${contentItems[0].id}`)}
										selectedRowId={selectedRowId}
										onSelectRow={setSelectedRowId}
									/>
								</>
							)}
						</Panel>

						<PanelResizeHandle className="resize-handle" hidden={!isPreview} />

						<Panel
							defaultSize={20}
							minSize={isPreview ? minWidths.minWidthRight : 0}
							ref={rightRef}
							hidden={!isPreview}
							className="right-item"
						>
							<Management
								isPreview={isPreview}
								contentDetail={contentItems[0]}
								setContentItems={setContentItems}
								setInitData={setInitData}
							/>
						</Panel>
					</PanelGroup>
				</ContentLayoutS>
			</WrapContent>
		</ContentS>
	);
};

export default ContentsPage;
