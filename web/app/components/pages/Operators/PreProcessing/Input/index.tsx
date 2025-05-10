import { useFetcher, useSearchParams } from "@remix-run/react";
import type React from "react";
import { useEffect, useState } from "react";
import { CONTENT_FIELD_TYPE, type SelectRowIdT } from "~/commons/core.const";
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
import ModalChooseContent from "~/components/pages/Operators/Modal/ModalChooseContent";
import ModalContentDetail from "~/components/pages/Operators/Modal/ModalContentDetail";
import ViewerContainer from "~/components/pages/Operators/ViewerContent/ViewerContainer";
import {
	InputOperatorS,
	ModalChooseFile,
} from "~/components/pages/Operators/styles";
import {
	type AssetTableRecord,
	type OptionColumnsT,
	columnSelectedInput,
} from "~/components/pages/Operators/types";
import type { AssetItem, AssetsResponse } from "~/models/asset";
import type { ContentItem } from "~/models/content";
import {
	type InputType,
	InputTypeDB,
	type PreprocessContentConfigs,
} from "~/models/operators";
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
				<Icon icon="file" /> {jp.common.type}
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
	setAssetId: (val: string) => void;
	setContentId: (val: string) => void;
	data?: PreprocessContentConfigs | null;
	setInput: (val: string) => void;
	setInputType: (val: InputType) => void;
	onClickShrinkOutlined?: () => void;
	setOptionColumns: (val: OptionColumnsT[] | undefined) => void;
}

