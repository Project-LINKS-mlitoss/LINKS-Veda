import { useActionData, useNavigate, useSearchParams } from "@remix-run/react";
import { Pagination } from "antd";
import type { PaginationProps } from "antd";
import type { TableRowSelection } from "antd/es/table/interface";
import type * as React from "react";
import { useEffect, useState } from "react";
import jp from "~/commons/locales/jp";
import Button from "~/components/atoms/Button";
import Icon from "~/components/atoms/Icon";
import Input from "~/components/atoms/Input";
import Switch from "~/components/atoms/Switch";
import Table, { type TableColumnsType } from "~/components/atoms/Table";
import Tooltip from "~/components/atoms/Tooltip";
import {
	DefaultCurrent,
	DefaultPageSize,
	PageSizeOptions,
} from "~/components/molecules/Common";
import {
	formatDate,
	showNotification,
	updateMultipleSearchParams,
} from "~/components/molecules/Common/utils";
import ModalDeleteDataset from "~/components/pages/Dataset/Modal/ModalDeleteDataset";
import { TableS, WrapFilterTable } from "~/components/pages/Dataset/styles";
import type { ContentResponse } from "~/models/content";
import {
	ACTION_TYPES_DATASET,
	type DatasetResponse,
	type DatasetT,
} from "~/models/dataset";
import type { ApiResponse } from "~/repositories/utils";
import { theme } from "~/styles/theme";

type Props = {
	data: DatasetResponse;
	setDatasetChoose: (val: DatasetT | undefined) => void;
	datasetChoose: DatasetT | undefined;
};

