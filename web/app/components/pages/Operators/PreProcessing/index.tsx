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
import ModalWorkflowDetail from "~/components/pages/Operators/Modal/ModalWorkflowDetail";
import { OperatorViewerS } from "~/components/pages/Operators/styles";
import type { OptionColumnsT } from "~/components/pages/Operators/types";
import useElementWidth from "~/hooks/useElementWidth";
import type { InputType, PreprocessContentConfigs } from "~/models/operators";
import type { WorkflowT } from "~/models/templates";
import type { ApiResponse } from "~/repositories/utils";
import { routes } from "~/routes/routes";
import { theme } from "~/styles/theme";
import Input from "./Input";
import OutputOperator from "./Output";
import SettingOperator from "./Setting";

interface Props {
	initialData?: PreprocessContentConfigs | null;
	data?: PreprocessContentConfigs | null;
}

const PreProcessing: React.FC<Props> = (props) => {
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
	const [assetId, setAssetId] = useState<string>("");
	const [contentId, setContentId] = useState<string>("");
	const [input, setInput] = useState<string>("");
	const [inputType, setInputType] = useState<InputType>();
	const [workflowDetail, setWorkflowDetail] = useState<WorkflowT>();
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [optionColumns, setOptionColumns] = useState<
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
										: "オペレーター / 結合前処理"}
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
								setAssetId={setAssetId}
								setContentId={setContentId}
								data={initialData}
								setInput={setInput}
								setInputType={setInputType}
								onClickShrinkOutlined={toggleLeft}
								setOptionColumns={setOptionColumns}
							/>
						</Panel>

						<PanelResizeHandle className="resize-handle" />

						<Panel
							defaultSize={DEFAULT_SIZE}
							minSize={minWidths.minWidthLeftCenter}
							className="center-item"
						>
							<SettingOperator
								assetId={assetId}
								contentId={contentId}
								input={input}
								inputType={inputType}
								data={initialData}
								workflowDetail={workflowDetail}
								optionColumns={optionColumns}
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

export default PreProcessing;
