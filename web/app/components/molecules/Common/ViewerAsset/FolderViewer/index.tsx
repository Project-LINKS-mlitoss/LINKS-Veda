import { Input } from "antd";
import type { TableRowSelection } from "antd/es/table/interface";
import type { JSONValue } from "hono/utils/types";
import type * as React from "react";
import { useCallback, useEffect, useState } from "react";
import jp from "~/commons/locales/jp";
import Icon from "~/components/atoms/Icon";
import Table, { type TableColumnsType } from "~/components/atoms/Table";
import WrapViewer from "~/components/molecules/Common/WrapViewer";
import { formatFileSize } from "~/components/molecules/Common/utils";
import type { FileAsset, FileChild } from "~/models/asset";
import { theme } from "~/styles/theme";
import { SearchS, TableS, TableViewerS } from "../styles";
import type { DataTypeFolderViewer } from "../types";

interface AssetViewerProps {
	assetFile: FileAsset;
	setAssetItemFolderViewer: (val: DataTypeFolderViewer[]) => void;
	disabled?: boolean;
	defaultSelect?: JSONValue;
	isOperator?: boolean;
}

const TableViewer: React.FC<AssetViewerProps> = ({
	assetFile,
	setAssetItemFolderViewer,
	disabled = false,
	defaultSelect,
	isOperator,
}) => {
	const columns: TableColumnsType<DataTypeFolderViewer> = [
		{ title: jp.common.id, dataIndex: "id" },
		{ title: jp.asset.fileNameContent, dataIndex: "name" },
		{ title: jp.common.size, dataIndex: "size" },
	];

	const mapDataSource = useCallback(
		(children: FileChild[]): DataTypeFolderViewer[] => {
			return children?.map((child) => ({
				...child,
				key: child.name,
				id: child.name,
				size: formatFileSize(child.size ?? 0),
			}));
		},
		[],
	);

	const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
	const [searchText, setSearchText] = useState("");
	const [currentDataSource, setCurrentDataSource] = useState<
		DataTypeFolderViewer[]
	>(mapDataSource(assetFile?.children));

	useEffect(() => {
		setCurrentDataSource(mapDataSource(assetFile?.children));
	}, [assetFile?.children, mapDataSource]);

	const parseDefaultSelect = (value: JSONValue): React.Key[] => {
		if (Array.isArray(value)) {
			return value.filter((item): item is string => typeof item === "string");
		}
		return [];
	};
	// biome-ignore lint/correctness/useExhaustiveDependencies: FIXME
	useEffect(() => {
		if (defaultSelect) {
			const defaultSelectedKeys = parseDefaultSelect(defaultSelect);
			const selectedItems = mapDataSource(assetFile?.children ?? []).filter(
				(item) => defaultSelectedKeys.includes(item.key),
			);
			setSelectedRowKeys(defaultSelectedKeys);
			setAssetItemFolderViewer(selectedItems);
		}
	}, [defaultSelect, assetFile]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: FIXME
	useEffect(() => {
		const dataSource = mapDataSource(assetFile?.children ?? []);
		let defaultSelectedKeys: React.Key[] = [];

		if (isOperator) {
			defaultSelectedKeys = dataSource.map((item) => item.key);
		}

		const selectedItems = dataSource.filter((item) =>
			defaultSelectedKeys.includes(item.key),
		);

		setSelectedRowKeys(defaultSelectedKeys);
		setAssetItemFolderViewer(selectedItems);
	}, [assetFile, isOperator]);

	const handleSelectChange = (newSelectedRowKeys: React.Key[]) => {
		setSelectedRowKeys(newSelectedRowKeys);

		const selectedData = mapDataSource(assetFile?.children).filter((item) =>
			newSelectedRowKeys.includes(item.key),
		);
		const formattedData = selectedData.map((item) => ({
			...item,
			children: [],
		}));
		setAssetItemFolderViewer(formattedData);
	};

	const rowSelection: TableRowSelection<DataTypeFolderViewer> = {
		selectedRowKeys,
		onChange: handleSelectChange,
		getCheckboxProps: () => ({
			disabled,
		}),
	};

	const handleChangeSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchText(e.target.value);
	};

	const handleSearchClick = () => {
		updateDataSource(searchText);
	};

	const updateDataSource = (search: string) => {
		const filteredData = mapDataSource(assetFile?.children).filter((item) =>
			item.name.toLowerCase().includes(search.toLowerCase()),
		);

		setCurrentDataSource(filteredData);
	};

	return (
		<WrapViewer
			title={jp.common.folderViewer}
			icon={<Icon icon="folderViewer" size={16} />}
		>
			<TableViewerS>
				<SearchS>
					<Input
						placeholder={jp.common.inputSearchText}
						value={searchText}
						onChange={handleChangeSearch}
						className="input-search"
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								handleSearchClick();
							}
						}}
						disabled={disabled}
					/>
					<button
						type="button"
						onClick={handleSearchClick}
						className="button-search"
						disabled={disabled}
					>
						<Icon icon="search" size={16} color={theme.colors.lightGray} />
					</button>
				</SearchS>

				{columns && currentDataSource && (
					<TableS>
						<Table
							rowSelection={rowSelection}
							columns={columns}
							dataSource={currentDataSource}
							pagination={false}
							className={`table ${disabled ? "disabled-table" : ""}`}
							scroll={{ x: 400 }}
						/>
					</TableS>
				)}
			</TableViewerS>
		</WrapViewer>
	);
};

export default TableViewer;
