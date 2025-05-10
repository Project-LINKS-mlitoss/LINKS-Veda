import {
	Form,
	useActionData,
	useLocation,
	useNavigate,
	useSearchParams,
} from "@remix-run/react";
import type { PaginationProps } from "antd";
import { Pagination } from "antd";
import type { TableRowSelection } from "antd/es/table/interface";
import type * as React from "react";
import { useEffect, useMemo, useState } from "react";
import jp from "~/commons/locales/jp";
import Button from "~/components/atoms/Button";
import Icon from "~/components/atoms/Icon";
import Input from "~/components/atoms/Input";
import Modal from "~/components/atoms/Modal";
import notification from "~/components/atoms/Notification";
import Table, { type TableColumnsType } from "~/components/atoms/Table";
import {
	DefaultCurrent,
	DefaultPageSize,
	PageSizeOptions,
} from "~/components/molecules/Common";
import {
	formatDate,
	updateMultipleSearchParams,
} from "~/components/molecules/Common/utils";
import { ModalContent } from "~/components/pages/Assets/styles";
import {
	ChatTableS,
	TableS,
	WrapFilterTable,
} from "~/components/pages/Chat/styles";
import type { DataTableChatType } from "~/components/pages/Chat/types";
import type { AssetsResponse } from "~/models/asset";
import { ACTION_TYPES_CHAT } from "~/models/chat";
import type { ChatResponse } from "~/models/contentChatModel";
import type { ApiResponse } from "~/repositories/utils";
import { routes } from "~/routes/routes";
import { theme } from "~/styles/theme";

const showTotal: PaginationProps["showTotal"] = (total) => {
	return jp.common.totalItems(total);
};

type ChatProps = {
	data: ChatResponse;
	chatItems: DataTableChatType[];
	setChatItems: (val: DataTableChatType[]) => void;
};

const ChatTable: React.FC<ChatProps> = ({
	data,
	chatItems,
	setChatItems,
}: ChatProps) => {
	// Remix
	const [searchParams, setSearchParams] = useSearchParams();
	const updateParams = (params: Record<string, string | null>) => {
		updateMultipleSearchParams(searchParams, setSearchParams, params);
	};
	const navigate = useNavigate();
	const location = useLocation();
	const fullPath = `${location.pathname}${location.search}`;
	// State
	const [isLoading, setIsLoading] = useState(false);
	const actionData = useActionData<ApiResponse<ChatResponse>>();
	const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
	const [isModalDeleteOpen, setIsModalDeleteOpen] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [filters, setFilters] = useState({
		keyword: searchParams.get("keyword") || "",
		page: Number(searchParams.get("page")) || DefaultCurrent,
		perPage: Number(searchParams.get("perPage")) || DefaultPageSize,
	});
	const chatIds = useMemo(
		() => JSON.stringify(chatItems.map((item) => item.id)),
		[chatItems],
	);
	const isDisableButton = chatItems.length === 0;

	const columns: TableColumnsType<DataTableChatType> = [
		{
			title: jp.asset.fileNameContent,
			dataIndex: "fileName",
			width: 250,
		},
		{
			title: jp.common.createdBy,
			dataIndex: "createdBy",
			width: 50,
		},
		{
			title: jp.common.createdAt,
			dataIndex: "createdAt",
			width: 50,
		},
	];

	useEffect(() => {
		if (data) {
			setIsLoading(false);
		}
	}, [data]);

	useEffect(() => {
		setFilters({
			keyword: searchParams.get("keyword") || "",
			page: Number(searchParams.get("page")) || DefaultCurrent,
			perPage: Number(searchParams.get("perPage")) || DefaultPageSize,
		});
	}, [searchParams]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: FIXME
	useEffect(() => {
		if (actionData) {
			const data = actionData as ApiResponse<AssetsResponse | null>;
			if (typeof data?.status === "boolean") {
				if (data?.status === true) {
					notification.success({
						message: jp.message.common.successful,
						placement: "topRight",
					});
				} else {
					notification.error({
						message: jp.message.common.failed,
						description: data.error,
						placement: "topRight",
					});
				}
			}
			setChatItems([]);
			setSelectedRowKeys([]);
			setIsModalDeleteOpen(false);
			setIsDeleting(false);
		}
	}, [actionData]);

	const initialDataSource = data?.models
		.filter(
			(
				item,
			): item is {
				id: number;
				contentName?: string;
				username?: string;
				createdAt?: string;
			} => !!item?.id,
		)
		.map<DataTableChatType>((item) => ({
			...item,
			key: item.id,
			id: item.id,
			fileName: item.contentName ?? "",
			createdBy: item.username ?? "N/A",
			createdAt: item.createdAt ? formatDate(item.createdAt) : "N/A",
		}));

	const handleSelectChange = (
		newSelectedRowKeys: React.Key[],
		selectedRows: DataTableChatType[],
	) => {
		setSelectedRowKeys(newSelectedRowKeys);
		setChatItems(selectedRows);
	};

	const rowSelection: TableRowSelection<DataTableChatType> = {
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
		setChatItems([]);
		setSelectedRowKeys([]);
	};

	const handleDelete = () => {
		setIsModalDeleteOpen(true);
	};

	const handleCancel = () => {
		setIsModalDeleteOpen(false);
	};

	return (
		<ChatTableS>
			<WrapFilterTable>
				<div className="filter">
					<Input
						placeholder={jp.common.tableSearchContent}
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
							scroll={{ x: 800 }}
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
					pageSizeOptions={PageSizeOptions}
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
					type="primary"
					className="button-message"
					icon={<Icon icon="chat" size={16} />}
					disabled={isDisableButton}
					onClick={() => {
						const ids = chatItems.map((item) => item.id).join(",");
						navigate(`${routes.chat}/${ids}`);
					}}
				>
					チャットを開始する
				</Button>
				<Button
					type="primary"
					disabled={isDisableButton}
					danger
					ghost
					onClick={handleDelete}
					icon={<Icon icon="trash" size={16} />}
					className="button-delete"
				>
					ベクトルデータ削除
				</Button>
			</div>
			<Modal
				centered
				open={isModalDeleteOpen}
				onCancel={handleCancel}
				title="ベクトルデータ削除"
				footer={null}
			>
				<ModalContent>
					<p className="question">ベクトルデータを削除しますか</p>
					<div className="name">
						<Icon icon="fileViewer" size={16} />
						<span>{chatItems.length > 0 && chatItems[0].contentName}</span>
					</div>

					<Form method="DELETE" className="form" action={fullPath}>
						<Input type="hidden" name="chatIds" value={chatIds} />
						<Button
							htmlType="submit"
							type="default"
							name="_action"
							value={ACTION_TYPES_CHAT.DELETE}
							key="delete"
							loading={isDeleting}
							onClick={() => setIsDeleting(true)}
						>
							{jp.common.delete}
						</Button>
						<Button
							htmlType="button"
							type="primary"
							onClick={handleCancel}
							key="cancel"
						>
							{jp.common.cancel}
						</Button>
					</Form>
				</ModalContent>
			</Modal>
		</ChatTableS>
	);
};

export default ChatTable;
