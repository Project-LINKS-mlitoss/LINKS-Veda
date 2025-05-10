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
import Table from "~/components/atoms/Table";
import ViewerContainer from "~/components/pages/Operators/ViewerContent/ViewerContainer";
import { InputOperatorS } from "~/components/pages/Operators/styles";
import type { ContentTextMatching } from "~/components/pages/Operators/types";
import { SettingOperatorTemplateS } from "~/components/pages/Templates/styles";
import { MODE_TEMPLATE } from "~/components/pages/Templates/types";
import type { ContentItem } from "~/models/content";
interface Props {
	data?: JsonValue | null;
	mode?: MODE_TEMPLATE;
	handleRemoveTemplateByIndex?: () => void;
	isActive?: boolean;
}

const TextMatchingAddContent: React.FC<Props> = (props) => {
	const { data, mode, handleRemoveTemplateByIndex, isActive } = props;
	const isPreview = mode === MODE_TEMPLATE.USE;

	const [contents, setContents] = useState<ContentTextMatching[]>([]);
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
	const [leftField, setLeftField] = useState("");
	const [selectedRowId, setSelectedRowId] = useState<SelectRowIdT | null>(null);

	// handle detail UI
	useEffect(() => {
		if (data) {
			const configJson = typeof data === "string" ? JSON.parse(data ?? "") : {};
			if (configJson) {
				setContents(
					"contents" in configJson // [Content] Handle for old data
						? configJson.contents
						: configJson?.schemas ?? [],
				);
				setLeftField(configJson?.settingTextMatching?.where[0]?.leftField);
			}
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

					<span className="mr-2">テキストマッチング</span>
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

	const renderPanelHeader = (content: ContentTextMatching, index: number) => {
		const items: MenuProps["items"] = [
			{
				key: `clone-${index}`,
				label: <button type="button">複製</button>,
				disabled: true,
			},
			{
				key: `delete-${index}`,
				label: <button type="button">削除</button>,
			},
		];

		return (
			<div
				className="panel-header-item"
				style={{ display: "flex", alignItems: "center", gap: "4px" }}
			>
				<div className="panel-header-side">
					<Icon icon="dotsSixVertical" />
					<span className="mr-2">結合コンテンツ</span>
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
							label: (
								<>
									{renderPanelHeaderParent()}

									<div className="header-panel-key-value">
										<p>結合キーカラム</p>
										<Input value={leftField} />
									</div>
								</>
							),
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
										items={contents?.map((content, contentIndex) => {
											// [Content] Handle for old data
											const contentDetail = (
												"schema" in content ? content?.schema : content?.content
											) as ContentItem;
											const updatedAt = new Date(contentDetail?.updatedAt);
											const cols = content?.column;

											return {
												className:
													"panel panel-child panel-text-match-spatial-join",
												header: renderPanelHeader(content, contentIndex),
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
															columns={[
																{
																	title: jp.common.title,
																	dataIndex: "title",
																	key: "title",
																	render: (text) => (
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
															]}
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
															{cols?.map((col, colIndex) => {
																return (
																	<div className="col" key={col?.key}>
																		<div className="col-key">{col?.key}</div>
																		<div className="col-value">
																			<Input value={col?.value} />

																			{colIndex > 1 && (
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

export default TextMatchingAddContent;
