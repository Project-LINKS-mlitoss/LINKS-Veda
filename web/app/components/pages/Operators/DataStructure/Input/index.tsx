import { useFetcher } from "@remix-run/react";
import type React from "react";
import { useEffect, useState } from "react";
import jp from "~/commons/locales/jp";
import Button from "~/components/atoms/Button";
import Icon from "~/components/atoms/Icon";
import Input from "~/components/atoms/Input";
import Modal from "~/components/atoms/Modal";
import Table from "~/components/atoms/Table";
import ContentViewer from "~/components/molecules/Common/ViewerAsset/ContentViewer";
import FileViewer from "~/components/molecules/Common/ViewerAsset/FileViewer";
import FolderViewer from "~/components/molecules/Common/ViewerAsset/FolderViewer";
import GISViewer from "~/components/molecules/Common/ViewerAsset/GISViewer";
import {
	type DataTypeFolderViewer,
	LAYOUT_PREVIEW_TYPE,
} from "~/components/molecules/Common/ViewerAsset/types";
import WrapViewer from "~/components/molecules/Common/WrapViewer";
import {
	formatDateToUTC,
	formatFileSize,
} from "~/components/molecules/Common/utils";
import { FileType } from "~/components/pages/Assets/types";
import { checkPreviewType } from "~/components/pages/Assets/utils";
import {
	InputOperatorS,
	ModalChooseFile,
} from "~/components/pages/Operators/styles";
import {
	type AssetTableRecord,
	columnSelectedInput,
} from "~/components/pages/Operators/types";
import type { AssetItem, AssetsResponse, FileAsset } from "~/models/asset";
import type { ContentConfig, FilesArray } from "~/models/operators";
import type { ApiResponse } from "~/repositories/utils";
import { routes } from "~/routes/routes";
import { theme } from "~/styles/theme";

const columnsChooseFile = [
	{
		title: (
			<div className="col-name">
				<Icon icon="file" /> {jp.common.asset}
			</div>
		),
		dataIndex: "asset",
		key: "asset",
	},
	{
		title: (
			<div className="col-name">
				<Icon icon="clock" /> {jp.common.updatedTime}
			</div>
		),
		dataIndex: "uploadTime",
		key: "uploadTime",
	},
	{
		title: (
			<div className="col-name">
				<Icon icon="file" />
				{jp.common.type}
			</div>
		),
		dataIndex: "type",
		key: "type",
	},
	{
		title: (
			<div className="col-name">
				<Icon icon="user" /> {jp.common.uploader}
			</div>
		),
		dataIndex: "uploader",
		key: "uploader",
	},
];

interface Props {
	setFiles: (val: FilesArray) => void;
	assetDetail: AssetItem | undefined;
	setAssetDetail: (val: AssetItem) => void;
	data?: ContentConfig | null;
	onClickShrinkOutlined?: () => void;
}

