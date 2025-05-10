import { FiltersContainer } from "./style";
import type { SearchPanelProps } from "./type";

import type React from "react";
import Icon from "~/components/atoms/Icon";
import WrapViewer from "~/components/molecules/Common/WrapViewer";

const SearchPanel: React.FC<SearchPanelProps> = ({
	title,
	onClick,
	children,
}) => {
	return (
		<WrapViewer
			title={title}
			icon={<Icon icon="leftOutlined" size={16} onClick={onClick} />}
			isShowShrinkOutlined
		>
			<FiltersContainer style={{ width: "320px", height: "100%" }}>
				{children}
			</FiltersContainer>
		</WrapViewer>
	);
};

export default SearchPanel;
