import {
	useActionData,
	useFetcher,
	useLocation,
	useNavigate,
	useSearchParams,
	useSubmit,
} from "@remix-run/react";
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
import Modal from "~/components/atoms/Modal";
import notification from "~/components/atoms/Notification";
import Select from "~/components/atoms/Select";
import Table from "~/components/atoms/Table";
import Tabs from "~/components/atoms/Tabs";
import { showNotification } from "~/components/molecules/Common/utils";
import ModalChooseContent from "~/components/pages/Operators/Modal/ModalChooseContent";
import ModalContentDetail from "~/components/pages/Operators/Modal/ModalContentDetail";
import ModalSaveTemplate from "~/components/pages/Operators/Modal/ModalSaveTemplate";
import ViewerContainer from "~/components/pages/Operators/ViewerContent/ViewerContainer";
import {
	InputOperatorS,
	ModalGenerate,
	SettingOperatorS,
} from "~/components/pages/Operators/styles";
import {
	type ContentSpatialJoin,
	type OptionColumnsT,
	SETTING_TYPE_SPATIAL_JOIN,
} from "~/components/pages/Operators/types";
import { parseConfigJson } from "~/components/pages/Operators/utils";
import ModalSelectTemplate from "~/components/pages/Templates/Modal/ModalSelectTemplate";
import type { ContentItem } from "~/models/content";
import {
	ACTION_TYPES_OPERATOR,
	type RequestSpatialJoin,
	type SpatialJoinContentConfigs,
} from "~/models/operators";
import {
	OPERATOR_TYPE,
	type TemplatesT,
	type WorkflowT,
	operatorTypeToUrlMap,
} from "~/models/templates";
import type { ApiResponse } from "~/repositories/utils";
import { routes } from "~/routes/routes";

const { Panel } = Collapse;
const { TabPane } = Tabs;

