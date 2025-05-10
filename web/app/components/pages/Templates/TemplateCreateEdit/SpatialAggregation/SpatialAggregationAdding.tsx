import type { JsonValue } from "@prisma/client/runtime/library";
import type * as React from "react";
import { useEffect, useState } from "react";
import { CONTENT_FIELD_TYPE, type SelectRowIdT } from "~/commons/core.const";
import jp from "~/commons/locales/jp";
import Button from "~/components/atoms/Button";
import Checkbox from "~/components/atoms/Checkbox";
import Collapse from "~/components/atoms/Collapse";
import Dropdown, { type MenuProps } from "~/components/atoms/Dropdown";
import Icon from "~/components/atoms/Icon";
import Input from "~/components/atoms/Input";
import Select from "~/components/atoms/Select";
import Table from "~/components/atoms/Table";
import ViewerContainer from "~/components/pages/Operators/ViewerContent/ViewerContainer";
import {
	ColumnItem,
	TableChooseContent,
} from "~/components/pages/Operators/styles";
import { InputOperatorS } from "~/components/pages/Operators/styles";
import {
	SETTING_TYPE_CROSS_TAB,
	type SettingCrossTab,
} from "~/components/pages/Operators/types";
import { SettingOperatorTemplateS } from "~/components/pages/Templates/styles";
import type { MODE_TEMPLATE } from "~/components/pages/Templates/types";
import type { ContentItem } from "~/models/content";

const columnSelected = [
	{
		title: jp.common.title,
		dataIndex: "title",
		key: "title",
		render: (text: string) => (
			<div className="title-content">
				<Icon icon="schema" size={14} />
				<span>{text}</span>
			</div>
		),
	},
	{
		title: jp.common.updatedAt,
		dataIndex: "updateAt",
		key: "updateAt",
	},
];

const spatialAggregateOptions = [
	{ value: SETTING_TYPE_CROSS_TAB.TOTAL_AVERAGE, label: "合計／平均" },
	{ value: SETTING_TYPE_CROSS_TAB.COUNT, label: "カウント" },
];

interface Props {
	data?: JsonValue | null;
	mode?: MODE_TEMPLATE;
	handleRemoveTemplateByIndex?: () => void;
	isActive?: boolean;
}

const SpatialAggregationAdding: React.FC<Props> = (props) => {
	const { data, handleRemoveTemplateByIndex, isActive } = props;
	const [content, setContent] = useState<ContentItem | undefined>();
	const isGeoJson = content
		? content?.schema?.fields?.some(
				(field) => field?.type === CONTENT_FIELD_TYPE.GEO,
			)
		: false;
	const updatedAt = new Date(content?.updatedAt ?? "");

	const [setting, setSetting] = useState<SettingCrossTab>({
		type: SETTING_TYPE_CROSS_TAB.TOTAL_AVERAGE,
		data: {
			columnUnit: [{ id: 1, value: "" }],
			columnTarget: [{ id: 1, name: "", sum: false, avg: false, cnt: false }],
		},
	});
	const [selectedRowId, setSelectedRowId] = useState<SelectRowIdT | null>(null);

	// Handle detail UI
	useEffect(() => {
		if (data) {
			const configJson = typeof data === "string" ? JSON.parse(data ?? "") : {};
			setSetting(configJson?.settingDetail?.setting);
			setContent(
				configJson?.settingDetail
					? "content" in configJson.settingDetail // [Content] Handle for old data
						? configJson.settingDetail.content
						: configJson.settingDetail.schema
					: undefined,
			);
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

					<span className="mr-2">空間集計</span>
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
							label: renderPanelHeaderParent(),
							key: 1,
							showArrow: true,
							className: "panel panel-spatial-aggregation",
							children: (
								<div className="panel-content-spatial-aggregation">
									<TableChooseContent>
										<Table
											dataSource={
												content
													? [
															{
																key: content?.id,
																id: content?.id,
																title: content?.name,
																updateAt: `${updatedAt.getUTCFullYear()}-${
																	updatedAt.getUTCMonth() + 1
																}-${updatedAt.getUTCDate()} ${updatedAt.getUTCHours()}:${updatedAt.getUTCMinutes()}`,
															},
														]
													: []
											}
											columns={columnSelected}
											pagination={false}
											className="panel-table"
										/>

										{content ? (
											<InputOperatorS className="setting-tab">
												<div className="viewer">
													<ViewerContainer
														isPreview={false}
														item={content}
														hasGeoData={isGeoJson}
														wrapperClassName="viewer-content"
														gisMapClassName="h-40 b-bottom"
														tableClassName={`content-viewer ${isGeoJson ? "h-60" : "h-100"}`}
														selectedRowId={selectedRowId}
														onSelectRow={
															isGeoJson ? setSelectedRowId : undefined
														}
														isPaginationShorten
													/>
												</div>
											</InputOperatorS>
										) : null}

										{content ? (
											<div className="change-content">
												<button type="button">
													{jp.common.content}
													{jp.common.change}
												</button>
											</div>
										) : (
											<Button
												type="dashed"
												className="button-add-col"
												icon={<Icon icon="plus" />}
											>
												{jp.common.content}
												{jp.common.add}
											</Button>
										)}
									</TableChooseContent>

									<div className="wrap-spatial-aggregation-select">
										<Select
											className="spatial-aggregation-select"
											value={setting?.type}
											options={spatialAggregateOptions}
										/>
									</div>

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

export default SpatialAggregationAdding;
