import { useFetcher } from "@remix-run/react";
import { Pagination } from "antd";
import type { ColumnsType } from "antd/es/table";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { CONTENT_FIELD_TYPE } from "~/commons/core.const";
import jp from "~/commons/locales/jp";
import Icon from "~/components/atoms/Icon";
import Table from "~/components/atoms/Table";
import {
	DefaultCurrent,
	DefaultPageSize,
	PageSizeOptions,
} from "~/components/molecules/Common";
import { formatValue } from "~/components/molecules/Common/utils";
import type { DataTableChatType } from "~/components/pages/Chat/types";
import { ContentViewerS } from "~/components/pages/Operators/styles";
import type { Item, ItemField, ItemsResponse } from "~/models/items";
import type { ApiResponse } from "~/repositories/utils";
import { routes } from "~/routes/routes";
import { getMaxContentField } from "~/utils/common";

type ContentProps = {
	contentItem?: DataTableChatType;
	isPreview: boolean;
};

interface DataType {
	// biome-ignore lint/suspicious/noExplicitAny: FIXME
	[key: string]: any;
}

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
	render: (text: { value: string | number | boolean; confident: number }) => {
		return {
			children: <span>{formatValue(text?.value)}</span>,
		};
	},
});

const ContentViewerChat: React.FC<ContentProps> = ({
	contentItem,
	isPreview,
}) => {
	const fetch = useFetcher<ApiResponse<ItemsResponse>>();
	const [dataTable, setDataTable] = useState<DataType[]>([]);
	const [filters, setFilters] = useState({
		page: DefaultCurrent,
		perPage: DefaultPageSize,
	});

	// biome-ignore lint/correctness/useExhaustiveDependencies: FIXME
	useEffect(() => {
		if (contentItem) {
			fetch.load(
				`${routes.item}?modelId=${contentItem.contentId}&page=${filters.page}&perPage=${filters.perPage}`,
			);
		}
	}, [contentItem?.contentId, filters]);

	// Create data table
	useEffect(() => {
		if (fetch?.data?.status) {
			const data: ItemsResponse = fetch?.data?.data;
			const newData: DataType[] = data?.items?.map((item: Item) => {
				const rowData: DataType = {};

				if (contentItem?.schema?.fields) {
					const fields = getMaxContentField(contentItem?.schema?.fields);
					for (const field of fields) {
						const fieldData = item?.fields?.find(
							(f: ItemField) => f?.id === field?.id,
						);
						if (fieldData && fieldData?.type !== CONTENT_FIELD_TYPE.GEO) {
							rowData[field?.id] = {
								value: fieldData?.value,
							};
						}
					}
				}

				return { ...rowData, id: item?.id };
			});

			setDataTable(newData);
		}
	}, [fetch.data, contentItem]);

	// Handle filter
	const handleFilterChange = (page: number, perPage: number) => {
		setFilters({ page, perPage });
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

	return (
		<ContentViewerS>
			{isPreview && contentItem && (
				<>
					<div className="content-viewer-table">
						<Table
							bordered
							columns={columns}
							dataSource={dataTable}
							pagination={false}
							scroll={{ x: "max-content" }}
						/>
					</div>

					{dataTable.length > 0 && (
						<div className="wrap-pagination">
							<Pagination
								showQuickJumper
								showSizeChanger
								showTotal={(total: number) => `Total ${total} items`}
								current={filters.page}
								total={fetch.data?.status ? fetch.data?.data?.totalCount : 0}
								onChange={(page, pageSize) => {
									handleFilterChange(page, pageSize || filters.perPage);
								}}
								onShowSizeChange={(current, size) => {
									handleFilterChange(DefaultCurrent, size);
								}}
								pageSizeOptions={PageSizeOptions}
								pageSize={filters.perPage}
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

export default ContentViewerChat;
