import type { JsonValue } from "@prisma/client/runtime/library";
import type * as React from "react";
import { useEffect, useState } from "react";
import jp from "~/commons/locales/jp";
import Collapse from "~/components/atoms/Collapse";
import Dropdown, { type MenuProps } from "~/components/atoms/Dropdown";
import Icon from "~/components/atoms/Icon";
import Input from "~/components/atoms/Input";
import Select from "~/components/atoms/Select";
import TextArea from "~/components/atoms/TextArea";
import {
	type TemplateColumnData,
	VALID_TYPES,
} from "~/components/pages/Operators/types";
import { SettingOperatorTemplateS } from "~/components/pages/Templates/styles";
import { MODE_TEMPLATE } from "~/components/pages/Templates/types";
import type { ContentI, Properties } from "~/models/operators";
import DataStructureAddContext from "./DataStructureAddContext";

type ColumnType = {
	name: string;
	type: string;
};

const optionsTypeCol = [
	{ value: VALID_TYPES.STRING, label: jp.common.string },
	{ value: VALID_TYPES.NUMBER, label: jp.common.int },
	{ value: VALID_TYPES.BOOLEAN, label: jp.common.boolean },
];

interface Props {
	data?: JsonValue | null;
	mode?: MODE_TEMPLATE;
	setColumnsTemplate?: (vaL: TemplateColumnData[]) => void;
	setContent?: (vaL: ContentI) => void;
	setTemplateDataStructure?: (vaL: JsonValue | undefined) => void;
	isActive?: boolean;
}

