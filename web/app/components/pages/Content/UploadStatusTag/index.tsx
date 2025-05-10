import type React from "react";
import { CONTENT_MANAGEMENT_STATUS_TYPE } from "~/commons/core.const";
import Tag from "~/components/atoms/Tag";

interface UploadStatusTagProps {
	status: CONTENT_MANAGEMENT_STATUS_TYPE;
	closable?: boolean;
	onClose?: (e: React.MouseEvent<HTMLElement, MouseEvent>) => void;
	onMouseDown?: (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => void;
	style?: React.CSSProperties;
	isActive?: boolean;
}

const UploadStatusTag: React.FC<UploadStatusTagProps> = ({
	status,
	closable,
	onClose,
	onMouseDown,
	style,
	isActive = true,
}) => {
	let color = "";
	let text = "";

	switch (status) {
		case CONTENT_MANAGEMENT_STATUS_TYPE.PUBLIC:
			color = "green";
			text = "オープンデータ";
			break;
		case CONTENT_MANAGEMENT_STATUS_TYPE.VISUALIZE:
			color = "cyan";
			text = "可視化";
			break;
		case CONTENT_MANAGEMENT_STATUS_TYPE.CHAT:
			color = "purple";
			text = "チャット";
			break;
		default:
			color = "default";
			text = "Unknown";
	}
	if (!isActive) color = "default";

	return (
		<Tag
			color={color}
			closable={closable}
			onClose={onClose}
			onMouseDown={onMouseDown}
			style={style}
		>
			{text}
		</Tag>
	);
};

export default UploadStatusTag;
