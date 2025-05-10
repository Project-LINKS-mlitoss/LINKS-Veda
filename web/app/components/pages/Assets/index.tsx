import {
	Form,
	useActionData,
	useFetcher,
	useLocation,
	useSearchParams,
} from "@remix-run/react";
import { Pagination } from "antd";
import type { PaginationProps } from "antd";
import type { TableRowSelection } from "antd/es/table/interface";
import Upload, {
	type UploadFile,
	type UploadProps,
} from "app/components/atoms/Upload";
import type * as React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import {
	DEFAULT_SIZE_LEFT,
	DEFAULT_SIZE_RIGHT,
	DEFAULT_SIZE_TOTAL,
	MIN_WIDTHS,
	MIN_WIDTH_LEFT_CENTER_LARGE,
	MIN_WIDTH_RIGHT,
} from "~/commons/core.const";
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
import ContentViewer from "~/components/molecules/Common/ViewerAsset/ContentViewer";
import FileViewer from "~/components/molecules/Common/ViewerAsset/FileViewer";
import FolderViewer from "~/components/molecules/Common/ViewerAsset/FolderViewer";
import GISViewer from "~/components/molecules/Common/ViewerAsset/GISViewer";
import {
	type DataTypeFolderViewer,
	LAYOUT_PREVIEW_TYPE,
} from "~/components/molecules/Common/ViewerAsset/types";
import WrapContent from "~/components/molecules/Common/WrapContent";
import {
	calculateMinWidths,
	formatDate,
	formatFileSize,
	updateMultipleSearchParams,
} from "~/components/molecules/Common/utils";
import {
	AssetViewerS,
	AssetsPageS,
	ModalContent,
	TableS,
	WrapFilterTable,
} from "~/components/pages/Assets/styles";
import type {
	DataTableAssetsType,
	UploadListItemProps,
} from "~/components/pages/Assets/types";
import { AllowTypes, checkPreviewType } from "~/components/pages/Assets/utils";
import useElementWidth from "~/hooks/useElementWidth";
import {
	type AssetItem,
	type AssetsResponse,
	type UploadQueueItem,
	UploadingFormStatus,
	getFileUploadStatus,
} from "~/models/asset";
import type { ApiResponse } from "~/repositories/utils";
import { routes } from "~/routes/routes";
import { theme } from "~/styles/theme";

const { Dragger } = Upload;

const showTotal: PaginationProps["showTotal"] = (total) => {
	return jp.common.totalItems(total);
};

const UploadListItem = ({ originNode }: UploadListItemProps) => {
	return <div className={"text-blue-500"}>{originNode}</div>;
};

type AssetsPageProps = {
	data: AssetsResponse;
	onUpload: (data: UploadFile[]) => void;
	onCancel: () => void;
	queueList: UploadQueueItem[];
	formStatus: number;
};