const InputOperator: React.FC<Props> = (props) => {
	// props
	const {
		setAssetId,
		setContentId,
		data,
		setInput,
		setInputType,
		onClickShrinkOutlined,
		setOptionColumns,
	} = props;
	const [searchParams] = useSearchParams();
	const contentInputId = searchParams.get("contentInputId");

	// api data
	const fetchAssets = useFetcher<ApiResponse<AssetsResponse>>();
	const isLoadAssets = fetchAssets.state === "loading";
	const SUPPORTED_FILE_TYPES = [
		FileType.CSV,
		FileType.JSON,
		FileType.GEOJSON,
		FileType.SHP,
		FileType.ZIP,
		FileType.SEVEN_ZIP,
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
	const [keywordAsset, setKeywordAsset] = useState("");
	const [tempKeywordAsset, setTempKeywordAsset] = useState("");
	const [assetDetail, setAssetDetail] = useState<AssetItem>();

	// biome-ignore lint/correctness/useExhaustiveDependencies: FIXME
	useEffect(() => {
		fetchAssets.load(`${routes.asset}?perPage=100&keyword=${keywordAsset}`);
	}, [keywordAsset]);

	const fetchAssetDetail = useFetcher<ApiResponse<AssetItem>>();
	const fetchContentDetail = useFetcher<ApiResponse<ContentItem>>();
	const baseUrl = assetDetail?.url.split("/").slice(0, -1).join("/");

	// state
	const [selectedAsset, setSelectedAsset] = useState<AssetItem | undefined>();
	const [selectedContent, setSelectedContent] = useState<
		ContentItem | undefined
	>();
	const isGeoJson = selectedContent
		? selectedContent?.schema?.fields?.some(
				// No change schema to content because this is data from CMS
				(field) => field?.type === CONTENT_FIELD_TYPE.GEO,
			)
		: false;
	const [tempSelectedAsset, setTempSelectedAsset] = useState<
		AssetItem | undefined
	>();
	const [tempSelectedContent, setTempSelectedContent] = useState<
		ContentItem | undefined
	>();
	const [isModalChooseAssetOpen, setIsModalChooseAssetOpen] = useState(false);
	const [isModalChooseContentOpen, setIsModalChooseContentOpen] =
		useState(false);
	const [isModalDetailContentOpen, setIsModalDetailContentOpen] =
		useState(false);
	const [assetItemFolderViewer, setAssetItemFolderViewer] = useState<
		DataTypeFolderViewer[]
	>([]);
	const [previewType, setPreviewType] = useState<number>(0);
	const [selectedRowId, setSelectedRowId] = useState<SelectRowIdT | null>(null);

	// effect
	useEffect(() => {
		if (!selectedContent) {
			setSelectedRowId(null);
		}
	}, [selectedContent]);

	useEffect(() => {
		setPreviewType(assetDetail ? checkPreviewType(assetDetail) : 0);
	}, [assetDetail]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: FIXME
	useEffect(() => {
		if (selectedAsset || data) {
			fetchAssetDetail.load(
				`${routes.asset}/${data && data?.inputType === InputTypeDB.ASSET ? data?.inputId : selectedAsset?.id}`,
			);
		}
	}, [selectedAsset, data]);

	useEffect(() => {
		if (fetchAssetDetail?.data?.status) {
			setAssetDetail(fetchAssetDetail?.data?.data);
		}
	}, [fetchAssetDetail]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: FIXME
	useEffect(() => {
		if ((data && data?.inputType === InputTypeDB.CONTENT) || contentInputId) {
			fetchContentDetail.load(
				`${routes.content}/${data?.inputId || contentInputId}`,
			);
		}
	}, [data, contentInputId]);

	useEffect(() => {
		if (fetchContentDetail?.data?.status) {
			setSelectedContent(fetchContentDetail?.data?.data);
		}
	}, [fetchContentDetail]);

	// table data
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

	// function
	const handleRowClickChooseFile = (record: AssetTableRecord) => {
		const selected = assets?.find((item) => item.id === record.key);
		setTempSelectedAsset(selected);
	};
	const getRowClassNameChooseFile = (record: AssetTableRecord) => {
		const isSelected =
			isModalChooseAssetOpen && record.key === tempSelectedAsset?.id;
		return isSelected ? "selected-row" : "";
	};

	const handleCancelModalChooseAsset = () => {
		setTempSelectedAsset(undefined);
		setIsModalChooseAssetOpen(false);
	};
	const handleOpenModalChooseAsset = () => {
		setTempSelectedAsset(selectedAsset ? assetDetail : undefined);
		setIsModalChooseAssetOpen(true);
	};

	const handleOpenModalChooseContent = () => {
		setTempSelectedContent(selectedContent);
		setIsModalChooseContentOpen(true);
	};

	const handleOpenModalDetailContent = () => {
		setIsModalDetailContentOpen(true);
	};

	const handleApply = (type: "asset" | "content") => {
		if (type === "asset") {
			setSelectedAsset(tempSelectedAsset);
			setSelectedContent(undefined);
			setIsModalChooseAssetOpen(false);
		} else {
			setSelectedContent(tempSelectedContent);
			setSelectedAsset(undefined);
			setAssetDetail(undefined);
			setIsModalDetailContentOpen(false);
			setIsModalChooseContentOpen(false);
		}
	};

	// Handle input,
	// biome-ignore lint/correctness/useExhaustiveDependencies: FIXME
	useEffect(() => {
		if (assetDetail) {
			setInput(assetDetail?.url);
			const inType = assetDetail?.url.split(".").pop();
			setInputType(inType === "zip" ? "shapefile" : (inType as InputType));
			setAssetId(assetDetail?.id);
			setContentId("");
			setOptionColumns(undefined);
		} else if (selectedContent) {
			setInputType(isGeoJson ? "geojson" : "json");
			setContentId(selectedContent?.id);
			setAssetId("");
			setOptionColumns(
				// No change schema to content because this is data from CMS
				selectedContent?.schema?.fields
					?.filter((field) => field?.type !== CONTENT_FIELD_TYPE.GEO)
					?.map((field) => ({
						label: field?.key,
						value: field?.key,
					})),
			);
		}
	}, [assetDetail, selectedContent]);

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
						<Button
							icon={<Icon icon="file" />}
							onClick={handleOpenModalChooseAsset}
						>
							{jp.common.asset}
							{jp.common.choose}
						</Button>
						<Button
							icon={<Icon icon="table" />}
							onClick={handleOpenModalChooseContent}
						>
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
									: selectedContent
										? [
												{
													key: selectedContent?.id,
													id: selectedContent?.id,
													fileName: selectedContent?.name,
													size: formatFileSize(0),
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
						</div>
					)}

					{selectedContent && (
						<ViewerContainer
							isPreview={false}
							item={selectedContent}
							hasGeoData={isGeoJson}
							wrapperClassName="viewer-content"
							gisMapClassName="gis-viewer h-40 b-bottom"
							tableClassName={`content-viewer ${isGeoJson ? "h-60" : "h-100"}`}
							selectedRowId={selectedRowId}
							onSelectRow={isGeoJson ? setSelectedRowId : undefined}
						/>
					)}
				</div>
			</InputOperatorS>

			<Modal
				centered
				open={isModalChooseAssetOpen}
				onCancel={handleCancelModalChooseAsset}
				title={`${jp.common.asset}${jp.modal.select}`}
				onOk={() => handleApply("asset")}
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
						rowClassName={getRowClassNameChooseFile}
						pagination={false}
						scroll={{ y: 300 }}
						onRow={(record) => ({
							onClick: () => handleRowClickChooseFile(record),
						})}
					/>
				</ModalChooseFile>
			</Modal>

			<ModalChooseContent
				isOpen={isModalChooseContentOpen}
				onCancel={() => setIsModalChooseContentOpen(false)}
				onOk={handleOpenModalDetailContent}
				tempSelectedContent={tempSelectedContent}
				setTempSelectedContent={setTempSelectedContent}
				selectedContent={tempSelectedContent}
			/>

			<ModalContentDetail
				isOpen={isModalDetailContentOpen}
				onCancel={() => setIsModalDetailContentOpen(false)}
				onApply={() => handleApply("content")}
				selectedContent={tempSelectedContent}
			/>
		</WrapViewer>
	);
};

export default InputOperator;
