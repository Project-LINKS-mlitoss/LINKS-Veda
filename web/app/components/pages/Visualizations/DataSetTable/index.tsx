import { Input, Pagination } from "antd";
import type React from "react";
import { type FC, useCallback, useState } from "react";
import Icon from "~/components/atoms/Icon";
import Table from "~/components/atoms/Table";
import { PageSizeOptions } from "~/components/molecules/Common";
import { formatDate } from "~/components/molecules/Common/utils";
import type { ContentItem } from "~/models/content";
import { theme } from "~/styles/theme";
import { DataSetTableWrapper } from "../styles";
import type { ITableFilter } from "../types";

type DataSetProps = {
	data?: ContentItem[];
	setDataSetItems: React.Dispatch<React.SetStateAction<ContentItem[]>>;
	totalCount: number;
	filters: ITableFilter;
	setFilters: React.Dispatch<React.SetStateAction<ITableFilter>>;
	handleRefetch: (filter: ITableFilter) => void;
};

export const DataSetTable: FC<DataSetProps> = ({
	data,
	setDataSetItems,
	totalCount,
	filters,
	setFilters,
	handleRefetch,
}) => {
	const [selectedRow, setSelectedRow] = useState<ContentItem[]>([]);

	const handleRowClick = useCallback(
		(record: ContentItem) => {
			setSelectedRow((prevSelected) => {
				const updatedSelection = prevSelected.some(
					(item) => item.id === record.id,
				)
					? prevSelected.filter((item) => item.id !== record.id)
					: [...prevSelected, record];

				setDataSetItems(updatedSelection);
				return updatedSelection;
			});
		},
		[setDataSetItems],
	);

	const columns = [
		{
			title: "スキーマ名",
			dataIndex: "name",
			key: "name",
		},
		{
			title: "作成者",
			dataIndex: "createdBy",
			key: "createdBy",
		},
		{
			title: "更新日",
			dataIndex: "createdAt",
			key: "createdAt",
			render: (dateTime: string) => formatDate(dateTime),
		},
	];

	return (
		<DataSetTableWrapper>
			<h2>１つ以上のコンテンツを選択してください</h2>
			<div className="filter">
				<Input
					placeholder="テーブル検索"
					value={filters.keyword}
					onChange={(e) =>
						setFilters((prev) => ({
							...prev,
							keyword: e.target.value,
						}))
					}
					onKeyDown={(e) => {
						if (e.key === "Enter") {
							handleRefetch(filters);
						}
					}}
					className="input-search"
				/>
				<button
					type="button"
					onClick={() => handleRefetch(filters)}
					className="button-search"
				>
					<Icon icon="search" color={theme.colors.lightGray} />
				</button>
			</div>
			<Table
				pagination={false}
				onRow={(record) => ({
					onClick: () => handleRowClick(record),
				})}
				dataSource={data}
				columns={columns}
				rowClassName={(record) =>
					selectedRow.some((item) => item.id === record.id)
						? "selected-row"
						: ""
				}
			/>

			<Pagination
				showSizeChanger
				current={filters.page}
				total={totalCount}
				onChange={(page, pageSize) => {
					setFilters((prev) => ({
						...prev,
						page: page,
						perPage: pageSize,
					}));
					handleRefetch({ page, perPage: pageSize, keyword: filters.keyword });
				}}
				onShowSizeChange={(current, size) => {
					setFilters((prev) => ({ ...prev, page: 100, perPage: size }));
					handleRefetch(filters);
				}}
				pageSizeOptions={[...PageSizeOptions, "100"]}
				pageSize={filters.perPage}
			/>
		</DataSetTableWrapper>
	);
};

export default DataSetTable;
