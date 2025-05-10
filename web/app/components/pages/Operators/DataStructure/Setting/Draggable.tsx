import type React from "react";
import { memo } from "react";
import type { ConnectDragSource } from "react-dnd";
import jp from "~/commons/locales/jp";
import Button from "~/components/atoms/Button";
import Collapse from "~/components/atoms/Collapse";
import Icon from "~/components/atoms/Icon";
import Input from "~/components/atoms/Input";
import Select from "~/components/atoms/Select";
import {
	type ColumnData,
	ITEM_TYPE_COLLAPSE,
} from "~/components/pages/Operators/types";
import { useDraggable } from "~/hooks/useDraggable";
import type { ColumnType, FieldType } from ".";

const { Panel } = Collapse;
const { Option } = Select;

interface DraggableColumnProps {
	index: number;
	moveColumn: (dragIndex: number, hoverIndex: number) => void;
	column: ColumnData;
	renderPanelHeader: (
		column: ColumnType,
		index: number,
		drag: ConnectDragSource,
		ref: React.RefObject<HTMLDivElement>,
	) => JSX.Element;
	setIsFormDirty: (dirty: boolean) => void;
	children: React.ReactNode;
	activeKeys: Record<string, string[]>;
	setActiveKeys: (val: Record<string, string[]>) => void;
}

interface DraggableFieldProps {
	field: FieldType;
	index: number;
	moveField: (dragIndex: number, hoverIndex: number) => void;
	handleFieldChange: (index: number, key: string, value: string) => void;
	handleRemoveContext: (index: number) => void;
	isDisabledForWorkflow: boolean;
}

export const DraggableColumn = memo(
	({
		index,
		moveColumn,
		column,
		renderPanelHeader,
		setIsFormDirty,
		children,
		activeKeys,
		setActiveKeys,
	}: DraggableColumnProps) => {
		const { drag, ref } = useDraggable(
			ITEM_TYPE_COLLAPSE.COLUMN,
			index,
			moveColumn,
		);

		return (
			<Collapse
				style={{
					backgroundColor: "unset",
					border: "unset",
					margin: 0,
				}}
				collapsible={"icon"}
				expandIconPosition={"end"}
				activeKey={activeKeys[column.id] ? activeKeys[column.id] : []}
				onChange={(keys) => {
					setActiveKeys({
						...activeKeys,
						[column.id]: keys as string[],
					});
					setIsFormDirty(true);
				}}
			>
				<Panel
					className="panel"
					header={renderPanelHeader(column, index, drag, ref)}
					key={`column-${column?.id}`}
					showArrow={true}
				>
					{children}
				</Panel>
			</Collapse>
		);
	},
);

export const DraggableField = ({
	field,
	index,
	moveField,
	handleFieldChange,
	handleRemoveContext,
	isDisabledForWorkflow,
}: DraggableFieldProps) => {
	const { drag, ref } = useDraggable(
		ITEM_TYPE_COLLAPSE.CONTEXT,
		index,
		moveField,
	);

	return (
		<div ref={ref} className="form-item">
			<div ref={drag} className="icon-drag">
				<Icon icon="dotsSixVertical" />
			</div>

			<Select
				disabled={isDisabledForWorkflow}
				value={field.type}
				className="select"
				onChange={(value) => handleFieldChange(index, "type", value)}
			>
				<Option value="text">テキスト</Option>
				<Option value="column">カラム</Option>
			</Select>

			<Input
				disabled={isDisabledForWorkflow}
				placeholder={jp.common.enterValue}
				value={field.value}
				onChange={(e) => handleFieldChange(index, "value", e.target.value)}
			/>

			{index !== 0 && (
				<Button
					disabled={isDisabledForWorkflow}
					type="text"
					icon={<Icon icon="close" />}
					onClick={() => handleRemoveContext(index)}
				/>
			)}
		</div>
	);
};