const InputOperator: React.FC<Props> = (props) => {
	// Props
	const { setFiles, assetDetail, setAssetDetail, data, onClickShrinkOutlined } =
		props;

	// Remix
	const fetchAssets = useFetcher<ApiResponse<AssetsResponse>>();
	const isLoadAssets = fetchAssets.state === "loading";
	const SUPPORTED_FILE_TYPES = [
		FileType.PNG,
		FileType.PDF,
		FileType.DOCX,
		FileType.XLSX,
		FileType.ZIP,
		FileType.SEVEN_ZIP,
	];
	const SUPPORTED_FILE_TYPES_CHILDREN = [
		FileType.PNG,
		FileType.PDF,
		FileType.DOCX,
		FileType.XLSX,
	];
	const assets = fetchAssets.data?.status
		? fetchAssets.data.data.items.filter((item: AssetItem) => {
				const fileExtension = item.url.split(".").pop()?.toLowerCase();
				return (
					fileExtension &&
					SUPPORTED_FILE_TYPES.includes(fileExtension as FileType)
				);
			})
		: null;
	const fetchAssetsDetail = useFetcher<ApiResponse<AssetItem>>();
	const baseUrl = assetDetail?.url.split("/").slice(0, -1).join("/");

	// State
	const [selectedAsset, setSelectedAsset] = useState<AssetItem | undefined>();
	const [tempSelectedAsset, setTempSelectedAsset] = useState<
		AssetItem | undefined
	>();
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [assetItemFolderViewer, setAssetItemFolderViewer] = useState<
		DataTypeFolderViewer[]
	>([]);
	const [previewType, setPreviewType] = useState<number>(0);
	const [keywordAsset, setKeywordAsset] = useState("");
	const [tempKeywordAsset, setTempKeywordAsset] = useState("");
	const [assetId, setAssetId] = useState("");
	const [assetFile, setAssetFile] = useState<FileAsset>();

	// Effect
	useEffect(() => {
		setPreviewType(assetDetail ? checkPreviewType(assetDetail) : 0);
	}, [assetDetail]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: FIXME
	useEffect(() => {
		if (previewType === LAYOUT_PREVIEW_TYPE.FOLDER_AND_FILE) {
			const assetFile = {
				...assetDetail?.file,
				children:
					assetDetail?.file?.children?.filter((child) => {
						const fileType = child?.path?.split(".")?.pop();
						return (
							fileType &&
							SUPPORTED_FILE_TYPES_CHILDREN.includes(fileType as FileType)
						);
					}) || [],
			};
			setAssetFile(assetFile as FileAsset);
		}
	}, [assetDetail, previewType]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: FIXME
	useEffect(() => {
		fetchAssets.load(`${routes.asset}?perPage=100&keyword=${keywordAsset}`);
	}, [keywordAsset]);

	useEffect(() => {
		if (selectedAsset || data) {
			setAssetId(selectedAsset?.id || (data?.assetId ?? ""));
		}
	}, [selectedAsset, data]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: FIXME
	useEffect(() => {
		if (assetId) {
			fetchAssetsDetail.load(`${routes.asset}/${assetId}`);
		}
	}, [assetId]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: FIXME
	useEffect(() => {
		if (fetchAssetsDetail?.data?.status) {
			setAssetDetail(fetchAssetsDetail?.data?.data);
		}
	}, [fetchAssetsDetail]);

	const dataSourceChooseFile = assets?.map((item) => {
		const urlSplit = item?.url.split("/");
		const urlSplitTypeFile = item?.url.split(".");
		return {
			key: item?.id,
			asset: decodeURIComponent(urlSplit[urlSplit.length - 1]),
			uploadTime: formatDateToUTC(item?.createdAt),
			type: urlSplitTypeFile[urlSplitTypeFile.length - 1],
			uploader: item?.createdBy || "N/A",
		};
	});

	const handleRowClick = (record: AssetTableRecord) => {
		const selected = assets?.find((item) => item.id === record.key);
		setTempSelectedAsset(selected);
	};

	const getRowClassName = (record: AssetTableRecord) => {
		const isSelected =
			(isModalOpen && record.key === tempSelectedAsset?.id) ||
			(!isModalOpen && record.key === assetDetail?.id);
		return isSelected ? "selected-row" : "";
	};

	const handleCancelModal = () => {
		setTempSelectedAsset(undefined);
		setIsModalOpen(false);
	};

	const handleOpenModal = () => {
		setTempSelectedAsset(assetDetail);
		setIsModalOpen(true);
	};

	const handleApply = () => {
		setSelectedAsset(tempSelectedAsset);
		setIsModalOpen(false);
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: FIXME
	useEffect(() => {
		if (assetDetail) {
			const fileType = assetDetail?.url?.split(".")?.pop() as FileType;
			if (fileType === FileType.ZIP || fileType === FileType.SEVEN_ZIP) {
				if (assetItemFolderViewer?.length > 0) {
					const filesArray: FilesArray = assetItemFolderViewer
						.filter((item) => {
							const itemFileType = item?.path?.split(".")?.pop();
							return SUPPORTED_FILE_TYPES.includes(itemFileType as FileType);
						})
						.map((item) => ({
							id: item?.id,
							url: baseUrl + item?.path,
						}));
					setFiles(filesArray);
				} else {
					setFiles([]);
				}
			} else {
				setFiles([
					{
						id: assetDetail?.id,
						url: assetDetail?.url,
					},
				]);
			}
		}
	}, [assetItemFolderViewer, assetDetail]);

	return (
		<WrapViewer
			title={jp.operator.input}
			icon={<Icon icon="file" size={16} />}
			isShowShrinkOutlined
			onClickShrinkOutlined={onClickShrinkOutlined}
		>
			<InputOperatorS>
				<div className="selected-file">
					<div className="choose-input">
						<Button icon={<Icon icon="file" />} onClick={handleOpenModal}>
							{jp.common.asset}
							{jp.common.choose}
						</Button>
						<Button disabled icon={<Icon icon="table" />} onClick={() => {}}>
							{jp.common.content}
							{jp.common.choose}
						</Button>
					</div>

					<div className="file-selected">
						<Table
							dataSource={
								assetDetail
									? [
											{
												key: assetDetail?.id,
												id: assetDetail?.id,
												fileName: decodeURIComponent(
													assetDetail?.url.split("/")[
														assetDetail?.url.split("/").length - 1
													],
												),
												size: formatFileSize(assetDetail?.totalSize ?? 0),
											},
										]
									: []
							}
							columns={columnSelectedInput}
							pagination={false}
							rowClassName="selected-row"
							scroll={{ x: "max-content" }}
						/>
					</div>
				</div>

				<div className="viewer">
					{assetDetail && (
						<div className="viewer-content">
							{previewType === LAYOUT_PREVIEW_TYPE.FILE && (
								<div className="file-viewer h-100">
									<FileViewer
										isPreview={!!assetDetail}
										assetItem={assetDetail}
									/>
								</div>
							)}

							{previewType === LAYOUT_PREVIEW_TYPE.GIS_AND_CONTENT && (
								<>
									<div className="folder-viewer h-50 b-bottom">
										<GISViewer assetItem={assetDetail} />
									</div>
									<div className="file-viewer h-50">
										<ContentViewer assetItem={assetDetail} />
									</div>
								</>
							)}

							{previewType === LAYOUT_PREVIEW_TYPE.FOLDER_AND_FILE &&
								assetFile && (
									<>
										<div className="folder-viewer h-40 b-bottom">
											<FolderViewer
												assetFile={assetFile}
												setAssetItemFolderViewer={setAssetItemFolderViewer}
												defaultSelect={data?.fileIds}
												isOperator
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
						</div>
					)}
				</div>
			</InputOperatorS>

			<Modal
				centered
				open={isModalOpen}
				onCancel={handleCancelModal}
				title={`${jp.common.asset}${jp.modal.select}`}
				onOk={handleApply}
				cancelText={jp.common.cancel}
				okText={jp.common.load}
				okButtonProps={{
					disabled: !tempSelectedAsset,
				}}
				width={640}
			>
				<ModalChooseFile>
					<div className="filter">
						<Input
							placeholder={jp.common.inputSearchText}
							className="input-search"
							value={tempKeywordAsset}
							onChange={(e) => setTempKeywordAsset(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									setKeywordAsset(tempKeywordAsset);
								}
							}}
						/>

						<button
							type="button"
							className="button-search"
							onClick={() => setKeywordAsset(tempKeywordAsset)}
						>
							<Icon icon="search" color={theme.colors.lightGray} />
						</button>
					</div>

					<Table
						className="table-file"
						bordered
						loading={isLoadAssets}
						dataSource={dataSourceChooseFile}
						columns={columnsChooseFile}
						rowClassName={getRowClassName}
						pagination={false}
						scroll={{ y: 300 }}
						onRow={(record) => ({
							onClick: () => handleRowClick(record),
						})}
					/>
				</ModalChooseFile>
			</Modal>
		</WrapViewer>
	);
};

export default InputOperator;
