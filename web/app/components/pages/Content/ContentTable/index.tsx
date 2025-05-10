import {
	Form,
	useActionData,
	useFetcher,
	useLocation,
	useNavigate,
	useSearchParams,
} from "@remix-run/react";
import type { PaginationProps } from "antd";
import { Pagination } from "antd";
import type { TableRowSelection } from "antd/es/table/interface";
import type * as React from "react";
import { useEffect, useMemo, useState } from "react";
import type { CONTENT_MANAGEMENT_STATUS_TYPE } from "~/commons/core.const";
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
	formatDateToUTC,
	updateMultipleSearchParams,
} from "~/components/molecules/Common/utils";
import SelectOperatorModal from "~/components/pages/Content/ContentTable/Modal/SelectOperatorModal";
import UploadStatusTag from "~/components/pages/Content/UploadStatusTag";
import {
	ContentsTableS,
	ModalContent,
	TableS,
} from "~/components/pages/Content/styles";
import type { DataTableContentType } from "~/components/pages/Content/types";
import {
	ACTION_TYPES_CONTENT,
	type ContentItem,
	type ContentResponse,
} from "~/models/content";
import type { ApiResponse, SuccessResponse } from "~/repositories/utils";
import { routes } from "~/routes/routes";
import { theme } from "~/styles/theme";
import { downloadFileFromUrls } from "~/utils/file";

const showTotal: PaginationProps["showTotal"] = (total) => {
	return jp.common.totalItems(total);
};

type ContentProps = {
	data: ContentResponse;
	contentItems: DataTableContentType[];
	setContentItems: (val: DataTableContentType[]) => void;
};

