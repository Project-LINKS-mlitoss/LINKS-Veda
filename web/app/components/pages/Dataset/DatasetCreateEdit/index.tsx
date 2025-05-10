import type * as React from "react";
import Icon from "~/components/atoms/Icon";
import WrapContent from "~/components/molecules/Common/WrapContent";
import SettingDataset from "~/components/pages/Dataset/DatasetCreateEdit/SettingDataset";
import type { MODE_DATASET_COMPONENT } from "~/components/pages/Dataset/types";
import type { DatasetT } from "~/models/dataset";
import { routes } from "~/routes/routes";
import { theme } from "~/styles/theme";

type Props = {
	data?: DatasetT;
	mode: MODE_DATASET_COMPONENT;
};

const DatasetCreateEdit: React.FC<Props> = (props) => {
	const breadcrumbItems = [
		{
			href: routes.dataset,
			title: (
				<>
					<Icon icon="dataset" size={24} color={theme.colors.semiBlack} />
					<span>データセット</span>
				</>
			),
		},
		{
			title: "データセットの名称",
		},
	];

	return (
		<WrapContent breadcrumbItems={breadcrumbItems}>
			<SettingDataset {...props} />
		</WrapContent>
	);
};

export default DatasetCreateEdit;
