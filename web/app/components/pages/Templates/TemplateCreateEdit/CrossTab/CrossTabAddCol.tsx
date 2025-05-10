import type { JsonValue } from "@prisma/client/runtime/library";
import type * as React from "react";
import { useEffect, useState } from "react";
import Button from "~/components/atoms/Button";
import Checkbox from "~/components/atoms/Checkbox";
import Collapse from "~/components/atoms/Collapse";
import Dropdown, { type MenuProps } from "~/components/atoms/Dropdown";
import Icon from "~/components/atoms/Icon";
import Input from "~/components/atoms/Input";
import Select from "~/components/atoms/Select";
import { ColumnItem } from "~/components/pages/Operators/styles";
import {
	SETTING_TYPE_CROSS_TAB,
	type SettingCrossTab,
} from "~/components/pages/Operators/types";
import { SettingOperatorTemplateS } from "~/components/pages/Templates/styles";
import type { MODE_TEMPLATE } from "~/components/pages/Templates/types";

const { Option } = Select;

interface Props {
	data?: JsonValue | null;
	mode?: MODE_TEMPLATE;
	handleRemoveTemplateByIndex?: () => void;
	isActive?: boolean;
}

const CrossTabAddCol: React.FC<Props> = (props) => {
	const { data, mode, handleRemoveTemplateByIndex, isActive } = props;
	const [setting, setSetting] = useState<SettingCrossTab>({
		type: SETTING_TYPE_CROSS_TAB.TOTAL_AVERAGE,
		data: {
			columnUnit: [{ id: 1, value: "" }],
			columnTarget: [{ id: 1, name: "", sum: false, avg: false, cnt: false }],
		},
	});

	// handle detail UI
	useEffect(() => {
		if (data) {
			const configJson = typeof data === "string" ? JSON.parse(data ?? "") : {};
			setSetting(configJson?.setting);
		}
	}, [data]);

	const renderPanelHeaderParent = () => {
		const items: MenuProps["items"] = [
			{
				key: "delete-data-structure",
				label: (
					<button
						type="button"
						onClick={() => {
							if (handleRemoveTemplateByIndex) handleRemoveTemplateByIndex();
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
				<div className="header-panel">
					<Icon icon="dotsSixVertical" />

					<span className="mr-2">クロス集計</span>
				</div>

				{handleRemoveTemplateByIndex && (
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

	return (
		<SettingOperatorTemplateS
			className={isActive ? "active-step-workflow" : ""}
		>
			<div className="add-option">
				<Collapse
					defaultActiveKey={[1]}
					collapsible={"icon"}
					expandIconPosition={"end"}
					className="coll"
					items={[
						{
							label: (
								<>
									{renderPanelHeaderParent()}

									<div className="header-panel-cross-tab">
										<Select
											className="header-panel-cross-tab-select"
											value={setting?.type}
										>
											<Option value={SETTING_TYPE_CROSS_TAB.TOTAL_AVERAGE}>
												合計／平均
											</Option>
											<Option value={SETTING_TYPE_CROSS_TAB.COUNT}>
												カウント
											</Option>
										</Select>
									</div>
								</>
							),
							key: 1,
							showArrow: true,
							className: "panel panel-cross-tab",
							children: (
								<div className="panel-content-cross-tab">
									<div className="column-unit">
										{setting?.data?.columnUnit?.map((col, index) => {
											return (
												<ColumnItem key={col?.id}>
													<div className="column-item-title">集計単位</div>

													<div className="column-item-content">
														<Input value={col?.value} />

														{index > 0 && (
															<Button
																type="text"
																icon={<Icon icon="close" />}
															/>
														)}
													</div>
												</ColumnItem>
											);
										})}
									</div>

									<div className="column-target">
										{setting?.type === SETTING_TYPE_CROSS_TAB.TOTAL_AVERAGE
											? setting?.data?.columnTarget?.map((col, index) => {
													return (
														<ColumnItem key={col?.id}>
															<div className="column-item-title">集計対象</div>

															<div className="column-item-content">
																<div className="column-item-target-content">
																	<Input value={col?.name} />

																	<Checkbox checked={col?.sum}>合計</Checkbox>

																	<Checkbox checked={col?.avg}>平均</Checkbox>
																</div>

																{index > 0 && (
																	<Button
																		type="text"
																		icon={<Icon icon="close" />}
																	/>
																)}
															</div>
														</ColumnItem>
													);
												})
											: setting?.data?.columnTarget?.map((col, index) => {
													return (
														<ColumnItem key={col?.id}>
															<div className="column-item-title">集計対象</div>

															<div className="column-item-content">
																<Input value={col?.name} />

																{index > 0 && (
																	<Button
																		type="text"
																		icon={<Icon icon="close" />}
																	/>
																)}
															</div>
														</ColumnItem>
													);
												})}
									</div>
								</div>
							),
						},
					]}
				/>
			</div>
		</SettingOperatorTemplateS>
	);
};

export default CrossTabAddCol;