const DataStructureAddCol: React.FC<Props> = (props) => {
	const {
		data,
		mode,
		setColumnsTemplate,
		setContent,
		setTemplateDataStructure,
		isActive,
	} = props;
	const isPreview = mode === MODE_TEMPLATE.USE;
	const settingJson = typeof data === "string" ? JSON.parse(data ?? "") : {};

	const [columns, setColumns] = useState<TemplateColumnData[]>([]);
	const [activeKeys, setActiveKeys] = useState<(string | number)[]>([]);
	const [prompt, setPrompt] = useState("");

	// biome-ignore lint/correctness/useExhaustiveDependencies: FIXME
	useEffect(() => {
		if (setColumnsTemplate) {
			setColumnsTemplate(columns);
		}
	}, [columns]);

	// handle setting detail
	// biome-ignore lint/correctness/useExhaustiveDependencies: FIXME
	useEffect(() => {
		if (data && settingJson) {
			const properties = settingJson
				? ("content" in settingJson ? settingJson.content : settingJson.schema) // [Content] Handle for old data
						?.properties
				: undefined;
			const initialColumnsData = Object.keys(properties).map((key) => ({
				name: key,
				type: properties[key].type,
				additionalAttributes: {
					position: properties[key].position,
					unit: properties[key].unit,
					keyword: properties[key].keyword,
					description: properties[key].description,
				},
			}));
			setColumns(initialColumnsData);

			setPrompt(settingJson?.prompt);
		}
	}, [data]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: FIXME
	useEffect(() => {
		const properties: Properties = {};
		for (const column of columns) {
			if (column.name) {
				properties[column.name] = {
					type: column.type,
					title: column.name,
					position: column.additionalAttributes.position,
					unit: column.additionalAttributes.unit,
					keyword: column.additionalAttributes.keyword,
					description: column.additionalAttributes.description,
				};
			}
		}

		if (setContent) {
			setContent({
				type: "object",
				properties,
			});
		}
	}, [columns]);

	const renderPanelHeaderParent = () => {
		const items: MenuProps["items"] = [
			{
				key: "delete-data-structure",
				label: (
					<button
						type="button"
						onClick={() => {
							if (setTemplateDataStructure) setTemplateDataStructure(undefined);
						}}
					>
						削除
					</button>
				),
			},
		];
		return (
			<div
				style={{
					display: "flex",
					alignItems: "center",
					gap: "4px",
					justifyContent: "space-between",
				}}
			>
				<span className="mr-2">構造化</span>

				{setTemplateDataStructure && (
					<Dropdown
						className="ml-2"
						menu={{ items }}
						placement="topLeft"
						arrow
						trigger={["click"]}
					>
						<button type="button">
							<Icon icon="dotsThreeVertical" />
						</button>
					</Dropdown>
				)}
			</div>
		);
	};

	const renderPanelHeader = (column: ColumnType, index: number) => {
		const items: MenuProps["items"] = [
			{
				key: index,
				label: <button type="button">複製</button>,
			},
			{
				key: index,
				label: <button type="button">削除</button>,
			},
		];
		return (
			<div className="panel-header">
				<span className="panel-header-item">
					カラム名
					<span className="pl-1 text-red-700 font-bold">*</span>
				</span>

				<div className="panel-header-input panel-header-item">
					<Input value={column.name} style={{ width: "100%" }} />
				</div>

				<span className="panel-header-type panel-header-item">
					<Select
						value={column.type}
						style={{ width: "100%" }}
						options={optionsTypeCol}
					/>
				</span>

				<Dropdown
					className="ml-2 panel-header-item"
					menu={{ items }}
					placement="topLeft"
					arrow
					trigger={["click"]}
				>
					<button type="button" disabled={isPreview}>
						<Icon icon="dotsThreeVertical" />
					</button>
				</Dropdown>
			</div>
		);
	};

	const renderPanelItems = () => {
		return columns.map((column, index) => ({
			key: `column-${index}`,
			label: renderPanelHeader(column, index),
			showArrow: true,
			style: {
				marginBottom: "10px",
				backgroundColor: "rgba(0, 0, 0, 0.02)",
				borderRadius: "5px",
				border: "unset",
			},
			children: (
				<>
					<div className="column-setting">
						<label>
							<span className="mr-2">
								タイプ
								<span className="pl-1 text-red-700 font-bold">*</span>
							</span>
						</label>
						<Select
							value={column.type}
							style={{ width: "100%" }}
							options={optionsTypeCol}
						/>
					</div>
					<div className="column-setting">
						<label>ポジション</label>
						<Input
							placeholder={jp.common.placeholder}
							value={column.additionalAttributes.position}
						/>
					</div>
					<div className="column-setting">
						<label>単位</label>
						<Input
							placeholder={jp.common.placeholder}
							value={column.additionalAttributes.unit}
						/>
					</div>
					<div className="column-setting">
						<label>キーワード</label>
						<TextArea
							size="small"
							placeholder={jp.common.placeholder}
							value={column.additionalAttributes.keyword}
						/>
					</div>
					<div className="column-setting">
						<label>自由文</label>
						<TextArea
							placeholder={jp.common.placeholder}
							size="middle"
							value={column.additionalAttributes.description}
						/>
					</div>
				</>
			),
		}));
	};

	return (
		<SettingOperatorTemplateS
			className={isActive ? "active-step-workflow" : ""}
		>
			<Collapse
				defaultActiveKey={["data-structure"]}
				style={{
					backgroundColor: "unset",
					border: "unset",
					margin: 0,
				}}
				collapsible={"icon"}
				expandIconPosition={"end"}
				items={[
					{
						key: "data-structure",
						label: renderPanelHeaderParent(),
						showArrow: true,
						className: "panel",
						children: (
							<Collapse
								activeKey={activeKeys}
								style={{
									backgroundColor: "unset",
									border: "unset",
									margin: 0,
								}}
								collapsible={"icon"}
								expandIconPosition={"end"}
								onChange={(keys) => {
									setActiveKeys(keys as (string | number)[]);
								}}
								items={[
									...renderPanelItems(),
									{
										key: "data-structure-add-context",
										label: (
											<div
												style={{
													display: "flex",
													alignItems: "center",
													gap: "4px",
												}}
											>
												<span className="mr-2">
													出典名作成 <span className="required">*</span>
												</span>
											</div>
										),
										showArrow: true,
										style: {
											marginBottom: "10px",
											backgroundColor: "rgba(0, 0, 0, 0.02)",
											borderRadius: "5px",
											border: "unset",
										},
										children: (
											<DataStructureAddContext data={data} mode={mode} />
										),
									},
									{
										key: "data-structure-prompt",
										label: (
											<div
												style={{
													display: "flex",
													alignItems: "center",
													gap: "4px",
												}}
											>
												<span className="mr-2">{jp.common.freePrompt}</span>
											</div>
										),
										showArrow: true,
										style: {
											marginBottom: "10px",
											backgroundColor: "rgba(0, 0, 0, 0.02)",
											borderRadius: "5px",
											border: "unset",
										},
										children: (
											<Input.TextArea
												placeholder={jp.common.typeSomething}
												value={prompt}
											/>
										),
									},
								]}
								className="collapse-child"
							/>
						),
					},
				]}
			/>
		</SettingOperatorTemplateS>
	);
};

export default DataStructureAddCol;
