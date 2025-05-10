import {
	Form,
	useActionData,
	useLocation,
	useSearchParams,
} from "@remix-run/react";
import type { TableRowSelection } from "antd/es/table/interface";
import type * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { ROLE } from "~/commons/core.const";
import jp from "~/commons/locales/jp";
import Button from "~/components/atoms/Button";
import Icon from "~/components/atoms/Icon";
import Input from "~/components/atoms/Input";
import Modal from "~/components/atoms/Modal";
import notification from "~/components/atoms/Notification";
import Table, { type TableColumnsType } from "~/components/atoms/Table";
import {
	formatDate,
	updateMultipleSearchParams,
} from "~/components/molecules/Common/utils";
import UploadStatusTag from "~/components/pages/AccountManagement/UploadStatusTag";
import {
	AccountsTableS,
	ModalContent,
	TableS,
} from "~/components/pages/AccountManagement/styles";
import type { DataTableAccountsType } from "~/components/pages/AccountManagement/types";
import type { AccountManagementI } from "~/models/accountManagementModel";
import {
	ACTION_TYPES_USER,
	type Metadata,
	type UserResponse,
	type UsersResponse,
} from "~/models/userModel";
import type { ApiResponse } from "~/repositories/utils";
import { theme } from "~/styles/theme";

type AccountTableProps = {
	currentUser: AccountManagementI;
	data: UsersResponse;
	userItems: DataTableAccountsType[];
	setUserItems: (val: DataTableAccountsType[]) => void;
};