const ContentsTable: React.FC<ContentProps> = ({
	data,
	contentItems,
	setContentItems,
}) => {
	const [searchParams, setSearchParams] = useSearchParams();
	const actionData =
		useActionData<ApiResponse<ContentResponse | ContentItem>>();
	const [isLoading, setIsLoading] = useState(false);
	const updateParams = (params: Record<string, string | null>) => {
		updateMultipleSearchParams(searchParams, setSearchParams, params);
	};
	const navigate = useNavigate();
	const location = useLocation();
	const fullPath = `${location.pathname}${location.search}`;

	const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
	const [filters, setFilters] = useState({
		keyword: searchParams.get("keyword") || "",
		page: Number(searchParams.get("page")) || DefaultCurrent,
		perPage: Number(searchParams.get("perPage")) || DefaultPageSize,
	});
	const [contentItem, setContentItem] = useState<DataTableContentType | null>();
	const contentIds = useMemo(
		() => JSON.stringify(contentItems.map((item) => item.id)),
		[contentItems],
	);
	const contentId = useMemo(
		() => (contentItems.length > 0 ? contentItems[0].id : ""),
		[contentItems],
	);
	const isDisableDuplicate = useMemo(
		() =>
			!!contentItems[0] &&
			(!!contentItems[0].duplicateContent ||
				!!contentItems[0].management?.parentContentId),
		[contentItems],
	);
	const [duplicateContent, setDuplicateContent] = useState<ContentItem | null>(
		null,
	);
	const isDisableButtonDelete = contentItems.length === 0;
	const isDisableDownloadBtn =
		contentItems.length === 0 ||
		(!contentItems[0]?.management?.assetUrl &&
			!contentItems[0]?.visualize?.assetUrl);
	const isDisableButton = contentItems.length !== 1;
	const [isModalDeleteOpen, setIsModalDeleteOpen] = useState(false);
	const [isModalEditOpen, setIsModalEditOpen] = useState(false);
	const [isModalEditNameOpen, setIsModalEditNameOpen] = useState(false);
	const [isModalDuplicateOpen, setIsModalDuplicateOpen] = useState(false);
	const [isModalSelectOperatorOpen, setIsModalSelectOperatorOpen] =
		useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const columns: TableColumnsType<DataTableContentType> = [
		{
			title: "",
			dataIndex: "edit",
			width: 10,
			render: (_, record) => (
				<button
					type="button"
					onClick={() => {
						setSelectedRowKeys([record.key]);
						setContentItems([record]);
						navigate(`${record.id}`);
					}}
				>
					<Icon icon="editTwoTone" size={16} />
				</button>
			),
		},
		{
			title: jp.content.fileNameContent,
			dataIndex: "fileName",
			width: 200,
		},
		{
			title: jp.common.publishStatus,
			dataIndex: "types",
			render: (types: CONTENT_MANAGEMENT_STATUS_TYPE[]) =>
				types.map((type: CONTENT_MANAGEMENT_STATUS_TYPE) => (
					<UploadStatusTag key={type} status={type} />
				)),
			width: 150,
		},
		{
			title: jp.common.createdBy,
			dataIndex: "createdBy",
			width: 100,
		},
		{
			title: jp.common.createdAt,
			dataIndex: "createdAt",
			width: 70,
		},
		{
			title: jp.common.updatedBy,
			dataIndex: "updatedBy",
			width: 100,
		},
		{
			title: jp.common.updatedAt,
			dataIndex: "updatedAt",
			width: 70,
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

	const initialDataSource = data?.models.map<DataTableContentType>(
		(item, i) => {
			return {
				...item,
				key: item?.id,
				id: item?.id,
				fileName: item?.name,
				types: item?.types ?? [],
				createdBy: item.createdBy ?? "N/A",
				createdAt: formatDate(item?.createdAt),
				updatedBy: item.createdBy ?? "N/A",
				updatedAt: formatDate(item?.updatedAt),
				updatedAtTime: formatDateToUTC(item?.updatedAt, "/"),
			};
		},
	);

	const handleSelectChange = (
		newSelectedRowKeys: React.Key[],
		selectedRows: DataTableContentType[],
	) => {
		setSelectedRowKeys(newSelectedRowKeys);
		setContentItems(selectedRows);
	};

	const rowSelection: TableRowSelection<DataTableContentType> = {
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
		setContentItems([]);
		setSelectedRowKeys([]);
	};

	const handleDelete = () => {
		setIsModalDeleteOpen(true);
	};

	const handleUpdate = () => {
		navigate(`${contentItems[0]?.id}${location.search}`);
		setIsModalEditOpen(false);
	};

	const handleEdit = () => {
		setIsModalEditOpen(true);
	};

	const handleEditName = () => {
		setIsModalEditNameOpen(true);
		setIsModalEditOpen(false);
		setContentItem(contentItems[0] ?? null);
	};

	const handleChangeContentName = (e: React.ChangeEvent<HTMLInputElement>) => {
		setContentItem((prevItem) => ({
			// biome-ignore lint/style/noNonNullAssertion: FIXME
			...prevItem!,
			fileName: e.target.value || "",
		}));
	};

	const handleChangeDuplicateName = (
		e: React.ChangeEvent<HTMLInputElement>,
	) => {
		setDuplicateContent((prevItem) => ({
			// biome-ignore lint/style/noNonNullAssertion: FIXME
			...prevItem!,
			name: e.target.value || "",
		}));
	};

	const handleCancelEditName = () => {
		setIsModalEditNameOpen(false);
	};

	const handleSelectOperator = () => {
		setIsModalSelectOperatorOpen(true);
	};

	const handleDuplicate = () => {
		if (isDisableDuplicate) return;

		setIsModalDuplicateOpen(true);
		setIsModalEditOpen(false);
		const content = contentItems[0]
			? { ...contentItems[0], name: `${contentItems[0].name}のコピー` }
			: null;

		setDuplicateContent(content);
	};

	const handleDownloadContent = async () => {
		if (isDisableDownloadBtn) {
			notification.error({
				message: jp.message.content.downloadFailed,
				description: jp.message.content.noFilesAvailable,
				placement: "topRight",
			});
			return;
		}

		const downloadLinks = [];
		if (contentItems[0]?.management?.assetUrl) {
			downloadLinks.push({
				url: contentItems[0]?.management.assetUrl,
				prefix: "オープンデータ",
			});
		}
		if (contentItems[0]?.visualize?.assetUrl) {
			downloadLinks.push({
				url: contentItems[0]?.visualize.assetUrl,
				prefix: "可視化利用",
			});
		}
		const error = await downloadFileFromUrls(downloadLinks, true);
		if (error) {
			notification.error({
				message: jp.message.common.failed,
				description: error,
				placement: "topRight",
			});
		}
	};

	// Effect
	// Handle response
	// biome-ignore lint/correctness/useExhaustiveDependencies: FIXME
	useEffect(() => {
		if (actionData && actionData?.actionType !== ACTION_TYPES_CONTENT.SAVE) {
			if (actionData.status === false) {
				notification.error({
					message: jp.message.common.failed,
					description: actionData.error,
					placement: "topRight",
				});
				const updatedContentItems = contentItems.map(
					(item: ContentItem, index: number) => {
						if (index !== 0) return item;

						const { publicStatus, ...restManagement } = item.management || {};
						const { publicStatus: publicStatusVisualize, ...restVisualize } =
							item.visualize || {};
						return {
							...item,
							management:
								actionData.actionType === ACTION_TYPES_CONTENT.CREATE_ASSET
									? { ...restManagement, publicStatus: undefined }
									: item.management,
							visualize:
								actionData.actionType ===
								ACTION_TYPES_CONTENT.CREATE_ASSET_VISUALIZE
									? { ...restVisualize, publicStatus: undefined }
									: item.visualize,
						};
					},
				);

				setContentItems(updatedContentItems as DataTableContentType[]);
				return;
			}
			notification.success({
				message: jp.message.common.successful,
				placement: "topRight",
			});
			switch (actionData?.actionType) {
				case ACTION_TYPES_CONTENT.PUBLISH:
				case ACTION_TYPES_CONTENT.PUBLISH_VISUALIZE:
				case ACTION_TYPES_CONTENT.CREATE_CHAT:
				case ACTION_TYPES_CONTENT.CREATE_ASSET:
				case ACTION_TYPES_CONTENT.DUPLICATE:
				case ACTION_TYPES_CONTENT.SAVE_METADATA:
				case ACTION_TYPES_CONTENT.CREATE_ASSET_VISUALIZE: {
					const updatedContentItems = contentItems.map(
						(item: ContentItem, index: number) => {
							if (index !== 0) return item;

							const { publicStatus, ...restManagement } = item.management || {};
							const { publicStatus: publicStatusVisualize, ...restVisualize } =
								item.visualize || {};

							const data = (actionData as SuccessResponse<ContentItem>).data;
							return {
								...item,
								schema: data?.schema
									? { ...item.schema, ...data.schema }
									: item.schema,
								management: data?.management
									? { ...restManagement, ...data.management }
									: restManagement,
								chat: data?.chat ? { ...item.chat, ...data.chat } : item.chat,
								visualize: data?.visualize
									? { ...restVisualize, ...data.visualize }
									: restVisualize,
								duplicateContent: data?.duplicateContent
									? { ...item.duplicateContent, ...data.duplicateContent }
									: item.duplicateContent,
								metadata: data?.metadata
									? { ...item.metadata, ...data.metadata }
									: item.metadata,
							};
						},
					);

					setContentItems(updatedContentItems as DataTableContentType[]);
					break;
				}
				default: {
					setContentItems([]);
					setSelectedRowKeys([]);
				}
			}
			setIsModalDeleteOpen(false);
			setIsModalEditNameOpen(false);
			setIsModalDuplicateOpen(false);
			setIsDeleting(false);
		}
	}, [actionData]);

	return (
		<ContentsTableS>
			<div className="filter-table">
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
							scroll={{ x: 1200 }}
							loading={isLoading}
						/>
					</TableS>
				)}
			</div>

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
					icon={<Icon icon="edit" size={16} />}
					disabled={isDisableButton}
					onClick={handleEdit}
					type="primary"
					ghost
				>
					{jp.common.content}
					{jp.common.edit}
				</Button>
				<Button
					type="primary"
					disabled={isDisableButtonDelete}
					danger
					ghost
					onClick={handleDelete}
					icon={<Icon icon="trash" size={16} />}
					className="button-delete"
				>
					{jp.common.content}
					{jp.common.delete}
				</Button>
				<Button
					disabled={isDisableDownloadBtn}
					onClick={handleDownloadContent}
					icon={<Icon icon="download" size={16} />}
				>
					{jp.common.download}
				</Button>
				<Button
					icon={<Icon icon="swap" size={16} />}
					disabled={isDisableButton}
					onClick={handleSelectOperator}
				>
					{jp.common.operator}
				</Button>
				<Button
					icon={<Icon icon="templateSchema" size={16} />}
					disabled={isDisableButton}
				>
					{jp.common.template}
				</Button>
			</div>

			<Modal
				centered
				open={isModalDeleteOpen}
				onCancel={() => setIsModalDeleteOpen(false)}
				title={`${jp.common.content}${jp.common.delete}`}
				footer={null}
			>
				<ModalContent>
					<div className="modal-item">
						<p className="question">コンテンツを削除しますか？</p>
						<div className="name">
							<Icon icon="schema" size={16} />
							<span>{contentItems.length > 0 && contentItems[0].fileName}</span>
						</div>
					</div>

					<Form method="DELETE" className="form" action={fullPath}>
						<Input type="hidden" name="contentIds" value={contentIds} />
						<Button
							htmlType="submit"
							type="default"
							name="_action"
							value="delete"
							key="delete"
							loading={isDeleting}
							onClick={() => setIsDeleting(true)}
						>
							{jp.common.delete}
						</Button>
						<Button
							htmlType="button"
							type="primary"
							onClick={() => setIsModalDeleteOpen(false)}
							key="cancel"
						>
							{jp.common.cancel}
						</Button>
					</Form>
				</ModalContent>
			</Modal>

			<Modal
				centered
				open={isModalEditOpen}
				onCancel={() => setIsModalEditOpen(false)}
				title={`${jp.common.content}${jp.common.edit}`}
				footer={false}
			>
				<ModalContent>
					<div className="edit-modal">
						<Button
							htmlType="button"
							type="default"
							onClick={handleEditName}
							key="rename"
						>
							名前の変更
						</Button>
						<Button
							htmlType="button"
							type="default"
							onClick={handleUpdate}
							key="update"
						>
							コンテンツ更新
						</Button>
						<Button
							htmlType="button"
							type="default"
							disabled={isDisableDuplicate}
							onClick={handleDuplicate}
							key="duplicate"
						>
							コンテンツ複製
						</Button>
					</div>
				</ModalContent>
			</Modal>

			<Modal
				centered
				open={isModalEditNameOpen}
				onCancel={() => setIsModalEditNameOpen(false)}
				footer={null}
				title="コンテンツ名"
			>
				<ModalContent>
					<div className="modal-item">
						<p className="question">コンテンツの名前を変更しますか？</p>
						<div className="name">
							<Icon icon="schema" size={16} />
							<span>{contentItems.length > 0 && contentItems[0].fileName}</span>
						</div>
					</div>

					<Form method="POST" className="form-edit-name" action={fullPath}>
						<label htmlFor="name">
							{jp.common.content}
							{jp.common.name}:
						</label>
						<Input
							id="name"
							name="name"
							placeholder="名前を入力してください"
							value={contentItem?.fileName ?? ""}
							onChange={handleChangeContentName}
						/>

						<Input type="hidden" name="contentId" value={contentId} />

						<div className="buttons">
							<Button
								htmlType="button"
								type="default"
								key="cancel"
								onClick={handleCancelEditName}
							>
								{jp.common.cancel}
							</Button>
							<Button
								htmlType="submit"
								type="primary"
								name="_action"
								value="rename"
								key="rename"
							>
								{jp.common.apply}
							</Button>
						</div>
					</Form>
				</ModalContent>
			</Modal>

			<Modal
				centered
				open={isModalDuplicateOpen}
				onCancel={() => setIsModalDuplicateOpen(false)}
				footer={null}
				title={"コンテンツの複製"}
			>
				<ModalContent>
					<div className="modal-item">
						<p className="question">
							<p>コンテンツを複製しますか？</p>
							複製元との紐づきは、コンテンツの管理パネルから確認できます
						</p>
						<p className="question">複製元コンテンツ</p>
						<div className="name">
							<Icon icon="schema" size={16} />
							<span>{contentItems.length > 0 && contentItems[0].fileName}</span>
						</div>
					</div>

					<Form method="POST" className="form-edit-name" action={fullPath}>
						<label htmlFor="name">複製先コンテンツの名前を入力</label>
						<Input
							id="name"
							name="name"
							placeholder="名前を入力してください"
							value={duplicateContent?.name ?? ""}
							onChange={handleChangeDuplicateName}
						/>

						<Input type="hidden" name="contentId" value={contentId} />
						<div className="buttons">
							<Button
								htmlType="button"
								type="default"
								key="cancel"
								onClick={() => setIsModalDuplicateOpen(false)}
							>
								{jp.common.cancel}
							</Button>
							<Button
								htmlType="submit"
								type="primary"
								name="_action"
								value="duplicate"
								key="duplicate"
							>
								{jp.common.duplicate}
							</Button>
						</div>
					</Form>
				</ModalContent>
			</Modal>

			<SelectOperatorModal
				isModalSelectOperatorOpen={isModalSelectOperatorOpen}
				setIsModalSelectOperatorOpen={setIsModalSelectOperatorOpen}
				contentItem={contentItems[0]}
			/>
		</ContentsTableS>
	);
};

export default ContentsTable;
