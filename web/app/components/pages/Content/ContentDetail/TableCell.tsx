import type { CheckboxChangeEvent } from "antd/lib/checkbox";
import _ from "lodash";
import type React from "react";
import Input from "~/components/atoms/Input";
import Switch from "~/components/atoms/Switch";
import { CELL_MODE, FIELD_TYPE, type RenderCellComponent } from "../types";

export const TableCell: RenderCellComponent = (props) => {
	const { field, onItemChange, fieldValue, itemId } = props;
	const renderValue = fieldValue?.value;

	const onCellValueChange = (updatedValue: string | boolean | number) => {
		onItemChange({
			itemId,
			field,
			value: updatedValue,
		});
	};

	const onCellCheckboxChange = (val: boolean) => {
		onCellValueChange(val);
	};

	const onCellInputValueChange = (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		onCellValueChange(event.target.value);
	};

	const onCellNumberValueChange = (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		const value = event.target.value;
		const numberValue = value === "" ? "" : Number.parseFloat(value);
		onCellValueChange(numberValue);
	};

	const shouldDisableInput =
		field.mode === CELL_MODE.DELETED ||
		fieldValue?.mode === CELL_MODE.DELETED ||
		(field.type !== FIELD_TYPE.Text &&
			field.type !== FIELD_TYPE.Integer &&
			field.type !== FIELD_TYPE.Number &&
			field.type !== FIELD_TYPE.Bool &&
			field.type !== FIELD_TYPE.Multiple);

	if (_.isNil(renderValue)) {
		return (
			<Input
				disabled={shouldDisableInput}
				onChange={onCellInputValueChange}
				className="bg-white p-0 w-full"
				placeholder="-"
			/>
		);
	}

	switch (field.type as FIELD_TYPE) {
		case FIELD_TYPE.Multiple:
		case FIELD_TYPE.Select:
			return (
				<Input
					onChange={onCellInputValueChange}
					disabled={shouldDisableInput}
					value={
						typeof renderValue === "string"
							? renderValue
							: (renderValue as string[])?.join(",")
					}
					placeholder="-"
				/>
			);
		case FIELD_TYPE.Bool:
			return (
				<Switch
					disabled={shouldDisableInput}
					checked={renderValue as unknown as boolean}
					onChange={onCellCheckboxChange}
				/>
			);
		case FIELD_TYPE.Integer:
		case FIELD_TYPE.Number:
			return (
				<Input
					type="number"
					step="any"
					onChange={onCellNumberValueChange}
					disabled={shouldDisableInput}
					value={renderValue as unknown as number}
					placeholder="0"
				/>
			);
	}
	return (
		<Input
			disabled={shouldDisableInput}
			value={renderValue as string}
			onChange={onCellInputValueChange}
			placeholder="-"
		/>
	);
};
