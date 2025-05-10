import { useFetcher, useSearchParams } from "@remix-run/react";
import type * as React from "react";
import { useEffect, useRef, useState } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import {
	DEFAULT_SIZE,
	MIN_WIDTHS,
	MIN_WIDTH_LEFT_CENTER,
	MIN_WIDTH_RIGHT,
} from "~/commons/core.const";
import Button from "~/components/atoms/Button";
import Icon from "~/components/atoms/Icon";
import WrapContent from "~/components/molecules/Common/WrapContent";
import {
	calculateMinWidths,
	togglePanelSize,
} from "~/components/molecules/Common/utils";
import { OperatorViewerS } from "~/components/pages/Operators/styles";
import type { OptionColumnsT } from "~/components/pages/Operators/types";
import useElementWidth from "~/hooks/useElementWidth";
import type { TextMatchingContentConfigs } from "~/models/operators";
import type { WorkflowT } from "~/models/templates";
import type { ApiResponse } from "~/repositories/utils";
import { routes } from "~/routes/routes";
import { theme } from "~/styles/theme";
import ModalWorkflowDetail from "../Modal/ModalWorkflowDetail";
import Input from "./Input";
import OutputOperator from "./Output";
import SettingOperator from "./Setting";

interface Props {
	initialData?: TextMatchingContentConfigs | null;
	data?: TextMatchingContentConfigs | null;
}

const TextMatching: React.FC<Props> = (props) => {
	// Props
	const { initialData, data } = props;

	// Remix
	const [searchParams] = useSearchParams();
	const workflowId = searchParams.get("workflowId");
	const fetchWorkflowDetail = useFetcher<ApiResponse<WorkflowT>>();

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
	const toggleLeft = () =>
		togglePanelSize(leftRef, minWidths.minWidthLeftCenter, DEFAULT_SIZE);
	const toggleRight = () =>
		togglePanelSize(rightRef, minWidths.minWidthRight, DEFAULT_SIZE);

	//State
	const [contentIdLeft, setContentIdLeft] = useState<string>("");
	const [workflowDetail, setWorkflowDetail] = useState<WorkflowT>();
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [optionColumnsLeft, setOptionColumnsLeft] = useState<
		OptionColumnsT[] | undefined
	>();

	// Handle fetch workflow detail
	// biome-ignore lint/correctness/useExhaustiveDependencies: FIXME
	useEffect(() => {
		if (workflowId) {
			fetchWorkflowDetail.load(`${routes.template}/workflow/${workflowId}`);
		}
	}, [workflowId]);
	useEffect(() => {
		if (fetchWorkflowDetail?.data?.status) {
			setWorkflowDetail(fetchWorkflowDetail?.data?.data);
		}
	}, [fetchWorkflowDetail]);

	return (
		<>
			<WrapContent
				breadcrumbItems={[
					{
						href: routes.operator,
						title: (
							<>
								<Icon
									icon={
										workflowDetail || data?.workflow ? "templateBox" : "swap"
									}
									size={24}
									color={theme.colors.semiBlack}
								/>
								<span>
									{workflowDetail || data?.workflow
										? `テンプレート / ${workflowDetail?.name || data?.workflow?.name}`
										: "オペレーター / テキストマッチング"}
								</span>
							</>
						),
					},
				]}
				actions={
					workflowDetail || data?.workflow ? (
						<Button
							style={{ height: "28px" }}
							onClick={() => setIsModalOpen(true)}
						>
							フロー全体を確認
						</Button>
					) : null
				}
			>
				<OperatorViewerS>
					<PanelGroup direction="horizontal">
						<Panel
							defaultSize={DEFAULT_SIZE}
							minSize={minWidths.minWidthLeftCenter}
							ref={leftRef}
							className="left-item"
						>
							<Input
								setContentIdLeft={setContentIdLeft}
								data={initialData}
								onClickShrinkOutlined={toggleLeft}
								setOptionColumnsLeft={setOptionColumnsLeft}
							/>
						</Panel>

						<PanelResizeHandle className="resize-handle" />

						<Panel
							defaultSize={DEFAULT_SIZE}
							minSize={minWidths.minWidthLeftCenter}
							className="center-item"
						>
							<SettingOperator
								contentIdLeft={contentIdLeft}
								data={initialData}
								workflowDetail={workflowDetail}
								optionColumnsLeft={optionColumnsLeft}
							/>
						</Panel>

						<PanelResizeHandle className="resize-handle" />

						<Panel
							defaultSize={DEFAULT_SIZE}
							minSize={minWidths.minWidthRight}
							ref={rightRef}
							className="right-item"
						>
							<OutputOperator data={data} onClickShrinkOutlined={toggleRight} />
						</Panel>
					</PanelGroup>
				</OperatorViewerS>
			</WrapContent>

			{workflowDetail || data?.workflow ? (
				<ModalWorkflowDetail
					isModalOpen={isModalOpen}
					onCancel={() => {
						setIsModalOpen(false);
					}}
					workflowDetail={workflowDetail || data?.workflow}
					step={data?.workflowDetailExecution?.step ?? 1}
				/>
			) : null}
		</>
	);
};

export default TextMatching;
