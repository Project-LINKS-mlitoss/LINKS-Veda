import { useFetcher } from "@remix-run/react";
import type React from "react";
import { useEffect, useState } from "react";
import { CONTENT_FIELD_TYPE } from "~/commons/core.const";
import ContentViewer from "~/components/molecules/Common/ViewerAsset/ContentViewer";
import FileViewer from "~/components/molecules/Common/ViewerAsset/FileViewer";
import FolderViewer from "~/components/molecules/Common/ViewerAsset/FolderViewer";
import GISViewer from "~/components/molecules/Common/ViewerAsset/GISViewer";
import {
	type DataTypeFolderViewer,
	LAYOUT_PREVIEW_TYPE,
} from "~/components/molecules/Common/ViewerAsset/types";
import { checkPreviewType } from "~/components/pages/Assets/utils";
import ViewerContainer from "~/components/pages/Operators/ViewerContent/ViewerContainer";
import { InputOperatorS } from "~/components/pages/Operators/styles";
import type { AssetItem } from "~/models/asset";
import type { ContentItem } from "~/models/content";
import { InputTypeDB } from "~/models/operators";
import {
	type DataTableProcessingStatusType,
	PREPROCESSING_TYPE,
} from "~/models/processingStatus";
import type { ApiResponse } from "~/repositories/utils";
import { routes } from "~/routes/routes";

interface Props {
	data?: DataTableProcessingStatusType | undefined;
}

const InputOperator: React.FC<Props> = (props) => {
	// props
	const { data } = props;

	// Remix
	const fetchAssetDetail = useFetcher<ApiResponse<AssetItem>>();
	const fetchContentDetail = useFetcher<ApiResponse<ContentItem>>();

	// State
	const [assetId, setAssetId] = useState("");
	const [contentId, setContentId] = useState("");
	const [assetDetail, setAssetDetail] = useState<AssetItem>();
	const baseUrl = assetDetail?.url.split("/").slice(0, -1).join("/");
	const [selectedContent, setSelectedContent] = useState<
		ContentItem | undefined
	>();
	const isGeoJson = selectedContent
		? selectedContent?.schema?.fields?.some(
				(field) => field?.type === CONTENT_FIELD_TYPE.GEO,
			)
		: false;
	const [assetItemFolderViewer, setAssetItemFolderViewer] = useState<
		DataTypeFolderViewer[]
	>([]);
	const [previewType, setPreviewType] = useState<number>(0);

	// Effect
	useEffect(() => {
		if (data) {
			switch (data?.operatorType) {
				case PREPROCESSING_TYPE.CONTENT_CONFIGS:
					if ("assetId" in data) setAssetId(data?.assetId ?? "");
					setContentId("");
					break;
				case PREPROCESSING_TYPE.PREPROCESS_CONTENT_CONFIGS:
					if ("inputType" in data && data?.inputType === InputTypeDB.ASSET) {
						setAssetId(data?.inputId);
						setContentId("");
					} else {
						if ("inputId" in data) setContentId(data?.inputId);
						setAssetId("");
					}
					break;
				case PREPROCESSING_TYPE.CROSS_JOIN_CONTENT_CONFIGS:
					if ("inputId" in data) setContentId(data?.inputId);
					break;
				case PREPROCESSING_TYPE.TEXT_MATCHING_CONTENT_CONFIGS:
				case PREPROCESSING_TYPE.SPATIAL_JOIN_CONTENT_CONFIGS:
				case PREPROCESSING_TYPE.SPATIAL_AGGREGATE_CONTENT_CONFIGS:
					if ("leftContentId" in data) setContentId(data?.leftContentId);
					break;
				case PREPROCESSING_TYPE.CONTENT_CREATION:
					if ("contentId" in data) setContentId(data?.contentId ?? "");
					break;
				default:
					break;
			}
		}
	}, [data]);

	useEffect(() => {
		setPreviewType(assetDetail ? checkPreviewType(assetDetail) : 0);
	}, [assetDetail]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: FIXME
	useEffect(() => {
		if (assetId) {
			fetchAssetDetail.load(`${routes.asset}/${assetId}`);
		}
	}, [assetId]);
	useEffect(() => {
		if (fetchAssetDetail?.data?.status) {
			setAssetDetail(fetchAssetDetail?.data?.data);
		}
	}, [fetchAssetDetail]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: FIXME
	useEffect(() => {
		if (contentId) {
			fetchContentDetail.load(`${routes.content}/${contentId}`);
		}
	}, [contentId]);
	useEffect(() => {
		if (fetchContentDetail?.data?.status) {
			setSelectedContent(fetchContentDetail?.data?.data);
		}
	}, [fetchContentDetail]);

	return (
		<InputOperatorS>
			<div className="viewer">
				{assetDetail && (
					<div className="viewer-content">
						{previewType === LAYOUT_PREVIEW_TYPE.FILE && (
							<div className="file-viewer h-100">
								<FileViewer isPreview={!!assetDetail} assetItem={assetDetail} />
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
										disabled={!!data}
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
					/>
				)}
			</div>
		</InputOperatorS>
	);
};

export default InputOperator;
