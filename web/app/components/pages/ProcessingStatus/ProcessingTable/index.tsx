import { useNavigate, useSearchParams } from "@remix-run/react";
import type { PaginationProps } from "antd";
import { Pagination } from "antd";
import type { TableRowSelection } from "antd/es/table/interface";
import type * as React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CONTENT_CALLBACK_API_STATUS } from "~/commons/core.const";
import jp from "~/commons/locales/jp";
import Button from "~/components/atoms/Button";
import Icon from "~/components/atoms/Icon";
import Input from "~/components/atoms/Input";
import Table, { type TableColumnsType } from "~/components/atoms/Table";
import { DefaultCurrent, DefaultPageSize } from "~/components/molecules/Common";
import {
	formatDate,
	updateMultipleSearchParams,
} from "~/components/molecules/Common/utils";
import StatusTag from "~/components/pages/ProcessingStatus/StatusTag";
import {
	TableS,
	WrapFilterTable,
} from "~/components/pages/ProcessingStatus/styles";
import type { Asset } from "~/models/asset";
import { InputTypeDB } from "~/models/operators";
import {
	type DataTableProcessingStatusType,
	type DataTableProcessingStatusTypeArray,
	PREPROCESSING_TYPE,
	PREPROCESSING_TYPE_JAPAN,
} from "~/models/processingStatus";
import { routes } from "~/routes/routes";
import { theme } from "~/styles/theme";

type ProcessingTableProps = {
	data: DataTableProcessingStatusTypeArray;
	items: DataTableProcessingStatusType[];
	setItems: (val: DataTableProcessingStatusType[]) => void;
};

const showTotal: PaginationProps["showTotal"] = (total) => {
	return jp.common.totalItems(total);
};

const getColumns = (): TableColumnsType => [
	{
		title: "インプット名",
		dataIndex: "inputName",
		width: 250,
	},
	{ title: jp.common.type, dataIndex: "type", width: 70 },
	{
		title: jp.common.operation,
		dataIndex: "operation",
		width: 100,
		render: (data: {
			isInExecution: boolean;
			operation: string;
		}) => (
			<div style={{ display: "flex", alignItems: "center", gap: 4 }}>
				{data?.isInExecution ? <Icon icon="templateBox" /> : null}{" "}
				{data?.operation}
			</div>
		),
	},
	{
		title: jp.common.status,
		dataIndex: "status",
		width: 100,
		render: (status: number) => <StatusTag status={status} />,
	},
	{ title: jp.common.updatedBy, dataIndex: "requestedBy", width: 100 },
	{ title: jp.common.updatedAt, dataIndex: "requestedAt", width: 100 },
];

