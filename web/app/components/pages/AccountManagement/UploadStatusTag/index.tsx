import type React from "react";
import { ROLE } from "~/commons/core.const";
import Tag from "~/components/atoms/Tag";

interface UploadStatusTagProps {
	role?: ROLE;
	uc?: string;
	closable?: boolean;
	onClose?: (e: React.MouseEvent<HTMLElement, MouseEvent>) => void;
	onMouseDown?: (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => void;
	style?: React.CSSProperties;
}

const UploadStatusTag: React.FC<UploadStatusTagProps> = ({
	role,
	uc,
	closable,
	onClose,
	onMouseDown,
	style,
}) => {
	let color = "";
	let text = "";
	if (!role) {
		color = "default";
		text = uc ?? "一般";
	} else {
		switch (role) {
			case ROLE.ADMIN:
				color = "blue";
				text = "管理";
				break;
			default:
				color = "default";
				text = "一般";
		}
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

export default UploadStatusTag;
