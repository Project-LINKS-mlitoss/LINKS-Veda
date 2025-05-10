import { useFetcher } from "@remix-run/react";
import { Pagination } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useMemo, useState } from "react";
import type { SelectRowIdT } from "~/commons/core.const";
import jp from "~/commons/locales/jp";
import Icon from "~/components/atoms/Icon";
import Table from "~/components/atoms/Table";
import {
	DefaultCurrent,
	DefaultPageSize,
	PageSizeOptions,
} from "~/components/molecules/Common";
import { formatValue } from "~/components/molecules/Common/utils";
import type { DataTableContentType } from "~/components/pages/Content/types";
import { ContentViewerS } from "~/components/pages/Operators/styles";
import type { ColumnConfident } from "~/components/pages/Operators/types";
import type { ContentItem } from "~/models/content";
import type { Item, ItemField, ItemsResponse } from "~/models/items";
import type { ApiResponse } from "~/repositories/utils";
import { routes } from "~/routes/routes";
import { getMaxContentField } from "~/utils/common";

interface ContentDetailFilter {
	page: number;
	perPage: number;
}

type Props = {
	contentItem?: DataTableContentType | ContentItem;
	isPreview: boolean;
	showContentDetail?: boolean;
	setShowContentDetail?: (val: boolean) => void;
	setColumnConfident?: (val: ColumnConfident) => void;
	setSelectedRowId?: (val: SelectRowIdT | null) => void;
	isPaginationShorten?: boolean;
	updateParams?: (params: Record<string, string>) => void;
	filter?: ContentDetailFilter;
	fetchData?: ApiResponse<ItemsResponse>;
};

interface DataType {
	// biome-ignore lint/suspicious/noExplicitAny: FIXME
	[key: string]: any;
}

const getCellClass = (confident: number): string => {
	if (confident === 1) return "confident-high";
	if (confident >= 0.7) return "confident-medium-high";
	if (confident >= 0.4) return "confident-medium";
	return "confident-low";
};

const createEditableColumn = (title: string, id: string, width: number) => ({
	title: (
		<div className="title-col">
			<Icon icon="textLeft" size={16} />
			<span>{title}</span>
		</div>
	),
	dataIndex: id,
	key: id,
	width,
	render: (
		text: { value: string | number | boolean; confident: number },
		record: DataType,
	) => {
		const cellClass = getCellClass(
			typeof text?.confident === "number" &&
				text?.confident >= 0 &&
				text?.confident <= 1
				? text?.confident
				: 1,
		);

		return {
			props: {
				className: cellClass,
			},
			children: <span>{formatValue(text?.value)}</span>,
		};
	},
});

