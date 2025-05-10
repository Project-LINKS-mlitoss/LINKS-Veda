import type { JsonValue } from "@prisma/client/runtime/library";
import type * as React from "react";
import { useEffect, useState } from "react";
import { CONTENT_FIELD_TYPE, type SelectRowIdT } from "~/commons/core.const";
import jp from "~/commons/locales/jp";
import Button from "~/components/atoms/Button";
import Collapse from "~/components/atoms/Collapse";
import Dropdown, { type MenuProps } from "~/components/atoms/Dropdown";
import Icon from "~/components/atoms/Icon";
import Input from "~/components/atoms/Input";
import InputNumber from "~/components/atoms/InputNumber";
import Select from "~/components/atoms/Select";
import Table from "~/components/atoms/Table";
import ViewerContainer from "~/components/pages/Operators/ViewerContent/ViewerContainer";
import { InputOperatorS } from "~/components/pages/Operators/styles";
import {
	type ContentSpatialJoin,
	SETTING_TYPE_SPATIAL_JOIN,
} from "~/components/pages/Operators/types";
import { SettingOperatorTemplateS } from "~/components/pages/Templates/styles";
import { MODE_TEMPLATE } from "~/components/pages/Templates/types";
import type { ContentItem } from "~/models/content";

interface Props {
	contentIdLeft: string;
	data?: JsonValue | null;
	mode?: MODE_TEMPLATE;
	handleRemoveTemplateByIndex?: () => void;
	isActive?: boolean;
}

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

const optionsSetting = [
	{
		label: "最近傍結合",
		value: SETTING_TYPE_SPATIAL_JOIN.NEAREST,
	},
	{
		label: "交差",
		value: SETTING_TYPE_SPATIAL_JOIN.INTERSECTS,
	},
];

const SpatialJoinAddContent: React.FC<Props> = (props) => {
	const { data, mode, handleRemoveTemplateByIndex, isActive } = props;
	const isPreview = mode === MODE_TEMPLATE.USE;

	const [contents, setContents] = useState<ContentSpatialJoin[]>([]);
	const contentDetail = (
		contents[0] && "schema" in contents[0] // [Content] Handle for old data
			? contents[0].schema
			: contents[0]?.content
	) as ContentItem;
	const isGeoJson = contentDetail
		? contentDetail?.schema?.fields?.some(
				(field) => field?.type === CONTENT_FIELD_TYPE.GEO,
			)
		: false;
	const [selectedRowId, setSelectedRowId] = useState<SelectRowIdT | null>(null);

	// handle detail UI
	useEffect(() => {
		if (data) {
			const configJson = typeof data === "string" ? JSON.parse(data ?? "") : {};
			const contents =
				configJson && "contents" in configJson // [Content] Handle for old data
					? configJson.contents
					: configJson?.schemas;
			setContents(contents);
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

					<span className="mr-2">空間結合</span>
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

	const renderPanelHeader = (index: number) => {
		const items: MenuProps["items"] = [
			{
				key: `clone-${index}`,
				label: <button type="button">複製</button>,
				disabled: true,
			},
			{
				key: `delete-${index}`,
				label: (
					<button type="button" disabled>
						削除
					</button>
				),
			},
		];

		return (
			<div
				className="panel-header-item"
				style={{ display: "flex", alignItems: "center", gap: "4px" }}
			>
				<div className="panel-header-side">
					<Icon icon="dotsSixVertical" />
					<span className="mr-2">結合地図データ</span>
				</div>
				<div className="panel-header-side">
					<Dropdown
						className="ml-2"
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
							className: "panel panel-text-match-spatial-join",
							children: (
								<>
									<Collapse
										defaultActiveKey={["content-0"]}
										collapsible={"icon"}
										expandIconPosition={"end"}
										className="coll"
										items={contents.map((content, contentIndex) => {
											// [Content] Handle for old data
											const contentDetail = (
												"schema" in content ? content?.schema : content?.content
											) as ContentItem;
											const updatedAt = new Date(contentDetail?.updatedAt);
											const cols = content?.column;

											return {
												className:
													"panel panel-child panel-text-match-spatial-join",
												label: renderPanelHeader(contentIndex),
												key: `content-${contentIndex}`,
												showArrow: true,
												children: (
													<>
														<Table
															dataSource={
																contentDetail
																	? [
																			{
																				key: contentDetail?.id,
																				id: contentDetail?.id,
																				title: contentDetail?.name,
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

														{contentDetail ? (
															<InputOperatorS className="setting-tab">
																<div className="viewer">
																	<ViewerContainer
																		isPreview={false}
																		item={contentDetail}
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

														<div className="change-content">
															<button type="button">
																{jp.common.content}
																{jp.operator.change}
															</button>
														</div>

														<div className="cols">
															<div className="col">
																<div className="col-key">結合方式</div>
																<div className="col-value">
																	<Select
																		defaultValue={
																			SETTING_TYPE_SPATIAL_JOIN.NEAREST
																		}
																		value={content?.setting?.op}
																		options={optionsSetting}
																	/>
																</div>
															</div>
															{content?.setting?.op ===
																SETTING_TYPE_SPATIAL_JOIN.NEAREST && (
																<div className="col">
																	<div className="col-key">検索上限範囲</div>
																	<div className="col-value">
																		<InputNumber
																			value={content?.setting?.distance}
																			step={0.01}
																			precision={2}
																			min={0}
																			onKeyPress={(event) => {
																				const char = String.fromCharCode(
																					event.which,
																				);

																				if (!/[0-9.]$/.test(char)) {
																					event.preventDefault();
																				}
																			}}
																		/>

																		<span>km</span>
																	</div>
																</div>
															)}
														</div>

														<div className="cols">
															{cols?.map((col, colIndex) => {
																return (
																	<div className="col" key={col?.key}>
																		<div className="col-key">{col?.key}</div>
																		<div className="col-value">
																			<Input value={col?.value} />

																			{colIndex > 0 && (
																				<Button
																					type="text"
																					icon={<Icon icon="close" />}
																				/>
																			)}
																		</div>
																	</div>
																);
															})}
														</div>
													</>
												),
											};
										})}
									/>
								</>
							),
						},
					]}
				/>
			</div>
		</SettingOperatorTemplateS>
	);
};

export default SpatialJoinAddContent;
