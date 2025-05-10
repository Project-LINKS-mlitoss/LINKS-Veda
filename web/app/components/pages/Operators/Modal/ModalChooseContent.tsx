import { useFetcher } from "@remix-run/react";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { CONTENT_FIELD_TYPE, SORT_DIRECTION } from "~/commons/core.const";
import jp from "~/commons/locales/jp";
import Icon from "~/components/atoms/Icon";
import Input from "~/components/atoms/Input";
import Modal from "~/components/atoms/Modal";
import Table from "~/components/atoms/Table";
import { formatDateToUTC } from "~/components/molecules/Common/utils";
import { ModalChooseFile } from "~/components/pages/Operators/styles";
import type { ContentTableRecord } from "~/components/pages/Operators/types";
import type { ContentItem, ContentResponse } from "~/models/content";
import { OPERATOR_TYPE_JAPAN } from "~/models/operators";
import { OPERATOR_TYPE, type WorkflowT } from "~/models/templates";
import type { ApiResponse } from "~/repositories/utils";
import { routes } from "~/routes/routes";
import { theme } from "~/styles/theme";

interface ModalChooseContentProps {
	isOpen: boolean;
	onCancel: () => void;
	onOk: () => void;
	tempSelectedContent: ContentItem | undefined;
	setTempSelectedContent: (value: ContentItem | undefined) => void;
	selectedContent?: ContentItem;
	isOnlyGeojson?: boolean;
}

type SortableFields =
	| "content"
	| "updateTime"
	| "updateBy"
	| "workflow"
	| "operator";

type SortConfig = {
	key: SortableFields;
	direction: SORT_DIRECTION;
} | null;

interface TransformedData {
	key: string;
	content: string;
	updateTime: string;
	updateBy: string;
	workflow: string;
	operator: string;
}

