import type * as React from "react";
import Icon from "~/components/atoms/Icon";
import WrapViewer from "~/components/molecules/Common/WrapViewer";
import SettingDataset from "~/components/pages/Dataset/DatasetCreateEdit/SettingDataset";
import { DatasetPreviewS } from "~/components/pages/Dataset/styles";
import { MODE_DATASET_COMPONENT } from "~/components/pages/Dataset/types";
import type { DatasetT } from "~/models/dataset";

type ContentProps = {
	datasetChoose: DatasetT | undefined;
	onClickShrinkOutlined?: () => void;
};

const DatasetPreview: React.FC<ContentProps> = ({
	datasetChoose,
	onClickShrinkOutlined,
}) => {
	return (
		<WrapViewer
			title="データセット"
			icon={<Icon icon="file" size={16} />}
			isShowShrinkOutlined
			onClickShrinkOutlined={onClickShrinkOutlined}
		>
			<DatasetPreviewS>
				<SettingDataset
					data={datasetChoose}
					mode={MODE_DATASET_COMPONENT.PREVIEW}
				/>
			</DatasetPreviewS>
		</WrapViewer>
	);
};

export default DatasetPreview;
