import type * as React from "react";
import { useState } from "react";
import Icon from "~/components/atoms/Icon";
import {
	ActionsViewer,
	ContentViewer,
	HeaderViewer,
	WrapViewerS,
} from "./styles";

interface Props {
	title: string;
	icon?: React.ReactNode;
	content?: React.ReactNode;
	children: React.ReactNode;
	isShowShrinkOutlined?: boolean;
	isHiddenContent?: boolean;
	onClickShrinkOutlined?: () => void;
}

interface SubComponents {
	ActionsViewer: typeof ActionsViewer;
	ContentViewer: typeof ContentViewer;
}

const WrapViewer: React.FC<Props> & SubComponents = (props) => {
	const {
		title,
		icon,
		content,
		children,
		isShowShrinkOutlined,
		isHiddenContent,
		onClickShrinkOutlined,
	} = props;
	const [isCollapsed, setIsCollapsed] = useState(false);

	const toggleCollapse = () => {
		if (isHiddenContent) {
			setIsCollapsed(!isCollapsed);
		}
		if (onClickShrinkOutlined) {
			onClickShrinkOutlined();
		}
	};

	return (
		<WrapViewerS>
			<HeaderViewer>
				<div className="icon-title">
					{icon}
					<span className="title-wrap-viewer">{title}</span>

					<div className="content">{content}</div>
				</div>

				{isShowShrinkOutlined && (
					<Icon icon="shrinkOutlined" onClick={toggleCollapse} />
				)}
			</HeaderViewer>

			<div className={`children ${isCollapsed ? "collapsed" : "expanded"}`}>
				{children}
			</div>
		</WrapViewerS>
	);
};

WrapViewer.ActionsViewer = ActionsViewer;
WrapViewer.ContentViewer = ContentViewer;

export default WrapViewer;