const ModalChooseContent: React.FC<ModalChooseContentProps> = ({
	isOpen,
	onCancel,
	onOk,
	tempSelectedContent,
	setTempSelectedContent,
	selectedContent,
	isOnlyGeojson = false,
}) => {
	// api data
	const fetchContents = useFetcher<ApiResponse<ContentResponse>>();
	const fetchWorkflows = useFetcher<ApiResponse<WorkflowT[]>>();

	// State
	const [contents, setContents] = useState<ContentItem[]>();
	const [transformedData, setTransformedData] = useState<TransformedData[]>([]);
	const [workflows, setWorkflows] = useState<WorkflowT[]>();
	const isLoadContent = fetchContents.state === "loading";
	const [isFirstFetch, setIsFirstFetch] = useState(true);
	const [tempKeywordContent, setTempKeywordContent] = useState("");
	const [selectedFilterOperatorTypes, setSelectedFilterOperatorTypes] =
		useState<string[]>([]);
	const [selectedFilterWorkflows, setSelectedFilterWorkflows] = useState<
		WorkflowT[]
	>([]);
	const [sortConfig, setSortConfig] = useState<SortConfig>(null);

	// Fetch Content, Workflow
	const handleFetchContents = (
		keywordContent?: string,
		selectedFilterOperatorTypes?: string[],
		selectedFilterWorkflows?: WorkflowT[],
	) => {
		const operatorTypes = selectedFilterOperatorTypes?.length
			? `&operatorTypes=${selectedFilterOperatorTypes.join(",")}`
			: "";

		const workflows = selectedFilterWorkflows?.length
			? `&workflows=${selectedFilterWorkflows.map((w) => w.id).join(",")}`
			: "";

		fetchContents.load(
			`${routes.content}?page=1&perPage=100&keyword=${keywordContent ?? ""}${operatorTypes}${workflows}`,
		);
	};

	const handleFetchWorkflows = () => {
		fetchWorkflows.load(
			`${routes.template}?operatorType=${OPERATOR_TYPE.WORK_FLOW}`,
		);
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: FIXME
	useEffect(() => {
		if (isOpen && isFirstFetch) {
			handleFetchContents();
			handleFetchWorkflows();
			setIsFirstFetch(false);
		}
	}, [isOpen]);
	// Set contents
	useEffect(() => {
		if (fetchContents?.data?.status) {
			let filteredContents = fetchContents.data.data.models;

			if (isOnlyGeojson) {
				filteredContents = filteredContents.filter((content) =>
					content?.schema?.fields?.some(
						(field) => field?.type === CONTENT_FIELD_TYPE.GEO,
					),
				);
			}

			setContents(filteredContents);
		}
	}, [fetchContents, isOnlyGeojson]);
	// set workflow
	useEffect(() => {
		if (fetchWorkflows?.data?.status) {
			setWorkflows(fetchWorkflows?.data?.data);
		}
	}, [fetchWorkflows]);

	// Transform data when contents change
	useEffect(() => {
		if (contents) {
			const newData = contents.map((item) => ({
				key: item?.id,
				content: item?.name,
				updateTime: formatDateToUTC(item?.updatedAt),
				updateBy: item?.createdBy ?? "N/A",
				workflow: item?.workflowAndOperator?.workflow?.name ?? "N/A",
				operator: item?.workflowAndOperator?.operatorType
					? OPERATOR_TYPE_JAPAN[item?.workflowAndOperator?.operatorType]
					: "N/A",
			}));
			setTransformedData(newData);
		}
	}, [contents]);

	// Sort data using useMemo
	const sortedData = useMemo(() => {
		if (!sortConfig) return transformedData;

		return [...transformedData].sort((a, b) => {
			const { key, direction } = sortConfig;
			const aValue = a[key];
			const bValue = b[key];

			if (aValue < bValue) return direction === SORT_DIRECTION.ASC ? -1 : 1;
			if (aValue > bValue) return direction === SORT_DIRECTION.ASC ? 1 : -1;
			return 0;
		});
	}, [transformedData, sortConfig]);

	const getRowClassNameChooseContent = (record: ContentTableRecord) => {
		return selectedContent?.id === record.key ? "selected-row" : "";
	};

	// Function
	const handleFilterClick = (key: string) => {
		setSelectedFilterOperatorTypes((prev) => {
			const newFilters = prev.includes(key)
				? prev.filter((item) => item !== key)
				: [...prev, key];

			handleFetchContents(
				tempKeywordContent,
				newFilters,
				selectedFilterWorkflows,
			);
			return newFilters;
		});
	};

	const handleFilterWorkflowClick = (workflow: WorkflowT) => {
		setSelectedFilterWorkflows((prev) => {
			const newFilters = prev.some((w) => w.id === workflow.id)
				? prev.filter((w) => w.id !== workflow.id)
				: [...prev, workflow];

			handleFetchContents(
				tempKeywordContent,
				selectedFilterOperatorTypes,
				newFilters,
			);
			return newFilters;
		});
	};

	const handleSort = (key: SortableFields) => {
		setSortConfig((prevConfig) => {
			if (!prevConfig || prevConfig.key !== key) {
				return { key, direction: SORT_DIRECTION.ASC };
			}
			if (prevConfig.direction === SORT_DIRECTION.ASC) {
				return { key, direction: SORT_DIRECTION.DESC };
			}
			return null;
		});
	};

	const getColumnSortIcon = (columnKey: SortableFields) => {
		if (!sortConfig || sortConfig.key !== columnKey) {
			return (
				<Icon
					icon="triangleDown"
					className="sort-icon"
					style={{ opacity: 0.3 }}
				/>
			);
		}
		return (
			<Icon
				icon={
					sortConfig.direction === SORT_DIRECTION.ASC
						? "triangleUp"
						: "triangleDown"
				}
				className="sort-icon"
			/>
		);
	};

	const columnsChooseContent = [
		{
			title: (
				<button
					className="col-name"
					onClick={() => handleSort("content")}
					type="button"
					aria-label="Sort by content"
				>
					<Icon icon="schema" /> {jp.common.content}
					{getColumnSortIcon("content")}
				</button>
			),
			dataIndex: "content",
			key: "content",
		},
		{
			title: (
				<button
					className="col-name"
					onClick={() => handleSort("updateTime")}
					type="button"
					aria-label="Sort by update time"
				>
					<Icon icon="clock" /> {jp.common.updatedTime}
					{getColumnSortIcon("updateTime")}
				</button>
			),
			dataIndex: "updateTime",
			key: "updateTime",
		},
		{
			title: (
				<button
					className="col-name"
					onClick={() => handleSort("updateBy")}
					type="button"
					aria-label="Sort by update by"
				>
					<Icon icon="user" /> {jp.common.updatedBy}
					{getColumnSortIcon("updateBy")}
				</button>
			),
			dataIndex: "updateBy",
			key: "updateBy",
		},
		{
			title: (
				<button
					className="col-name"
					onClick={() => handleSort("workflow")}
					type="button"
					aria-label="Sort by workflow"
				>
					<Icon icon="templateBox" /> ワークフロー
					{getColumnSortIcon("workflow")}
				</button>
			),
			dataIndex: "workflow",
			key: "workflow",
		},
		{
			title: (
				<button
					className="col-name"
					onClick={() => handleSort("operator")}
					type="button"
					aria-label="Sort by operator"
				>
					<Icon icon="swap" /> オペレーター
					{getColumnSortIcon("operator")}
				</button>
			),
			dataIndex: "operator",
			key: "operator",
		},
	];

	return (
		<Modal
			centered
			open={isOpen}
			onCancel={onCancel}
			title={`${jp.operator.input}${jp.modal.select}`}
			onOk={onOk}
			okButtonProps={{
				disabled: !tempSelectedContent,
			}}
			cancelText={jp.common.cancel}
			okText={jp.common.load}
			width={840}
		>
			<ModalChooseFile>
				<div className="workflow-operator">
					<div className="wrap-workflow-operator-item workflow">
						<div className="workflow-operator-item">
							{workflows?.map((w: WorkflowT) => (
								<button
									key={w.id}
									type="button"
									className={`filter-item ${selectedFilterWorkflows.some((s) => s?.id === w.id) ? "active-filter-item" : ""}`}
									onClick={() => handleFilterWorkflowClick(w)}
								>
									{w.name}
								</button>
							))}
						</div>
					</div>

					<div className="wrap-workflow-operator-item operator">
						<div className="workflow-operator-item">
							{Object.entries(OPERATOR_TYPE_JAPAN).map(([key, value]) => (
								<button
									key={key}
									type="button"
									className={`filter-item ${selectedFilterOperatorTypes.includes(key) ? "active-filter-item" : ""}`}
									onClick={() => handleFilterClick(key)}
								>
									{value}
								</button>
							))}
						</div>
					</div>
				</div>

				<div className="filter">
					<Input
						placeholder={jp.common.inputSearchText}
						className="input-search"
						value={tempKeywordContent}
						onChange={(e) => setTempKeywordContent(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								handleFetchContents(
									tempKeywordContent,
									selectedFilterOperatorTypes,
									selectedFilterWorkflows,
								);
							}
						}}
					/>
					<button
						type="button"
						className="button-search"
						onClick={() =>
							handleFetchContents(
								tempKeywordContent,
								selectedFilterOperatorTypes,
								selectedFilterWorkflows,
							)
						}
					>
						<Icon icon="search" color={theme.colors.lightGray} />
					</button>
				</div>

				<Table
					className="table-file"
					bordered
					loading={isLoadContent}
					dataSource={sortedData}
					columns={columnsChooseContent}
					rowClassName={getRowClassNameChooseContent}
					pagination={false}
					scroll={{ y: 300 }}
					onRow={(record) => ({
						onClick: () => {
							const content = contents?.find((c) => c.id === record.key);
							setTempSelectedContent(content);
						},
					})}
				/>
			</ModalChooseFile>
		</Modal>
	);
};

export default ModalChooseContent;