const ContentViewerOperator: React.FC<Props> = ({
	contentItem,
	isPreview,
	setColumnConfident,
	setSelectedRowId,
	isPaginationShorten,
	updateParams,
	filter: externalFilter,
	fetchData,
}) => {
	const fetch = useFetcher<ApiResponse<ItemsResponse>>();
	const isLoadItem = fetch.state === "loading";
	const [dataTable, setDataTable] = useState<DataType[]>([]);
	const [filters, setFilters] = useState({
		page: DefaultCurrent,
		perPage: DefaultPageSize,
	});

	// Get items
	// biome-ignore lint/correctness/useExhaustiveDependencies: FIXME
	useEffect(() => {
		if (!contentItem || externalFilter || fetchData) return;
		fetch.load(
			`${routes.item}?confident=${!!setColumnConfident}&modelId=${contentItem.id}&page=${filters.page}&perPage=${filters.perPage}`,
		);
	}, [contentItem?.id, filters, externalFilter, fetchData]);

	// Create data table
	useEffect(() => {
		let data: ItemsResponse | null = null;
		if (fetch?.data?.status) {
			data = fetch.data.data;
		} else if (fetchData?.status) {
			data = fetchData.data;
		}
		if (data) {
			const newData: DataType[] = data?.items?.map((item: Item) => {
				const rowData: DataType = {};
				const confident = item?.confident;

				// No change schema to content because this is data from CMS
				if (contentItem?.schema?.fields) {
					const fields = getMaxContentField(contentItem?.schema?.fields);
					for (const field of fields) {
						const fieldData = item?.fields?.find(
							(f: ItemField) => f?.id === field?.id,
						);
						if (fieldData) {
							rowData[field?.id] = confident
								? {
										value: fieldData?.value,
										confident: confident?.[field?.key],
										key: field?.key,
									}
								: {
										value: fieldData?.value,
										key: field?.key,
									};
						}
					}
				}

				return { ...rowData, id: item?.id };
			});

			setDataTable(newData);
		}
	}, [fetch.data, contentItem, fetchData]);

	// Handle calculator confident column
	// biome-ignore lint/correctness/useExhaustiveDependencies: FIXME
	useEffect(() => {
		if (setColumnConfident) {
			// No change schema to content because this is data from CMS
			if (dataTable.length > 0 && contentItem?.schema?.fields) {
				const confidentPercent: ColumnConfident = {};

				const fields = getMaxContentField(contentItem?.schema?.fields);
				for (const field of fields) {
					const columnId = field.id;
					const columnConfidentValues = dataTable
						.map((row) => row[columnId]?.confident)
						.filter((confident) => typeof confident === "number");

					if (columnConfidentValues.length > 0) {
						const avgConfident =
							columnConfidentValues.reduce(
								(sum, confident) => sum + confident,
								0,
							) / columnConfidentValues.length;

						confidentPercent[field.key] = avgConfident * 100;
					}
				}
				setColumnConfident(confidentPercent);
			} else {
				setColumnConfident({});
			}
		}
	}, [dataTable, contentItem]);

	// Handle filter
	const handleFilterChange = (page: number, perPage: number) => {
		setFilters({ page, perPage });
		updateParams?.({ page: page.toString(), perPage: perPage.toString() });
	};

	// Handle create column table
	const columns: ColumnsType<DataType> = useMemo(() => {
		const cols: ColumnsType<DataType> = [];
		// No change schema to content because this is data from CMS
		if (contentItem?.schema?.fields) {
			const fields = getMaxContentField(contentItem?.schema?.fields);
			for (const field of fields) {
				cols.push(createEditableColumn(field.key, field.id, 150));
			}
		}

		return cols;
	}, [contentItem]);

	const handleRowClick = (record: DataType) => {
		if (setSelectedRowId) {
			const timestamp = Date.now();
			setSelectedRowId({ id: record?.id, timestamp });
		}
	};

	const totalCount = useMemo(() => {
		return fetchData?.status
			? fetchData.data.totalCount
			: fetch.data?.status
				? fetch.data.data.totalCount
				: 0;
	}, [fetchData, fetch.data]);

	return (
		<ContentViewerS>
			{isPreview && contentItem && (
				<>
					<div className="content-viewer-table">
						<Table
							bordered
							loading={isLoadItem}
							columns={columns}
							dataSource={dataTable}
							pagination={false}
							scroll={{ x: "max-content" }}
							onRow={(record) => ({
								onClick: () => handleRowClick(record),
							})}
						/>

						{setColumnConfident ? (
							<div className="confident-note">
								<p>
									一致度
									<span>
										<span className="circle confident-medium-high" /> 70 -
										100%未満
									</span>
									<span>
										<span className="circle confident-medium" /> 40 - 70%未満
									</span>
									<span>
										<span className="circle confident-low" /> 40%未満
									</span>
								</p>
							</div>
						) : null}
					</div>

					{dataTable.length > 0 && (
						<div className="wrap-pagination">
							<Pagination
								showQuickJumper={!isPaginationShorten}
								showSizeChanger={!isPaginationShorten}
								showTotal={(total: number) => jp.common.totalItems(total)}
								current={externalFilter?.page || filters.page}
								total={totalCount}
								onChange={(page, pageSize) => {
									handleFilterChange(page, pageSize || filters.perPage);
								}}
								onShowSizeChange={(current, size) => {
									handleFilterChange(DefaultCurrent, size);
								}}
								pageSizeOptions={PageSizeOptions}
								pageSize={externalFilter?.perPage || filters.perPage}
								className="content-viewer-pagination"
								responsive={true}
								locale={{
									jump_to: jp.common.goTo,
									page: jp.common.page,
									items_per_page: `/ ${jp.common.page}`,
								}}
							/>
						</div>
					)}
				</>
			)}
		</ContentViewerS>
	);
};

export default ContentViewerOperator;
