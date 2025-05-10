import { useNavigate } from "@remix-run/react";
import type * as React from "react";
import { useEffect, useRef, useState } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import {
	CONTENT_FIELD_TYPE,
	DEFAULT_SIZE_LEFT,
	DEFAULT_SIZE_RIGHT,
	MIN_WIDTHS,
	MIN_WIDTH_LEFT_CENTER_LARGE,
	MIN_WIDTH_RIGHT,
} from "~/commons/core.const";
import jp from "~/commons/locales/jp";
import Icon from "~/components/atoms/Icon";
import Tabs, { type TabsProps } from "~/components/atoms/Tabs";
import WrapContent from "~/components/molecules/Common/WrapContent";
import WrapViewer from "~/components/molecules/Common/WrapViewer";
import {
	calculateMinWidths,
	togglePanelSize,
} from "~/components/molecules/Common/utils";
import ChatTable from "~/components/pages/Chat/ChatTable";
import ContentViewerChat from "~/components/pages/Chat/ContentDetail/ViewerContent/ContentViewer";
import GISViewer from "~/components/pages/Chat/ContentDetail/ViewerContent/GISViewer";
import { ChatLayoutS, ChatS } from "~/components/pages/Chat/styles";
import type { DataTableChatType } from "~/components/pages/Chat/types";
import useElementWidth from "~/hooks/useElementWidth";
import type { ChatResponse } from "~/models/contentChatModel";
import { routes } from "~/routes/routes";
import { theme } from "~/styles/theme";

type ChatProps = {
	data: ChatResponse;
};

const ChatPage: React.FC<ChatProps> = ({ data }: ChatProps) => {
	const navigate = useNavigate();

	const [chatItems, setChatItems] = useState<DataTableChatType[]>([]);
	const isPreview = chatItems.length === 1;
	const isGeoJson =
		chatItems.length && chatItems[0]?.schema?.fields
			? chatItems[0]?.schema?.fields?.some(
					(field) => field?.type === CONTENT_FIELD_TYPE.GEO,
				)
			: false;

	const items: TabsProps["items"] = [
		{
			key: "1",
			label: "ベクトルデータ",
			children: (
				<ChatTable
					data={data}
					chatItems={chatItems}
					setChatItems={setChatItems}
				/>
			),
		},
	];

	// biome-ignore lint/correctness/useExhaustiveDependencies: FIXME
	useEffect(() => {
		const fetchData = async () => {
			if (isPreview && chatItems[0].contentId) {
				try {
					const response = await fetch(
						routes.contentDetailModel(chatItems[0].contentId),
					);
					const data = await response.json();
					if (data?.status) {
						setChatItems((prevItems: DataTableChatType[]) => {
							const updatedItems = [...prevItems];
							updatedItems[0] = {
								...updatedItems[0],
								schema: data.data.schema,
							};
							return updatedItems;
						});
					}
				} catch (error) {
					console.error("Failed to fetch model data", error);
				}
			}
		};

		fetchData();
	}, [isPreview]);

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
		<ChatS>
			<WrapContent
				breadcrumbItems={[
					{
						href: routes.chat,
						title: (
							<>
								<Icon icon="chat" size={24} color={theme.colors.semiBlack} />
								<span>チャット</span>
							</>
						),
					},
				]}
			>
				<ChatLayoutS>
					<PanelGroup direction="horizontal">
						<Panel
							defaultSize={DEFAULT_SIZE_LEFT}
							minSize={minWidths.minWidthLeftCenter}
							className="left-item"
						>
							<Tabs defaultActiveKey="1" items={items} />
						</Panel>

						<PanelResizeHandle className="resize-handle" hidden={!isPreview} />

						<Panel
							minSize={minWidths.minWidthRight}
							ref={rightRef}
							hidden={!isPreview}
							className="center-item"
						>
							{isPreview ? (
								<div className="viewer h-100">
									{isGeoJson && (
										<div className="gis-viewer h-40 b-bottom">
											<WrapViewer
												title={jp.common.gisViewer}
												icon={<Icon icon="map" size={16} />}
												isShowShrinkOutlined
												onClickShrinkOutlined={toggleRight}
											>
												<GISViewer
													contentItem={chatItems[0]}
													key={chatItems[0]?.id}
												/>
											</WrapViewer>
										</div>
									)}
									<div
										className={`content-viewer ${isGeoJson ? "h-60" : "h-100"}`}
									>
										<WrapViewer
											title={jp.common.gisViewerContentViewer}
											icon={<Icon icon="schema" size={16} />}
											isShowShrinkOutlined
											onClickShrinkOutlined={() => {
												navigate(`${routes.content}/${chatItems[0].contentId}`);
											}}
										>
											<ContentViewerChat
												contentItem={chatItems[0]}
												isPreview={true}
											/>
										</WrapViewer>
									</div>
								</div>
							) : null}
						</Panel>
					</PanelGroup>
				</ChatLayoutS>
			</WrapContent>
		</ChatS>
	);
};

export default ChatPage;