interface Props {
	contentIdLeft: string;
	data?: SpatialJoinContentConfigs | null;
	workflowDetail?: WorkflowT | undefined;
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

const Setting: React.FC<Props> = (props) => {
	// Props
	const { contentIdLeft, data, workflowDetail } = props;

	const navigate = useNavigate();
	const submit = useSubmit();
	const actionData = useActionData<ApiResponse<SpatialJoinContentConfigs>>();
	const location = useLocation();
	const fullPath = `${location.pathname}${location.search}`;
	const [searchParams] = useSearchParams();
	const templateIdURL = searchParams.get("templateId");
	const fetchTemplateDetail = useFetcher<ApiResponse<TemplatesT>>();

	// State
	const [isUnloadModalOpen, setIsUnloadModalOpen] = useState(false);
	const [isDiscardModalOpen, setIsDiscardModalOpen] = useState(false);
	const [modalText, setModalText] = useState("");
	const [isFormDirty, setIsFormDirty] = useState(false);
	const [startedGenerate, setStartedGenerate] = useState(false);
	const [contents, setContents] = useState<ContentSpatialJoin[]>([]);
	const contentDetail = (
		contents[0] && "schema" in contents[0] // [Content] Handle for old data
			? contents[0].schema
			: contents[0]?.content
	) as ContentItem;
	const isGeoJson = contentDetail
		? contentDetail?.schema?.fields?.some(
				// No change schema to content because this is data from CMS
				(field) => field?.type === CONTENT_FIELD_TYPE.GEO,
			)
		: false;
	const [activeKeys, setActiveKeys] = useState<(string | number)[]>([]);
	const [isLoadingGenerate, setIsLoadingGenerate] = useState(false);

	const [optionColumnsRight, setOptionColumnsRight] = useState<
		OptionColumnsT[] | undefined
	>();

	const [isModalChooseContentOpen, setIsModalChooseContentOpen] =
		useState(false);
	const [isModalDetailContentOpen, setIsModalDetailContentOpen] =
		useState(false);
	const [tempSelectedContent, setTempSelectedContent] = useState<
		ContentItem | undefined
	>();
	const [requestSpatialJoin, setRequestSpatialJoin] =
		useState<RequestSpatialJoin>({
			inputLeft: "",
			inputRight: "",
			op: "nearest",
		});
	const [selectedRowId, setSelectedRowId] = useState<SelectRowIdT | null>(null);

	// State Save Template
	const [isOpenModalSaveTemplate, setIsOpenModalSaveTemplate] = useState(false);
	const [isLoadingSave, setIsLoadingSave] = useState(false);
	const [templateName, setTemplateName] = useState("");
	const [templateId, setTemplateId] = useState<number>();
	const [templateDetail, setTemplateDetail] = useState<TemplatesT>();
	// State Use Template
	const [isModalSelectOpen, setIsModalSelectOpen] = useState(false);
	const [tempTemplate, setTempTemplate] = useState<TemplatesT | WorkflowT>();

	// Data
	const dataFirstTemplateWorkflow = Array.isArray(
		workflowDetail?.workflowDetails,
	)
		? workflowDetail.workflowDetails[0]
		: undefined;
	const configJson = data?.configJson
		? parseConfigJson(data.configJson)
		: templateDetail?.configJson
			? parseConfigJson(templateDetail.configJson)
			: dataFirstTemplateWorkflow?.configJson
				? parseConfigJson(dataFirstTemplateWorkflow.configJson)
				: {};
	const isDisabledForWorkflow = !!workflowDetail;

	// Handle for template
	useEffect(() => {
		if (templateDetail) {
			setTemplateId(templateDetail?.id);
			setTemplateName(templateDetail?.name);
			setTempTemplate(templateDetail);
		}
	}, [templateDetail]);
	// biome-ignore lint/correctness/useExhaustiveDependencies: FIXME
	useEffect(() => {
		if (templateIdURL) {
			fetchTemplateDetail.load(`${routes.template}/${templateIdURL}`);
		}
	}, [templateIdURL]);
	useEffect(() => {
		if (fetchTemplateDetail?.data?.status) {
			setTemplateDetail(fetchTemplateDetail?.data?.data);
		}
	}, [fetchTemplateDetail]);

	// Handle detail UI
	// biome-ignore lint/correctness/useExhaustiveDependencies: FIXME
	useEffect(() => {
		if ((data || templateDetail || dataFirstTemplateWorkflow) && configJson) {
			const contents =
				configJson && "contents" in configJson // [Content] Handle for old data
					? configJson.contents
					: configJson?.schemas;
			setContents(
				contents?.map((item: ContentSpatialJoin) => ({
					...item,
					column: item?.column ?? [{ key: "結合対象カラム", value: "" }],
				})),
			);

			setTempSelectedContent(contents?.[0]?.content ?? contents?.[0]?.schema);
		}
	}, [data, templateDetail, dataFirstTemplateWorkflow]);

	// Handle before unload, navigate
	const handleBeforeUnload = (event: {
		preventDefault: () => void;
		returnValue: string;
	}) => {
		handleNavigate(event);
	};
	// biome-ignore lint/correctness/useExhaustiveDependencies: FIXME
	useEffect(() => {
		window.addEventListener("beforeunload", handleBeforeUnload);

		return () => {
			window.removeEventListener("beforeunload", handleBeforeUnload);
		};
	}, [isFormDirty, startedGenerate]);
	const handleNavigate = (event: {
		preventDefault: () => void;
		returnValue: string;
	}) => {
		if (startedGenerate || isFormDirty) {
			event.preventDefault();
			event.returnValue = "";
			if (startedGenerate) {
				setModalText(
					"リクエスト済みの処理の結果は「処理状況一覧」から確認してください。",
				);
				setIsUnloadModalOpen(true);
			} else if (!startedGenerate && isFormDirty) {
				setIsDiscardModalOpen(true);
			}
		}
	};

	// step 2
	const handleAddContent = () => {
		let newContent: ContentSpatialJoin;
		if (tempSelectedContent) {
			newContent = {
				content: tempSelectedContent,
				setting: {
					op: SETTING_TYPE_SPATIAL_JOIN.NEAREST,
					distance: 0,
				},
				column: [{ key: "結合対象カラム", value: "" }],
			};
		}
		setContents(() => [newContent]);
		setIsModalDetailContentOpen(false);
		setIsModalChooseContentOpen(false);
	};

	const handleSelectChange = (value: SETTING_TYPE_SPATIAL_JOIN) => {
		let newContent: ContentSpatialJoin;
		if (tempSelectedContent) {
			newContent = {
				content: tempSelectedContent,
				setting:
					value === SETTING_TYPE_SPATIAL_JOIN.NEAREST
						? {
								op: SETTING_TYPE_SPATIAL_JOIN.NEAREST,
								distance: 0,
							}
						: {
								op: SETTING_TYPE_SPATIAL_JOIN.INTERSECTS,
								distance: null,
							},
				column: [{ key: "結合対象カラム", value: "" }],
			};
		}
		setContents(() => [newContent]);
	};

	const handleInputCountChange = (val: number, contentIndex: number) => {
		setContents((prevContents) => {
			const updatedContents = [...prevContents];
			const contentToUpdate = updatedContents[contentIndex];
			contentToUpdate.setting = {
				op: SETTING_TYPE_SPATIAL_JOIN.NEAREST,
				distance: Number(val),
			};
			return updatedContents;
		});
	};

	const handleDeleteContent = (index: number) => {
		setContents((prevContents) => prevContents.filter((_, i) => i !== index));
	};

	const handleCloneContent = (index: number) => {
		setContents((prevContents) => [
			...prevContents.slice(0, index + 1),
			{ ...prevContents[index] },
			...prevContents.slice(index + 1),
		]);
	};

	const handleAddCol = (contentIndex: number) => {
		setContents((prevContents) => {
			const updatedContents = [...prevContents];
			const contentToUpdate = updatedContents[contentIndex];
			contentToUpdate?.column.push({
				key: contentToUpdate.column.length ? "" : "結合対象カラム",
				value: "",
			});
			return updatedContents;
		});
	};

	const handleDeleteCol = (contentIndex: number, colIndex: number) => {
		setContents((prevContents) => {
			const updatedContents = [...prevContents];
			const contentToUpdate = updatedContents[contentIndex];
			contentToUpdate.column = contentToUpdate.column.filter(
				(_, index) => index !== colIndex,
			);
			return updatedContents;
		});
	};

	const handleInputColChange = (
		contentIndex: number,
		colIndex: number,
		field: "key" | "value",
		newValue: string,
	) => {
		setContents((prevContents) => {
			const updatedContents = [...prevContents];
			const contentToUpdate = updatedContents[contentIndex];
			contentToUpdate.column[colIndex] = {
				...contentToUpdate.column[colIndex],
				[field]: newValue,
			};
			return updatedContents;
		});
	};

	const renderPanelHeader = (index: number) => {
		const items: MenuProps["items"] = [
			{
				key: `clone-${index}`,
				label: (
					<button
						type="button"
						onClick={() => handleCloneContent(index)}
						disabled
					>
						複製
					</button>
				),
				disabled: true,
			},
			{
				key: `delete-${index}`,
				label: (
					<button type="button" onClick={() => handleDeleteContent(index)}>
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
						<button type="button" disabled={isDisabledForWorkflow}>
							<Icon icon="dotsThreeVertical" />
						</button>
					</Dropdown>
				</div>
			</div>
		);
	};

	// step 1
	const handleUseTemplate = () => {
		setIsModalSelectOpen(true);
		setTempTemplate(templateDetail);
	};

	const handleSaveTemplate = () => {
		setIsFormDirty(false);
		setIsOpenModalSaveTemplate(true);
		if (templateDetail) {
			setTemplateId(templateDetail?.id);
			setTemplateName(templateDetail?.name);
		}
	};

	// function
	const handleOpenModalChooseContent = (type: string) => {
		if (type === "add" && contents?.length === 1) {
			notification.warning({
				message: jp.message.common.warning,
				description: jp.message.operator.onlySupportOneContent,
				placement: "topRight",
			});
			return;
		}

		setTempSelectedContent(contentDetail ?? undefined);
		setIsModalChooseContentOpen(true);
	};

	const handleOpenModalDetailContent = () => {
		setIsModalDetailContentOpen(true);
	};

	const handleAcceptedTemplate = () => {
		if (tempTemplate) {
			const tempChooseWorkflowT = tempTemplate as WorkflowT;
			if (workflowDetail && tempChooseWorkflowT?.workflowDetails) {
				navigate(
					`${
						operatorTypeToUrlMap[
							tempChooseWorkflowT?.workflowDetails[0]
								?.operatorType as OPERATOR_TYPE
						]
					}?workflowId=${tempChooseWorkflowT?.id}`,
				);
			} else {
				navigate(
					`${
						operatorTypeToUrlMap[OPERATOR_TYPE.SPATIAL_JOIN]
					}?templateId=${tempTemplate.id.toString()}`,
				);
			}
		}
		setIsModalSelectOpen(false);
	};

	// Handle generate
	useEffect(() => {
		if (contents?.length) {
			const contentItem = contents[0];
			const { content, column } = contentItem;

			// Start Handle get Option Columns Right
			setOptionColumnsRight(
				content?.schema?.fields
					?.filter((field) => field?.type !== CONTENT_FIELD_TYPE.GEO)
					?.map((field) => ({
						label: field?.key,
						value: field?.key,
					})),
			);

			const rq: RequestSpatialJoin = {
				inputLeft: contentIdLeft ?? "",
				inputRight: content?.id,
				op: contentItem?.setting?.op,
				distance: contentItem?.setting?.distance,
			};

			const keepRightFields = column
				.map((col) => col?.value)
				.filter((value) => value !== "");
			if (keepRightFields.length > 0) {
				rq.keepRightFields = keepRightFields;
			}

			setRequestSpatialJoin(rq);
		}
	}, [contents, contentIdLeft]);

	const handleStartGenerate = () => {
		setIsFormDirty(false);
		setStartedGenerate(true);
		if (workflowDetail) {
			handleStartWorkflow();
		} else {
			handleGenerate();
		}
	};

	const handleGenerate = () => {
		const formData = new FormData();
		formData.set(
			"requestSpatialJoin",
			JSON.stringify(requestSpatialJoin ?? {}),
		);
		formData.set("contents", JSON.stringify(contents ?? []));

		formData.set("actionType", ACTION_TYPES_OPERATOR.GENERATE);

		submit(formData, { method: "post", action: fullPath });
		setIsLoadingGenerate(true);
	};

	const handleSave = () => {
		const formData = new FormData();
		formData.set(
			"requestSpatialJoin",
			JSON.stringify(requestSpatialJoin ?? {}),
		);
		formData.set("contents", JSON.stringify(contents ?? []));

		formData.set("templateName", templateName ?? "");
		formData.set("actionType", ACTION_TYPES_OPERATOR.SAVE);
		if (templateId) {
			formData.set("templateId", String(templateId) ?? "");
		}

		submit(formData, { method: "post", action: fullPath });
		setIsLoadingSave(true);
	};

	const handleStartWorkflow = () => {
		const formData = new FormData();
		formData.set("input", JSON.stringify(contentIdLeft));
		formData.set(
			"workflowDetails",
			JSON.stringify(workflowDetail?.workflowDetails ?? []),
		);
		formData.set("actionType", ACTION_TYPES_OPERATOR.START_WORKFLOW);

		submit(formData, { method: "post", action: fullPath });
		setIsLoadingGenerate(true);
	};

	// Handle response
	// biome-ignore lint/correctness/useExhaustiveDependencies: FIXME
	useEffect(() => {
		const handleStartWorkflowAction = () => {
			if (actionData?.status === false) {
				showNotification(
					false,
					jp.message.operator.startWorkflowFailed,
					actionData.error,
				);
			} else {
				navigate(routes.processingStatus);
				showNotification(true, jp.message.operator.startWorkflowSuccess);
			}
			setStartedGenerate(false);
			setIsLoadingGenerate(false);
		};

		const handleGenerateAction = () => {
			if (actionData?.status === false) {
				showNotification(
					false,
					jp.message.operator.generateError,
					actionData.error,
				);
			} else {
				navigate(`${routes.operatorSpatialJoin}/${actionData?.data?.id}`);
				showNotification(true, jp.message.operator.generateSuccess);
			}
			setStartedGenerate(false);
			setIsLoadingGenerate(false);
		};

		const handleSaveAction = () => {
			if (actionData?.status === false) {
				showNotification(false, jp.message.common.saveFailed, actionData.error);
			} else {
				showNotification(true, jp.message.common.saveSuccessful);
				setIsOpenModalSaveTemplate(false);
			}
			setIsLoadingSave(false);
		};

		if (actionData) {
			switch (actionData.actionType) {
				case ACTION_TYPES_OPERATOR.GENERATE:
					handleGenerateAction();
					break;
				case ACTION_TYPES_OPERATOR.SAVE:
					handleSaveAction();
					break;
				case ACTION_TYPES_OPERATOR.START_WORKFLOW:
					handleStartWorkflowAction();
					break;
				default:
					break;
			}
		}
	}, [actionData]);

	return (
		<SettingOperatorS>
			<Tabs defaultActiveKey="1" type="card">
				<TabPane tab={jp.common.setting} key="1">
					<div className="tab-setting">
						<div className="step">
							<p className="step-name">{jp.common.setting}</p>

							<div className="button-template">
								<Button
									icon={<Icon icon="templateSchema" />}
									onClick={handleUseTemplate}
								>
									{jp.operator.useTemplate}
								</Button>
								<Button
									icon={<Icon icon="saveTemplate" />}
									onClick={handleSaveTemplate}
									disabled={!contents.length}
									loading={isLoadingSave}
								>
									{jp.common.saveTemplate}
								</Button>
							</div>

							<div className="add-option">
								<Collapse
									defaultActiveKey={[1]}
									collapsible={"icon"}
									expandIconPosition={"end"}
									className="coll"
								>
									<Panel
										header={
											<>
												<div className="header-panel">
													<Icon icon="dotsSixVertical" />

													<span className="mr-2">空間結合</span>
												</div>
											</>
										}
										key={1}
										showArrow={true}
										className="panel panel-text-match-spatial-join"
									>
										<Collapse
											activeKey={activeKeys}
											collapsible={"icon"}
											expandIconPosition={"end"}
											onChange={(keys) => {
												setActiveKeys(keys as (string | number)[]);
												setIsFormDirty(true);
											}}
											className="coll"
										>
											{contents.map((content, contentIndex) => {
												// [Content] Handle for old data
												const contentDetail = (
													"schema" in content
														? content?.schema
														: content?.content
												) as ContentItem;
												const updatedAt = new Date(contentDetail?.updatedAt);
												const cols = content?.column;

												return (
													<Panel
														className="panel panel-child panel-text-match-spatial-join"
														header={renderPanelHeader(contentIndex)}
														// biome-ignore lint/suspicious/noArrayIndexKey: FIXME
														key={`content-${contentIndex}`}
														showArrow={true}
													>
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
															<button
																disabled={isDisabledForWorkflow}
																type="button"
																onClick={() =>
																	handleOpenModalChooseContent("change")
																}
															>
																{jp.common.content}
																{jp.operator.change}
															</button>
														</div>

														<div className="cols">
															<div className="col">
																<div className="col-key">結合方式</div>
																<div className="col-value">
																	<Select
																		onChange={(
																			val: SETTING_TYPE_SPATIAL_JOIN,
																		) => {
																			handleSelectChange(val);
																		}}
																		defaultValue={
																			SETTING_TYPE_SPATIAL_JOIN.NEAREST
																		}
																		value={content?.setting?.op}
																		disabled={isDisabledForWorkflow}
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
																			disabled={isDisabledForWorkflow}
																			value={content?.setting?.distance}
																			onChange={(val) => {
																				handleInputCountChange(
																					val ?? 0,
																					contentIndex,
																				);
																			}}
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
																			{optionColumnsRight ? (
																				<Select
																					onChange={(value) =>
																						handleInputColChange(
																							contentIndex,
																							colIndex,
																							"value",
																							value,
																						)
																					}
																					options={optionColumnsRight}
																					disabled={isDisabledForWorkflow}
																					value={col?.value}
																				/>
																			) : (
																				<Input
																					disabled={isDisabledForWorkflow}
																					value={col?.value}
																					onChange={(e) =>
																						handleInputColChange(
																							contentIndex,
																							colIndex,
																							"value",
																							e.target.value,
																						)
																					}
																				/>
																			)}

																			{colIndex > 0 && (
																				<Button
																					disabled={isDisabledForWorkflow}
																					type="text"
																					icon={<Icon icon="close" />}
																					onClick={() =>
																						handleDeleteCol(
																							contentIndex,
																							colIndex,
																						)
																					}
																				/>
																			)}
																		</div>
																	</div>
																);
															})}

															<div className="col">
																<div className="col-key" />
																<div className="col-value notification-empty">
																	結合後にすべてのカラムを保持する場合は空欄
																</div>
															</div>

															<Button
																type="dashed"
																className="text-[#8080809c] font-bold mt-2 border-0 w-full"
																icon={<Icon icon="plus" />}
																onClick={() => handleAddCol(contentIndex)}
																disabled={isDisabledForWorkflow}
															>
																{jp.common.addColumn}
															</Button>
														</div>
													</Panel>
												);
											})}

