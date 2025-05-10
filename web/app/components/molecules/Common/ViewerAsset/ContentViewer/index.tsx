import type * as React from "react";
import jp from "~/commons/locales/jp";
import Icon from "~/components/atoms/Icon";
import WrapViewer from "~/components/molecules/Common/WrapViewer";
import type { AssetItem } from "~/models/asset";
import { TableViewerS } from "../styles";

interface AssetViewerProps {
	assetItem: AssetItem;
}

const ContentViewer: React.FC<AssetViewerProps> = ({ assetItem }) => {
	return (
		<WrapViewer
			title={jp.common.gisViewerContentViewer}
			icon={<Icon icon="folderViewer" size={16} />}
		>
			<TableViewerS>{jp.common.gisViewerContentViewer}</TableViewerS>
		</WrapViewer>
	);
};

export default ContentViewer;
