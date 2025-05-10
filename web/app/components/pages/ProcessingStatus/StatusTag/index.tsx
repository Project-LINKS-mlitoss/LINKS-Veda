import type React from "react";
import { PROCESSING_STATUS } from "~/commons/core.const";
import Tag from "~/components/atoms/Tag";

interface StatusTagProps {
	status: number;
	closable?: boolean;
	onClose?: (e: React.MouseEvent<HTMLElement, MouseEvent>) => void;
	onMouseDown?: (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => void;
	style?: React.CSSProperties;
}

const StatusTag: React.FC<StatusTagProps> = ({
	status,
	closable,
	onClose,
	onMouseDown,
	style,
}) => {
	let color = "";
	let text = "";

	switch (status) {
		case PROCESSING_STATUS.PENDING:
			color = "";
			text = "処理待";
			break;
		case PROCESSING_STATUS.SAVED:
			color = "blue";
			text = "保存済";
			break;
		case PROCESSING_STATUS.DONE:
			color = "green";
			text = "処理済";
			break;
		case PROCESSING_STATUS.IN_PROGRESS:
		case PROCESSING_STATUS.CREATED:
			color = "orange";
			text = "処理中";
			break;
		default:
			color = "";
			text = "エラー";
	}

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

export default StatusTag;