const DatasetList: React.FC<Props> = (props) => {
	// Props
	const { data, setDatasetChoose } = props;

	// Remix
	const navigate = useNavigate();
	const [searchParams, setSearchParams] = useSearchParams();
	const [isLoading, setIsLoading] = useState(false);
	const actionData = useActionData<ApiResponse<null>>();
	const updateParams = (params: Record<string, string | null>) => {
		updateMultipleSearchParams(searchParams, setSearchParams, params);
	};

	// State
	const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
	const [filters, setFilters] = useState({
		keyword: searchParams.get("keyword") || "",
		page: Number(searchParams.get("page")) || DefaultCurrent,
		perPage: Number(searchParams.get("perPage")) || DefaultPageSize,
	});
	const [datasetItems, setDatasetItems] = useState<DatasetT[]>([]);
	const [isModalDeleteOpen, setIsModalDeleteOpen] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	useEffect(() => {
		setFilters({
			keyword: searchParams.get("keyword") || "",
			page: Number(searchParams.get("page")) || DefaultCurrent,
			perPage: Number(searchParams.get("perPage")) || DefaultPageSize,
		});
	}, [searchParams]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: FIXME
	useEffect(() => {
		setDatasetChoose(datasetItems.length === 1 ? datasetItems[0] : undefined);
	}, [datasetItems]);

	// Columns
	const columns: TableColumnsType = [
		{
			title: "",
			dataIndex: "edit",
			width: 10,
			render: (_, record) => (
				<button
					type="button"
					onClick={() => {
						navigate(`${record.id}`);
					}}
				>
					<Icon icon="editTwoTone" size={16} />
				</button>
			),
		},
		...columnsInitial,
	];

	// initialDataSource
	useEffect(() => {
		if (data) {
			setIsLoading(false);
		}
	}, [data]);
	const getMetaValue = (
		metaData: Array<{ key: string; value: string }>,
		key: string,
	) => {
		return metaData?.find((item) => item.key === key)?.value;
	};
	const initialDataSource = data?.data?.map((record) => {
		const metaData = record?.metaData as Array<{ key: string; value: string }>;
		return {
			key: record?.id,
			id: record?.id,
			name: record?.name,
			isPublish: record?.isPublish,
			useCase: "useCase" in record ? record?.useCase : undefined,
			managementId: getMetaValue(metaData, "id"),
			description: getMetaValue(metaData, "description"),
			keywords: getMetaValue(metaData, "keywords"),
			theme: getMetaValue(metaData, "theme"),
			spatial: getMetaValue(metaData, "spatial"),
			temporalResolution: getMetaValue(metaData, "temporalResolution"),
			publisher: getMetaValue(metaData, "publisher"),
			contactPoint: getMetaValue(metaData, "contactPoint"),
			creator: getMetaValue(metaData, "creator"),
			issued: getMetaValue(metaData, "issued"),
			modified: getMetaValue(metaData, "modified"),
			accrualPeriodicity: getMetaValue(metaData, "accrualPeriodicity"),
			language: getMetaValue(metaData, "language"),
			publicScope: getMetaValue(metaData, "publicScope"),
			publicCondition: getMetaValue(metaData, "publicCondition"),
			license: getMetaValue(metaData, "license"),
			rights: getMetaValue(metaData, "rights"),
			version: getMetaValue(metaData, "version"),
			type: getMetaValue(metaData, "type"),
			encoding: getMetaValue(metaData, "encoding"),
			qualityAssessment: getMetaValue(metaData, "qualityAssessment"),
			dataQuality: getMetaValue(metaData, "dataQuality"),
			constraint: getMetaValue(metaData, "constraint"),
			costType: getMetaValue(metaData, "costType"),
			disasterCategory: getMetaValue(metaData, "disasterCategory"),
			priceInfo: getMetaValue(metaData, "priceInfo"),
			usagePermission: getMetaValue(metaData, "usagePermission"),
			conformsTo: getMetaValue(metaData, "conformsTo"),
			isReferencedBy: getMetaValue(metaData, "isReferencedBy"),
			createdAt: record?.createdAt,
			updatedAt: record?.updatedAt,
		};
	});

	// Functions
	const handleSelectChange = (newSelectedRowKeys: React.Key[]) => {
		setSelectedRowKeys(newSelectedRowKeys);
		const selectedDatasets = data.data.filter((item) =>
			newSelectedRowKeys.includes(item.id),
		);
		setDatasetItems(selectedDatasets);
	};

	const rowSelection: TableRowSelection = {
		selectedRowKeys,
		onChange: handleSelectChange,
	};

	const handleFilterChange = (updates: Partial<typeof filters>) => {
		const newFilters = { ...filters, ...updates };
		setFilters(newFilters);
		setIsLoading(true);

		updateParams({
			keyword: newFilters.keyword || null,
			page: newFilters.page?.toString() || null,
			perPage: newFilters.perPage?.toString() || null,
		});
		setDatasetItems([]);
		setSelectedRowKeys([]);
	};

	// Handle response
	// biome-ignore lint/correctness/useExhaustiveDependencies: FIXME
	useEffect(() => {
		if (actionData && actionData?.actionType === ACTION_TYPES_DATASET.DELETE) {
			const data = actionData as ApiResponse<ContentResponse | null>;
			if (data.status === false) {
				showNotification(false, jp.message.common.deleteFailed, data.error);
			} else {
				showNotification(true, jp.message.common.deleteSuccessful);
			}
			setIsModalDeleteOpen(false);
			setDatasetChoose(undefined);
			setIsDeleting(false);
			setSelectedRowKeys([]);
		}
	}, [actionData]);

	return (
		<>
			<WrapFilterTable>
				<div className="filter">
					<Input
						placeholder="Dataset Search"
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
						<Icon icon="search" color={theme.colors.lightGray} />
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
							scroll={{ x: "max-content" }}
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
					total={data?.totalCount || 0}
					onChange={(page, pageSize) => {
						handleFilterChange({ page, perPage: pageSize });
					}}
					onShowSizeChange={(current, size) => {
						handleFilterChange({
							page: DefaultCurrent,
							perPage: size,
						});
					}}
					pageSizeOptions={PageSizeOptions}
					pageSize={filters.perPage}
					responsive
					locale={{
						jump_to: jp.common.goTo,
						page: jp.common.page,
						items_per_page: `/ ${jp.common.page}`,
					}}
				/>
			</div>

			<div className="button-bottom">
				<Button
					icon={<Icon icon="filePlus" size={16} />}
					onClick={() => navigate("create")}
					type="default"
				>
					新規作成
				</Button>
				<Button
					type="primary"
					danger
					ghost
					onClick={() => setIsModalDeleteOpen(true)}
					icon={<Icon icon="trash" size={16} />}
					className="button-delete"
					disabled={selectedRowKeys.length === 0}
				>
					削除
				</Button>
			</div>

			<ModalDeleteDataset
				isModalDeleteOpen={isModalDeleteOpen}
				setIsModalDeleteOpen={setIsModalDeleteOpen}
				datasetItems={datasetItems}
				isDeleting={isDeleting}
				setIsDeleting={setIsDeleting}
			/>
		</>
	);
};

export default DatasetList;

const showTotal: PaginationProps["showTotal"] = (total) => {
	return jp.common.totalItems(total);
};

const columnsInitial: TableColumnsType = [
	{
		title: "データセット名",
		dataIndex: "name",
		width: 200,
	},
	{
		title: "公開ステータス",
		dataIndex: "isPublish",
		width: 150,
		render: (isPublish: boolean) => <Switch checked={isPublish} disabled />,
	},
	{
		title: "UC No.",
		dataIndex: "useCase",
		width: 100,
		render: (useCase: { name: string } | undefined) => useCase?.name,
	},
	{
		title: "管理ID",
		dataIndex: "managementId",
		width: 120,
	},
	{
		title: "説明",
		dataIndex: "description",
		width: 400,
		render: (text: string) => {
			if (!text) return null;
			return (
				<Tooltip title={text}>
					<span>
						{text.length > 100 ? `${text.substring(0, 100)}...` : text}
					</span>
				</Tooltip>
			);
		},
	},
	{
		title: "キーワード",
		dataIndex: "keywords",
		width: 200,
	},
	{
		title: "テーマ分類",
		dataIndex: "theme",
		width: 150,
	},
	{
		title: "対象地域",
		dataIndex: "spatial",
		width: 100,
	},
	{
		title: "対象期間",
		dataIndex: "temporalResolution",
		width: 100,
	},
	{
		title: "提供者",
		dataIndex: "publisher",
		width: 200,
	},
	{
		title: "連絡先情報",
		dataIndex: "contactPoint",
		width: 200,
	},
	{
		title: "作成者",
		dataIndex: "creator",
		width: 150,
	},
	{
		title: "公開日",
		dataIndex: "issued",
		width: 120,
	},
	{
		title: "最終更新日",
		dataIndex: "modified",
		width: 120,
	},
	{
		title: "更新頻度",
		dataIndex: "accrualPeriodicity",
		width: 120,
	},
	{
		title: "言語",
		dataIndex: "language",
		width: 80,
	},
	{
		title: "公開範囲",
		dataIndex: "publicScope",
		width: 120,
	},
	{
		title: "公開条件",
		dataIndex: "publicCondition",
		width: 150,
	},
	{
		title: "ライセンス",
		dataIndex: "license",
		width: 200,
	},
	{
		title: "利用規約",
		dataIndex: "rights",
		width: 200,
	},
	{
		title: "バージョン",
		dataIndex: "version",
		width: 120,
	},
	{
		title: "タイプ",
		dataIndex: "type",
		width: 100,
	},
	{
		title: "エンコーディング",
		dataIndex: "encoding",
		width: 150,
	},
	{
		title: "品質評価",
		dataIndex: "qualityAssessment",
		width: 150,
	},
	{
		title: "データ品質",
		dataIndex: "dataQuality",
		width: 300,
		render: (text: string) => {
			if (!text) return null;
			return (
				<Tooltip title={text}>
					<span>
						{text.length > 100 ? `${text.substring(0, 100)}...` : text}
					</span>
				</Tooltip>
			);
		},
	},
	{
		title: "制約",
		dataIndex: "constraint",
		width: 150,
	},
	{
		title: "有償無償区分",
		dataIndex: "costType",
		width: 120,
	},
	{
		title: "災害時区分",
		dataIndex: "disasterCategory",
		width: 120,
	},
	{
		title: "価格情報",
		dataIndex: "priceInfo",
		width: 150,
	},
	{
		title: "使用許諾",
		dataIndex: "usagePermission",
		width: 300,
		render: (text: string) => {
			if (!text) return null;
			return (
				<Tooltip title={text}>
					<span>
						{text.length > 100 ? `${text.substring(0, 100)}...` : text}
					</span>
				</Tooltip>
			);
		},
	},
	{
		title: "準拠する標準",
		dataIndex: "conformsTo",
		width: 200,
	},
	{
		title: "関連ドキュメント",
		dataIndex: "isReferencedBy",
		width: 200,
	},
	{
		title: "作成日時",
		dataIndex: "createdAt",
		width: 150,
		render: (date: string) => formatDate(date),
	},
	{
		title: "更新日時",
		dataIndex: "updatedAt",
		width: 150,
		render: (date: string) => formatDate(date),
	},
];