const ProcessingTable: React.FC<ProcessingTableProps> = ({
	data,
	items,
	setItems,
}) => {
	// Remix
	const [searchParams, setSearchParams] = useSearchParams();
	const updateParams = (params: Record<string, string | null>) => {
		updateMultipleSearchParams(searchParams, setSearchParams, params);
	};
	const navigate = useNavigate();
	const [filters, setFilters] = useState({
		keyword: searchParams.get("keyword") || "",
		page: Number(searchParams.get("page")) || DefaultCurrent,
		perPage: Number(searchParams.get("perPage")) || DefaultPageSize,
	});

	// State
	const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
	const [linkTo, setLinkTo] = useState<string>();
	const [isLoading, setIsLoading] = useState(false);

	// Effect
	useEffect(() => {
		setFilters({
			keyword: searchParams.get("keyword") || "",
			page: Number(searchParams.get("page")) || DefaultCurrent,
			perPage: Number(searchParams.get("perPage")) || DefaultPageSize,
		});
	}, [searchParams]);

	useEffect(() => {
		if (items.length === 1) {
			const linkMapping: Record<string, string> = {
				[PREPROCESSING_TYPE.CONTENT_CONFIGS]: `${routes.operatorDataStructure}/${items[0].id}`,
				[PREPROCESSING_TYPE.PREPROCESS_CONTENT_CONFIGS]: `${routes.operatorPreProcessing}/${items[0].id}`,
				[PREPROCESSING_TYPE.TEXT_MATCHING_CONTENT_CONFIGS]: `${routes.operatorTextMatching}/${items[0].id}`,
				[PREPROCESSING_TYPE.CROSS_JOIN_CONTENT_CONFIGS]: `${routes.operatorCrossTab}/${items[0].id}`,
				[PREPROCESSING_TYPE.SPATIAL_JOIN_CONTENT_CONFIGS]: `${routes.operatorSpatialJoin}/${items[0].id}`,
				[PREPROCESSING_TYPE.SPATIAL_AGGREGATE_CONTENT_CONFIGS]: `${routes.operatorSpatialAggregation}/${items[0].id}`,
			};
			setLinkTo(linkMapping[items[0].operatorType] || undefined);
		} else {
			setLinkTo(undefined);
		}
	}, [items]);

	const columns = useMemo(() => getColumns(), []);

	useEffect(() => {
		if (data) {
			setIsLoading(false);
		}
	}, [data]);

	const initialDataSource = data?.data?.map(
		(item: DataTableProcessingStatusType, i) => {
			let inputName = "";
			let type = "";

			if (
				item?.operatorType === PREPROCESSING_TYPE.CONTENT_CONFIGS ||
				(item?.operatorType === PREPROCESSING_TYPE.PREPROCESS_CONTENT_CONFIGS &&
					"inputType" in item &&
					item.inputType === InputTypeDB.ASSET)
			) {
				const inputDetail = item?.inputDetail as Asset;
				const urlSplit = inputDetail?.url.split("/");
				const urlSplitTypeFile = inputDetail?.url.split(".");
				inputName = urlSplit
					? decodeURIComponent(urlSplit[urlSplit.length - 1])
					: "";
				type = urlSplitTypeFile
					? urlSplitTypeFile[urlSplitTypeFile?.length - 1]
					: "";
			} else {
				inputName = item?.inputDetail?.name;
				type =
					item?.operatorType === PREPROCESSING_TYPE.CONTENT_CREATION
						? "GZIP"
						: "Content";
			}

			return {
				...item,
				key: item?.operatorType + item?.id + item?.status,
				inputName,
				type,
				operation: {
					isInExecution: "isInExecution" in item ? item.isInExecution : false,
					operation: PREPROCESSING_TYPE_JAPAN[item?.operatorType],
				},
				status: item?.status,
				requestedBy: item?.createdBy ?? "N/A",
				requestedAt: item?.createdAt
					? formatDate(item?.createdAt.toString())
					: "",
			};
		},
	);

	const handleFilterChange = (updates: Partial<typeof filters>) => {
		const newFilters = { ...filters, ...updates };
		setFilters(newFilters);
		setIsLoading(true);

		updateParams({
			keyword: newFilters.keyword || null,
			page: newFilters.page?.toString() || null,
			perPage: newFilters.perPage?.toString() || null,
		});
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: FIXME
	const handleSelectChange = useCallback(
		(
			newSelectedRowKeys: React.Key[],
			selectedRows: DataTableProcessingStatusType[],
		) => {
			setSelectedRowKeys(newSelectedRowKeys);
			setItems(selectedRows);
		},
		[],
	);

	// biome-ignore lint/suspicious/noExplicitAny: FIXME
	const rowSelection: TableRowSelection<any> = {
		selectedRowKeys,
		onChange: handleSelectChange,
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: FIXME
	const handleOpen = useCallback(() => {
		if (linkTo) {
			navigate(linkTo);
		}
	}, [linkTo]);

	return (
		<>
			<WrapFilterTable>
				<div className="filter">
					<Input
						placeholder="Type Operation Search"
						value={filters.keyword}
						onChange={(e) =>
							setFilters((prev) => ({
								...prev,
								keyword: e.target.value,
							}))
						}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								handleFilterChange({
									keyword: filters.keyword,
									page: DefaultCurrent,
								});
							}
						}}
						className="input-search"
					/>
					<button
						type="button"
						onClick={() =>
							handleFilterChange({
								keyword: filters.keyword,
								page: DefaultCurrent,
							})
						}
						className="button-search"
					>
						<Icon icon="search" size={16} color={theme.colors.lightGray} />
					</button>
				</div>

				{columns && initialDataSource && (
					<TableS>
						<Table
							className="table"
							rowSelection={rowSelection}
							columns={columns}
							dataSource={initialDataSource}
							pagination={false}
							rowClassName={(record) =>
								selectedRowKeys.includes(record.key) ? "selected-row" : ""
							}
							scroll={{ x: 1200 }}
							loading={isLoading}
						/>
					</TableS>
				)}
			</WrapFilterTable>

			<div className="wrap-pagination">
				<Pagination
					showQuickJumper
					showSizeChanger
					showTotal={showTotal}
					current={filters.page}
					total={data?.totalCount}
					onChange={(page, pageSize) => {
						handleFilterChange({ page, perPage: pageSize });
					}}
					onShowSizeChange={(current, size) => {
						handleFilterChange({ page: DefaultCurrent, perPage: size });
					}}
					pageSizeOptions={["5", "10"]}
					pageSize={filters.perPage}
					locale={{
						jump_to: jp.common.goTo,
						page: jp.common.page,
						items_per_page: `/ ${jp.common.page}`,
					}}
				/>
			</div>

			<div className="button-bottom">
				<Button
					icon={<Icon icon="swap" size={16} />}
					disabled={
						!(items.length === 1) ||
						items[0]?.status === CONTENT_CALLBACK_API_STATUS.PENDING_PROCESS
					}
					onClick={handleOpen}
				>
					{jp.common.open}
				</Button>
			</div>
		</>
	);
};

export default ProcessingTable;
