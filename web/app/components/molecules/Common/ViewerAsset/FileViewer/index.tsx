import type React from "react";
import { useCallback } from "react";
import jp from "~/commons/locales/jp";
import Icon from "~/components/atoms/Icon";
import WrapViewer from "~/components/molecules/Common/WrapViewer";
import { FileType } from "~/components/pages/Assets/types";
import type { AssetItem, FileAsset } from "~/models/asset";
import { FileViewerS } from "../styles";
import type { DataTypeFolderViewer } from "../types";
import { CsvComponent } from "./CsvComponent";

interface FileViewerProps {
	isPreview: boolean;
	assetItem?: AssetItem;
	assetFile?: FileAsset | DataTypeFolderViewer;
}

interface DataSourceItem {
	key: string | number;
	[key: string]: string | number;
}

const FileViewerComponent: React.FC<FileViewerProps> = ({
	isPreview,
	assetItem,
	assetFile,
}) => {
	const url = assetItem?.url || assetFile?.path;

	const renderFileContent = useCallback(() => {
		const fileType = url?.split(".").pop() as FileType;
		switch (fileType) {
			case FileType.PNG:
				return <img src={url} alt="images" />;
			case FileType.PDF:
				return <iframe title="File-Viewer" src={url} />;
			case FileType.XLSX:
			case FileType.XLS:
				return (
					<iframe
						title="XLSX Viewer"
						src={`https://view.officeapps.live.com/op/view.aspx?src=${url}`}
						frameBorder="0"
					/>
				);
			case FileType.CSV:
				return url ? <CsvComponent url={url} /> : "";
			case FileType.DOC:
			case FileType.DOCX:
				return (
					<iframe
						title="Doc Viewer"
						src={`https://view.officeapps.live.com/op/embed.aspx?src=${url}`}
						frameBorder="0"
					/>
				);
			default:
				return <p>Unsupported file type</p>;
		}
	}, [url]);

	return (
		<WrapViewer
			title={jp.common.fileViewer}
			icon={<Icon icon="fileViewer" size={16} />}
		>
			<FileViewerS>{isPreview && renderFileContent()}</FileViewerS>
		</WrapViewer>
	);
};

export default FileViewerComponent;