											<Button
												type="dashed"
												className="text-[#8080809c] font-bold mt-2 border-0 w-full"
												icon={<Icon icon="plus" />}
												onClick={() => handleOpenModalChooseContent("add")}
												disabled={isDisabledForWorkflow}
											>
												{jp.common.content}
												{jp.common.add}
											</Button>
										</Collapse>
									</Panel>
								</Collapse>
							</div>
						</div>

						<div className="step">
							<p className="step-name">{jp.common.freePrompt}</p>
							<div className="add-context">
								<Input.TextArea
									placeholder={jp.common.typeSomething}
									onChange={() => setIsFormDirty(true)}
								/>
							</div>
						</div>
					</div>
				</TabPane>
				<TabPane tab={jp.common.history} key="2">
					<p>Content for History Tab</p>
				</TabPane>
			</Tabs>

			<div className="button-bottom">
				<Button
					type="primary"
					disabled={startedGenerate || !contents.length || !contentIdLeft}
					icon={<Icon icon="settings" size={16} />}
					loading={isLoadingGenerate}
					onClick={handleStartGenerate}
				>
					{jp.common.startGenerate}
				</Button>
			</div>

			<Modal
				title={jp.common.backgroundProcessing}
				centered
				onCancel={() => setIsUnloadModalOpen(false)}
				open={isUnloadModalOpen}
				width={640}
				footer={[
					<div key="divider">
						<hr className="mb-2" />
					</div>,
					<Button key="template" onClick={() => setIsUnloadModalOpen(false)}>
						Save as Template
					</Button>,
					<Button key="ok" onClick={() => setIsUnloadModalOpen(false)}>
						{jp.common.yes}
					</Button>,
					<Button
						key="cancel"
						type="primary"
						onClick={() => setIsUnloadModalOpen(false)}
					>
						{jp.common.cancel}
					</Button>,
				]}
			>
				<ModalGenerate>
					<p>{modalText}</p>
					<p>処理プログラムは保存されません。データを破棄しますか？</p>
				</ModalGenerate>
			</Modal>

