import { Dropdown, Input, type InputRef, type MenuProps } from "antd";
import { useEffect, useRef, useState } from "react";
import Icon from "~/components/atoms/Icon";
import { CellWrapperStyled } from "../styles";
import {
	CELL_MODE,
	type OnFieldChange,
	type RenderContentField,
} from "../types";

export function TableHeaderCell({
	field,
	onFieldChange,
}: { field: RenderContentField; onFieldChange: OnFieldChange }) {
	const [isEditing, setIsEditing] = useState(false);

	const inputRef = useRef<InputRef>(null);

	useEffect(() => {
		if (isEditing && inputRef.current) {
			inputRef.current.focus();
		}
	}, [isEditing]);

	const handleEdit = () => {
		setIsEditing(true);
	};

	const handleDelete = () => {
		onFieldChange({ ...field, mode: CELL_MODE.DELETED });
		setIsEditing(false);
	};

	const handleRestore = () => {
		onFieldChange({ ...field, mode: field?.prevMode });
		setIsEditing(false);
	};

	const items: MenuProps["items"] = [
		{
			label: "変更",
			key: "edit",
			onClick: handleEdit,
		},
		...(field.mode === CELL_MODE.DELETED
			? [
					{
						label: "復元",
						key: "restore",
						onClick: handleRestore,
					},
				]
			: [
					{
						label: "削除",
						key: "delete",
						onClick: handleDelete,
					},
				]),
	];

	const headerMode: CELL_MODE =
		field?.mode === CELL_MODE.DELETED
			? CELL_MODE.DELETED
			: field?.mode === CELL_MODE.NEW || field?.originalKey !== field.key
				? CELL_MODE.EDITED
				: CELL_MODE.DEFAULT;

	return (
		<CellWrapperStyled mode={headerMode}>
			<Dropdown menu={{ items }} placement="bottomLeft" trigger={["click"]}>
				<Icon icon="textLeft" size={16} style={{ cursor: "pointer" }} />
			</Dropdown>

			<Input
				variant="borderless"
				disabled={!isEditing || field.mode === CELL_MODE.DELETED}
				onChange={(e) => onFieldChange({ ...field, key: e.target.value })}
				onBlur={() => setIsEditing(false)}
				value={field.key}
				ref={inputRef}
			/>
		</CellWrapperStyled>
	);
}