const AssetsPage: React.FC<AssetsPageProps> = ({
	data,
	onUpload,
	onCancel,
	queueList,
	formStatus,
}) => {
	// Remix
	const [searchParams, setSearchParams] = useSearchParams();
	const fetchAssetsDetail = useFetcher<ApiResponse<AssetItem>>();
	const actionData = useActionData<ApiResponse<AssetsResponse>>();
	const [isLoading, setIsLoading] = useState(false);
	const updateParams = (params: Record<string, string | null>) => {
		updateMultipleSearchParams(searchParams, setSearchParams, params);
	};
	const location = useLocation();
	const fullPath = `${location.pathname}${location.search}`;

	// State
	const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
	const [filters, setFilters] = useState({
		keyword: searchParams.get("keyword") || "",
		page: Number(searchParams.get("page")) || DefaultCurrent,
		perPage: Number(searchParams.get("perPage")) || DefaultPageSize,
	});
	const [assetItems, setAssetItems] = useState<DataTableAssetsType[]>([]);
	const assetIds = useMemo(
		() => JSON.stringify(assetItems.map((item) => item.id)),
		[assetItems],
	);
	const [assetDetail, setAssetDetail] = useState<AssetItem | null>();
	const [assetItemFolderViewer, setAssetItemFolderViewer] = useState<
		DataTypeFolderViewer[]
	>([]);
	const baseUrl = assetDetail?.url.split("/").slice(0, -1).join("/");
	const [previewType, setPreviewType] = useState<number>(0);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const isBtnDisabled = assetItems.length === 0;
	const [isDeleting, setIsDeleting] = useState(false);

	// biome-ignore lint/correctness/useExhaustiveDependencies: FIXME
	useEffect(() => {
		if (assetItems.length === 1) {
			fetchAssetsDetail.load(`${routes.asset}/${assetItems[0].id}`);
		} else {
			setAssetDetail(null);
		}
	}, [assetItems]);

	useEffect(() => {
		if (fetchAssetsDetail?.data?.status && assetItems.length === 1) {
			if (fetchAssetsDetail?.data?.data?.id === assetItems[0]?.id) {
				setAssetDetail(fetchAssetsDetail?.data?.data);
			}
		}
	}, [fetchAssetsDetail, assetItems]);

	const columns: TableColumnsType<DataTableAssetsType> = [
		{ title: jp.asset.fileNameAsset, dataIndex: "fileName", width: 200 },
		{ title: jp.common.type, dataIndex: "type", width: 50 },
		{ title: jp.common.size, dataIndex: "size", width: 70 },
		{ title: jp.common.updatedBy, dataIndex: "uploader", width: 100 },
		{ title: jp.common.uploadedAt, dataIndex: "uploadTime", width: 70 },
	];

	useEffect(() => {
		if (data) {
			setIsLoading(false);
		}
	}, [data]);
	const initialDataSource = data?.items.map<DataTableAssetsType>((item, i) => {
		const urlSplit = item?.url.split("/");
		const urlSplitTypeFile = item?.url.split(".");
		return {
			...item,
			key: item?.id,
			id: item?.id,
			fileName: decodeURIComponent(urlSplit[urlSplit.length - 1]),
			uploadStatus: item?.archiveExtractionStatus,
			type: urlSplitTypeFile[urlSplitTypeFile.length - 1],
			size: formatFileSize(item?.totalSize ?? 0),
			uploader: item?.createdBy ?? "N/A",
			uploadTime: formatDate(item?.createdAt),
		};
	});

	const handleSelectChange = (
		newSelectedRowKeys: React.Key[],
		selectedRows: DataTableAssetsType[],
	) => {
		setSelectedRowKeys(newSelectedRowKeys);
		setAssetItems(selectedRows);
	};

	const rowSelection: TableRowSelection<DataTableAssetsType> = {
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
	};

	useEffect(() => {
		setPreviewType(
			assetItems.length === 1 ? checkPreviewType(assetItems[0]) : 0,
		);
	}, [assetItems]);

	const handleDelete = () => {
		setIsModalOpen(true);
	};

	const handleCancel = () => {
		setIsModalOpen(false);
	};

	// upload
	const [open, setOpen] = useState(false);
	const [isUploading, setIsUploading] = useState(false);
	const [fileList, setFileList] = useState<UploadFile[]>([]);
	const [uploadEnabled, setUploadEnabled] = useState(false);

	const handleMenuClick = () => {
		setFileList([]);
		setOpen(true);
		setIsUploading(false);
	};

	useEffect(() => {
		setUploadEnabled(
			null != fileList &&
				fileList.length > 0 &&
				formStatus !== UploadingFormStatus.Uploading,
		);
	}, [fileList, formStatus]);

	const onCancelUpload = () => {
		setOpen(false);
		setIsUploading(false);
		setFileList([]);
		onCancel();
	};

	const props: UploadProps = {
		name: "file",
		beforeUpload: (file) => {
			setFileList([...fileList, file]);
			return false;
		},
		onRemove: (file) => {
			const index = fileList.indexOf(file);
			const newFileList = fileList.slice();
			newFileList.splice(index, 1);
			setFileList(newFileList);
		},
		disabled:
			formStatus === UploadingFormStatus.Uploading ||
			formStatus === UploadingFormStatus.Complete,
	};

	const uploadFile = () => {
		setIsUploading(true);
		if (fileList.length > 0) {
			onUpload(fileList);
		}
	};

	useEffect(() => {
		if (formStatus === UploadingFormStatus.Complete) {
			setOpen(false);
			setFileList([]);
		}
	}, [formStatus]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: ignore fileList changes
	useEffect(() => {
		if (queueList && queueList.length > 0) {
			const newFileList = [...fileList];
			newFileList.forEach((item, index) => {
				const filteredItems = queueList.filter(
					(queueItem) => queueItem.uid === item.uid,
				);
				if (filteredItems && filteredItems.length > 0) {
					item.status = getFileUploadStatus(filteredItems[0].status);
					item.percent = filteredItems[0].uploadProgress;
				}
			});
			setFileList(newFileList);
		}
	}, [queueList]);

	// Handle response
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
			setAssetItems([]);
			setSelectedRowKeys([]);
			setIsModalOpen(false);
			setIsDeleting(false);
		}
	}, [actionData]);

	// Resize col
	const maxSize = useElementWidth("wrap-content");
	const [minWidths, setMinWidths] = useState(MIN_WIDTHS);
	useEffect(() => {
		if (maxSize > 0) {
			setMinWidths(
				calculateMinWidths(
					maxSize,
					MIN_WIDTH_LEFT_CENTER_LARGE,
					MIN_WIDTH_RIGHT,
				),
			);
		}
	}, [maxSize]);
	// biome-ignore lint/suspicious/noExplicitAny: FIXME
	const leftRef = useRef<any>(null);
	// biome-ignore lint/suspicious/noExplicitAny: FIXME
	const rightRef = useRef<any>(null);
	useEffect(() => {
		const leftPanel = leftRef.current;
		const rightPanel = rightRef.current;
		if (leftPanel && rightPanel) {
			if (assetDetail) {
				leftPanel.resize(DEFAULT_SIZE_LEFT);
				rightPanel.resize(DEFAULT_SIZE_RIGHT);
			} else {
				leftPanel.resize(DEFAULT_SIZE_TOTAL);
				rightPanel.resize(0);
			}
		}
	}, [assetDetail]);

	useEffect(() => {
		setFilters({
			keyword: searchParams.get("keyword") || "",
			page: Number(searchParams.get("page")) || DefaultCurrent,
			perPage: Number(searchParams.get("perPage")) || DefaultPageSize,
		});
	}, [searchParams]);

	return (
		<AssetsPageS>
			<WrapContent
				breadcrumbItems={[
					{
						href: routes.asset,
						title: (
							<>
								<Icon
									icon="fileViewer"
									size={24}
									color={theme.colors.semiBlack}
								/>
								<span>アセット</span>
							</>
						),
					},
				]}
			>
				<AssetViewerS>
					<PanelGroup direction="horizontal">
						<Panel
							defaultSize={DEFAULT_SIZE_LEFT}
							minSize={minWidths.minWidthLeftCenter}
							ref={leftRef}
							className="left-item"
						>
							<WrapFilterTable>
								<div className="filter">
									<Input
										placeholder={jp.common.assetSearch}
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
										<Icon
											icon="search"
											size={16}
											color={theme.colors.lightGray}
										/>
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
												selectedRowKeys.includes(record.key)
													? "selected-row"
													: ""
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
									className="button-upload"
									icon={<Icon icon="upload" size={16} />}
									onClick={handleMenuClick}
								>
									{jp.common.uploadAsset}
								</Button>

								<div className="button-right">
									<Button
										type="primary"
										disabled={isBtnDisabled}
										danger
										ghost
										onClick={handleDelete}
										icon={<Icon icon="trash" size={16} />}
										className="button-delete"
									>
										{jp.common.asset}
										{jp.common.delete}
									</Button>
								</div>
							</div>
						</Panel>

						<PanelResizeHandle
							className="resize-handle"
							hidden={!assetDetail}
						/>

						<Panel
							minSize={assetDetail ? minWidths.minWidthRight : 0}
							ref={rightRef}
							hidden={!assetDetail}
							className="center-item"
						>
							{assetDetail ? (
								<>
									{previewType === LAYOUT_PREVIEW_TYPE.FILE && (
										<div className="file-viewer h-100">
											<FileViewer
												isPreview={!!assetDetail}
												assetItem={assetDetail}
												key={assetDetail?.url}
											/>
										</div>
									)}
									{previewType === LAYOUT_PREVIEW_TYPE.GIS_AND_CONTENT && (
										<>
											<div className="folder-viewer h-40 b-bottom">
												<GISViewer
													assetItem={assetDetail}
													key={assetDetail?.id}
												/>
											</div>
											<div className="file-viewer h-60">
												<ContentViewer assetItem={assetDetail} />
											</div>
										</>
									)}

									{previewType === LAYOUT_PREVIEW_TYPE.FOLDER_AND_FILE && (
										<>
											<div className="folder-viewer h-40 b-bottom">
												<FolderViewer
													assetFile={assetDetail.file}
													setAssetItemFolderViewer={setAssetItemFolderViewer}
												/>
											</div>
											<div className="file-viewer h-60">
												<FileViewer
													isPreview={assetItemFolderViewer?.length === 1}
													assetFile={{
														...assetItemFolderViewer[0],
														path: baseUrl + assetItemFolderViewer[0]?.path,
													}}
												/>
											</div>
										</>
									)}
								</>
							) : null}
						</Panel>
					</PanelGroup>
				</AssetViewerS>
			</WrapContent>

			<Modal
				centered
				open={isModalOpen}
				onCancel={handleCancel}
				title={`${jp.common.asset}${jp.common.delete}`}
				footer={null}
			>
				<ModalContent>
					<p className="question">アセットを削除しますか</p>
					<div className="name">
						<Icon icon="fileViewer" size={16} />
						<span>{assetItems.length > 0 && assetItems[0].fileName}</span>
					</div>

					<Form method="DELETE" className="form" action={fullPath}>
						<Input type="hidden" name="assetIds" value={assetIds} />
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
							onClick={handleCancel}
							key="cancel"
						>
							{jp.common.cancel}
						</Button>
					</Form>
				</ModalContent>
			</Modal>

			<Modal
				styles={{ content: { border: "none", borderRadius: 0 } }}
				title="アセットアップローダー"
				cancelText={jp.common.cancel}
				okText={jp.common.upload}
				open={open}
				onOk={uploadFile}
				okButtonProps={{ disabled: !uploadEnabled }}
				cancelButtonProps={{ disabled: isUploading }}
				onCancel={onCancelUpload}
				centered
			>
				<Dragger
					{...props}
					style={{ borderRadius: 0 }}
					accept={AllowTypes}
					fileList={fileList}
					itemRender={(originNode, file) => (
						<UploadListItem originNode={originNode} />
					)}
				>
					<p className="ant-upload-drag-icon">
						<Icon icon="inbox" />
					</p>
					<p className="ant-upload-text">{jp.common.clickOrDragToUpload}</p>
					<p className="ant-upload-hint">
						Support for a single or bulk upload. Strictly prohibited from
						uploading company data or other banned files.
					</p>
				</Dragger>
			</Modal>
		</AssetsPageS>
	);
};

export default AssetsPage;
