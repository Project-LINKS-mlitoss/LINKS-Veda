import { useFetcher, useNavigate, useParams } from "@remix-run/react";
import type * as React from "react";
import { useEffect, useRef, useState } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import {
	CONTENT_FIELD_TYPE,
	DEFAULT_SIZE_CENTER_THIRD,
	DEFAULT_SIZE_LEFT_THIRD,
	DEFAULT_SIZE_RIGHT_THIRD,
	MIN_WIDTHS,
	MIN_WIDTH_LEFT_CENTER,
	MIN_WIDTH_RIGHT,
} from "~/commons/core.const";
import type { SelectRowIdT } from "~/commons/core.const";
import jp from "~/commons/locales/jp";
import Icon from "~/components/atoms/Icon";
import Spin from "~/components/atoms/Spin";
import WrapContent from "~/components/molecules/Common/WrapContent";
import { calculateMinWidths } from "~/components/molecules/Common/utils";
import { Management } from "~/components/pages/Content/Management";
import { ContentLayoutS, ContentS } from "~/components/pages/Content/styles";
import type { DataTableContentType } from "~/components/pages/Content/types";
import ViewerContainer from "~/components/pages/Operators/ViewerContent/ViewerContainer";
import useElementWidth from "~/hooks/useElementWidth";
import type { ContentItem } from "~/models/content";
import type { ApiResponse } from "~/repositories/utils";
import { routes } from "~/routes/routes";
import { theme } from "~/styles/theme";

type ContentProps = {
	data: ContentItem;
};

const ContentDetailPage: React.FC<ContentProps> = ({ data }) => {
	const navigate = useNavigate();
	const { contentId } = useParams();
	const fetchContentsDetail = useFetcher<ApiResponse<ContentItem>>();
	const [contentItems, setContentItems] = useState<DataTableContentType[]>([]);
	const isShow = contentItems.length === 1;
	const isGeoJson = contentItems.length
		? contentItems[0]?.schema?.fields?.some(
				(field) => field?.type === CONTENT_FIELD_TYPE.GEO,
			)
		: false;
	const [selectedRowId, setSelectedRowId] = useState<SelectRowIdT | null>(null);

	// biome-ignore lint/correctness/useExhaustiveDependencies: FIXME
	useEffect(() => {
		if (contentId) {
			fetchContentsDetail.load(`${routes.content}/${contentId}`);
		}
	}, [contentId]);

	useEffect(() => {
		if (fetchContentsDetail?.data?.status) {
			const contentDetail = fetchContentsDetail?.data?.data;
			setContentItems([contentDetail]);
		}
	}, [fetchContentsDetail]);

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
	const rightRef = useRef<any>(null);
	useEffect(() => {
		const leftPanel = leftRef.current;
		const rightPanel = rightRef.current;
		if (leftPanel && rightPanel) {
			leftPanel.resize(DEFAULT_SIZE_LEFT_THIRD + DEFAULT_SIZE_CENTER_THIRD);
			rightPanel.resize(DEFAULT_SIZE_RIGHT_THIRD);
		}
	}, []);

	return (
		<ContentS>
			<WrapContent
				breadcrumbItems={[
					{
						href: "/contents",
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
					isPreview={true}
					isDetail={true}
					isCollapsedGISViewer={true}
				>
					<PanelGroup direction="horizontal">
						<Panel
							defaultSize={80}
							minSize={minWidths.minWidthLeftCenter}
							ref={leftRef}
							className="center-item"
						>
							<div className="content-name h-10">
								<span>
									{jp.common.content}
									{jp.common.name}
								</span>
								<p className="name">
									{contentItems[0]?.name ?? (
										<Spin indicator={<Icon icon="loading" />} size="small" />
									)}
								</p>
							</div>
							<ViewerContainer
								wrapperClassName="h-90"
								gisMapClassName="h-40 b-bottom"
								tableClassName={`content-viewer ${
									isGeoJson ? "h-60" : "h-100"
								}`}
								item={contentItems[0]}
								hasGeoData={Boolean(isGeoJson && contentItems[0]?.schema)}
								onNavigateDetail={() => navigate(routes.content)}
								selectedRowId={selectedRowId}
								onSelectRow={setSelectedRowId}
							/>
						</Panel>

						<PanelResizeHandle className="resize-handle" />

						<Panel
							defaultSize={20}
							minSize={minWidths.minWidthRight}
							ref={rightRef}
							className="right-item"
						>
							{isShow ? (
								<Management
									isPreview={true}
									contentDetail={contentItems[0]}
									setContentItems={setContentItems}
								/>
							) : (
								<div className="loading">
									<Spin indicator={<Icon icon="loading" />} size="large" />
								</div>
							)}
						</Panel>
					</PanelGroup>
				</ContentLayoutS>
			</WrapContent>
		</ContentS>
	);
};

export default ContentDetailPage;