			<Modal
				title="Discard Changes"
				centered
				open={isDiscardModalOpen}
				onCancel={() => setIsDiscardModalOpen(false)}
				width={640}
				footer={[
					<div key="divider">
						<hr className="mb-2" />
					</div>,
					<Button key="ok" onClick={() => setIsDiscardModalOpen(false)}>
						{jp.common.yes}
					</Button>,
					<Button
						key="cancel"
						type="primary"
						onClick={() => setIsDiscardModalOpen(false)}
					>
						{jp.common.cancel}
					</Button>,
				]}
			>
				<ModalGenerate>
					<p>プログラムは保存されていません。データを破棄しますか？</p>
				</ModalGenerate>
			</Modal>

			<ModalChooseContent
				isOpen={isModalChooseContentOpen}
				onCancel={() => setIsModalChooseContentOpen(false)}
				onOk={handleOpenModalDetailContent}
				tempSelectedContent={tempSelectedContent}
				setTempSelectedContent={setTempSelectedContent}
				selectedContent={tempSelectedContent}
				isOnlyGeojson={true}
			/>

			<ModalContentDetail
				isOpen={isModalDetailContentOpen}
				onCancel={() => setIsModalDetailContentOpen(false)}
				onApply={handleAddContent}
				selectedContent={tempSelectedContent}
			/>

			<ModalSaveTemplate
				isModalOpen={isOpenModalSaveTemplate}
				templateName={templateName}
				setNameTemplate={setTemplateName}
				templateId={templateId}
				setTemplateId={setTemplateId}
				onCancel={() => {
					setIsOpenModalSaveTemplate(false);
				}}
				handleSave={handleSave}
				isLoadingSave={isLoadingSave}
				operatorType={OPERATOR_TYPE.SPATIAL_JOIN}
			/>

			<ModalSelectTemplate
				isModalSelectOpen={isModalSelectOpen}
				setIsModalSelectOpen={setIsModalSelectOpen}
				tempTemplate={tempTemplate}
				setTempTemplate={setTempTemplate}
				operatorType={
					workflowDetail ? OPERATOR_TYPE.WORK_FLOW : OPERATOR_TYPE.SPATIAL_JOIN
				}
				handleAcceptedTemplate={handleAcceptedTemplate}
			/>
		</SettingOperatorS>
	);
};

export default Setting;