const AccountTable: React.FC<AccountTableProps> = ({
	currentUser,
	data,
	userItems,
	setUserItems,
}: AccountTableProps) => {
	// Remix
	const [searchParams, setSearchParams] = useSearchParams();
	const actionData = useActionData<ApiResponse<UsersResponse>>();
	const location = useLocation();

	// State
	const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
	const [filters, setFilters] = useState({
		keyword: searchParams.get("keyword") || "",
	});
	const [isLoading, setIsLoading] = useState(false);
	const userUIDs = useMemo(
		() => JSON.stringify(userItems.map((item) => item.uid)),
		[userItems],
	);

	const isAdminRole = currentUser && currentUser.role === ROLE.ADMIN;
	const isDisableButtonDelete =
		userItems.length === 0 ||
		!isAdminRole ||
		(currentUser && currentUser.userId === userItems[0]?.uid);
	const [isModalDeleteOpen, setIsModalDeleteOpen] = useState(false);
	const updateParams = (params: Record<string, string | null>) => {
		updateMultipleSearchParams(searchParams, setSearchParams, params);
	};

	const columns: TableColumnsType<DataTableAccountsType> = [
		{
			title: "Mail address",
			dataIndex: "email",
			width: 50,
		},
		{
			title: "Permission",
			dataIndex: "permission",
			render: (data: {
				role: ROLE;
				uc: string[];
			}) => {
				return (
					<>
						{data.role && <UploadStatusTag role={data.role} />}
						{data?.uc.map((uc, index) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: FIXME
							<UploadStatusTag key={`${index}`} uc={uc} />
						))}
					</>
				);
			},
			width: 50,
		},
		{
			title: "Created At",
			dataIndex: "metadata",
			render: (metadata: Metadata) => {
				const isoDate = new Date(metadata.creationTime).toISOString();
				return formatDate(isoDate);
			},
			width: 50,
		},
	];
	useEffect(() => {
		if (data) {
			setIsLoading(false);
		}
	}, [data]);
	const initialDataSource = data.data.items.users.map<DataTableAccountsType>(
		(item) => ({
			...item,
			key: item?.uid,
			id: item?.id,
			permission: {
				role: item.role,
				uc: item.useCases,
			},
			displayName: item?.uid,
			email: item?.email,
			createdAt: formatDate(
				new Date(item.metadata?.creationTime).toISOString(),
			),
		}),
	);

	const handleSelectChange = (
		newSelectedRowKeys: React.Key[],
		selectedRows: DataTableAccountsType[],
	) => {
		setSelectedRowKeys(newSelectedRowKeys);
		setUserItems(selectedRows);
	};

	const rowSelection: TableRowSelection<DataTableAccountsType> = {
		selectedRowKeys,
		onChange: handleSelectChange,
	};

	const handleFilterChange = (updates: Partial<typeof filters>) => {
		const newFilters = { ...filters, ...updates };
		setFilters(newFilters);
		setIsLoading(true);

		updateParams({
			keyword: newFilters.keyword || null,
		});
		setUserItems([]);
		setSelectedRowKeys([]);
	};

	const handleDelete = () => {
		if (!isAdminRole) return;

		setIsModalDeleteOpen(true);
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: FIXME
	useEffect(() => {
		if (actionData) {
			const data = actionData as
				| ApiResponse<UsersResponse | null>
				| UserResponse;
			if (!data.status) {
				notification.error({
					message: jp.message.common.failed,
					description: data.error,
					placement: "topRight",
				});
				return;
			}
			notification.success({
				message: jp.message.common.successful,
				placement: "topRight",
			});
			switch (actionData?.actionType) {
				case ACTION_TYPES_USER.ADD_UC:
				case ACTION_TYPES_USER.SWITCH_ROLE: {
					const account = data as UserResponse;
					const updatedUserItems = userItems.map(
						(item: DataTableAccountsType, index: number) => {
							if (index !== 0) return item;

							return {
								...item,
								role: account.data.role || item.role,
								useCaseIds: Array.isArray(account.data.useCaseIds)
									? [...(item.useCaseIds || []), ...account.data.useCaseIds]
									: item.useCaseIds || [],
							};
						},
					);

					setUserItems(updatedUserItems);
					break;
				}
				default: {
					setUserItems([]);
					setSelectedRowKeys([]);
					setIsModalDeleteOpen(false);
				}
			}
		}
	}, [actionData]);

	useEffect(() => {
		setFilters({ keyword: searchParams.get("keyword") || "" });
	}, [searchParams]);

	return (
		<AccountsTableS>
			<div className="filter-table">
				<div className="filter">
					<Input
						placeholder="User Search"
						value={filters.keyword}
						onChange={(e) =>
							setFilters((prev) => ({
								...prev,
								keyword: e.target.value,
							}))
						}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								handleFilterChange({ keyword: filters.keyword });
							}
						}}
						className="input-search"
					/>
					<button
						type="button"
						onClick={() => handleFilterChange({ keyword: filters.keyword })}
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
								selectedRowKeys.includes(record.uid) ? "selected-row" : ""
							}
							scroll={{ x: 1200 }}
							loading={isLoading}
						/>
					</TableS>
				)}
			</div>

			<div className="button-bottom">
				<Button
					type="primary"
					disabled={isDisableButtonDelete}
					danger
					ghost
					onClick={handleDelete}
					icon={<Icon icon="trash" size={16} />}
					className="button-delete"
				>
					Delete User
				</Button>
			</div>

			<Modal
				centered
				open={isModalDeleteOpen}
				onCancel={() => setIsModalDeleteOpen(false)}
				title="Delete User"
				footer={null}
			>
				<ModalContent>
					<div className="modal-item">
						<p className="question">ユーザーを削除しますか？</p>
						<div className="name">
							<Icon icon="schema" size={16} />
							<span>{userItems.length > 0 && userItems[0].email}</span>
						</div>
					</div>

					<Form
						method="DELETE"
						className="form"
						action={`${location.pathname}${location.search}`}
					>
						<Input type="hidden" name="userIds" value={userUIDs} />
						<Button
							htmlType="submit"
							type="default"
							name="_action"
							value="delete"
							key="delete"
						>
							Delete
						</Button>
						<Button
							htmlType="button"
							type="primary"
							onClick={() => setIsModalDeleteOpen(false)}
							key="cancel"
						>
							Cancel
						</Button>
					</Form>
				</ModalContent>
			</Modal>
		</AccountsTableS>
	);
};

export default AccountTable;
