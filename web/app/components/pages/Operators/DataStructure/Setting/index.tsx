import {
	useActionData,
	useFetcher,
	useLocation,
	useNavigate,
	useNavigation,
	useSearchParams,
	useSubmit,
} from "@remix-run/react";
import _ from "lodash";
import type * as React from "react";
import { useCallback, useEffect, useState } from "react";
import type { ConnectDragSource } from "react-dnd";
import jp from "~/commons/locales/jp";
import Button from "~/components/atoms/Button";
import Checkbox from "~/components/atoms/Checkbox";
import Dropdown, { type MenuProps } from "~/components/atoms/Dropdown";
import Icon from "~/components/atoms/Icon";
import Input from "~/components/atoms/Input";
import Modal from "~/components/atoms/Modal";
import notification from "~/components/atoms/Notification";
import Select from "~/components/atoms/Select";
import Tabs from "~/components/atoms/Tabs";
import TextArea from "~/components/atoms/TextArea";
import { showNotification } from "~/components/molecules/Common/utils";
import ModalSaveTemplate from "~/components/pages/Operators/Modal/ModalSaveTemplate";
import {
	ModalGenerate,
	SettingOperatorS,
} from "~/components/pages/Operators/styles";
import {
	type ColumnConfident,
	type ColumnData,
	type OptionsSuggest,
	TYPE_OUTPUT,
	VALID_TYPES,
} from "~/components/pages/Operators/types";
import { parseConfigJson } from "~/components/pages/Operators/utils";
import ModalSelectTemplate from "~/components/pages/Templates/Modal/ModalSelectTemplate";
import type { AssetItem } from "~/models/asset";
import {
	ACTION_TYPES_OPERATOR,
	type ContentConfig,
	type ContentI,
	type FilesArray,
	type GenSourceItem,
	type Properties,
} from "~/models/operators";
import {
	OPERATOR_TYPE,
	type TemplatesT,
	type WorkflowT,
	operatorTypeToUrlMap,
} from "~/models/templates";
import type { ApiResponse } from "~/repositories/utils";
import { routes } from "~/routes/routes";
import { DraggableColumn, DraggableField } from "./Draggable";
import History from "./History";

const { TabPane } = Tabs;

export type ColumnType = {
	name: string;
	type: string;
};

export type FieldType = { type: string; value: string };

interface Props {
	files: FilesArray | undefined;
	assetDetail: AssetItem | undefined;
	data?: ContentConfig | null | TemplatesT;
	columnConfident?: ColumnConfident;
	workflowDetail?: WorkflowT | undefined;
}

const optionsTypeCol = [
	{ value: VALID_TYPES.STRING, label: jp.common.string },
	{ value: VALID_TYPES.NUMBER, label: jp.common.int },
	{ value: VALID_TYPES.BOOLEAN, label: jp.common.boolean },
];

const SettingOperator: React.FC<Props> = (props) => {
	// Props
	const { files, assetDetail, data, columnConfident, workflowDetail } = props;

	// Remix
	const navigate = useNavigate();
	const submit = useSubmit();
	const actionData = useActionData<ApiResponse<ContentConfig>>();
	const navigation = useNavigation();
	const location = useLocation();
	const fullPath = `${location.pathname}${location.search}`;
	const [searchParams] = useSearchParams();
	const templateIdURL = searchParams.get("templateId");
	const fetchTemplateDetail = useFetcher<ApiResponse<TemplatesT>>();

	// State
	const [isUnloadModalOpen, setIsUnloadModalOpen] = useState(false);
	const [isDiscardModalOpen, setIsDiscardModalOpen] = useState(false);
	const [isOpenModalSaveTemplate, setIsOpenModalSaveTemplate] = useState(false);
	const [modalText, setModalText] = useState("");
	const [isFormDirty, setIsFormDirty] = useState(false);
	const [startedGenerate, setStartedGenerate] = useState(false);
	const [columns, setColumns] = useState<ColumnData[]>([]);
	const [fields, setFields] = useState<FieldType[]>([
		{ type: "text", value: "" },
	]);
	const [prompt, setPrompt] = useState("");
	const [typeOutput, setTypeOutput] = useState<TYPE_OUTPUT>(TYPE_OUTPUT.OBJECT);
	const [content, setContent] = useState<ContentI>();
	const [activeKeys, setActiveKeys] = useState<Record<string, string[]>>({});
	const [genSourceName, setGenSourceName] = useState<GenSourceItem[]>([]);
	const [isLoadingGenerate, setIsLoadingGenerate] = useState(false);
	const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false);

	// State Save Template
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

	// Handle setting detail
	// biome-ignore lint/correctness/useExhaustiveDependencies: FIXME
	useEffect(() => {
		if ((data || templateDetail || dataFirstTemplateWorkflow) && configJson) {
			const properties = configJson
				? ("content" in configJson ? configJson.content : configJson.schema) // [Content] Handle for old data
						?.properties
				: undefined;
			const initialColumnsData = Object.keys(properties).map((key) => ({
				id: String(Math.random()),
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

			const initialFieldsData = configJson.genSourceName.map(
				(field: GenSourceItem) => ({
					type: field.type,
					value: field.target,
				}),
			);
			setFields(initialFieldsData);

			setPrompt(configJson?.prompt);

			setTypeOutput(configJson?.typeOutput ?? TYPE_OUTPUT.OBJECT);
		}
	}, [data, templateDetail, dataFirstTemplateWorkflow]);

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

		setContent({
			type: "object",
			properties,
		});
	}, [columns]);

	// Handle before unload
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

	// Function
	const handleAddColumn = () => {
		setColumns([
			...columns,
			{
				id: String(Math.random()),
				name: "",
				type: "string",
				additionalAttributes: {
					position: "",
					unit: "",
					keyword: "",
					description: "",
				},
			},
		]);
	};

	const handleDeleteColumn = (index: number) => {
		setColumns(columns.filter((_, i) => i !== index));
	};

	const handleCloneColumn = (index: number) => {
		setColumns((prevColumns) => [
			...prevColumns.slice(0, index + 1),
			_.cloneDeep({
				...prevColumns[index],
				id: String(Math.random()),
			}),
			...prevColumns.slice(index + 1),
		]);
	};

	const handleMoveColumn = useCallback(
		(dragIndex: number, hoverIndex: number) => {
			const updatedColumns = _.cloneDeep(columns);
			const [removed] = updatedColumns.splice(dragIndex, 1);
			updatedColumns.splice(hoverIndex, 0, removed);
			setColumns(updatedColumns);
		},
		[columns],
	);

	// Render header Collapse
	const renderPanelHeader = (
		column: ColumnType,
		index: number,
		drag: ConnectDragSource,
		ref: React.RefObject<HTMLDivElement>,
	) => {
		const items: MenuProps["items"] = [
			{
				key: index,
				label: (
					<button type="button" onClick={() => handleCloneColumn(index)}>
						複製
					</button>
				),
			},
			{
				key: index,
				label: (
					<button type="button" onClick={() => handleDeleteColumn(index)}>
						削除
					</button>
				),
			},
		];
		return (
			<div ref={ref} className="panel-header">
				<div ref={drag} className="icon-drag">
					<Icon icon="dotsSixVertical" />
				</div>

				<span>
					カラム名
					<span className="pl-1 text-red-700 font-bold">*</span>
				</span>

				<div className="panel-header-input">
					<Input
						disabled={isDisabledForWorkflow}
						value={column.name}
						style={{ width: "100%" }}
						onChange={(e) => {
							const updatedColumns = [...columns];
							updatedColumns[index].name = e.target.value;
							setColumns(updatedColumns);
							setIsFormDirty(true);
						}}
					/>
				</div>

				<span className="panel-header-type">
					<Select
						value={column.type}
						style={{ width: "100%" }}
						onChange={(value) => {
							const updatedColumns = [...columns];
							updatedColumns[index].type = value;
							setColumns(updatedColumns);
							setIsFormDirty(true);
						}}
						disabled={isDisabledForWorkflow}
						options={optionsTypeCol}
					/>
				</span>

				<div>
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

	//step3
	const updateGenSourceName = () => {
		const newGenSourceName = fields
			.map((field) => {
				if (field.value) {
					return {
						type: field.type,
						target: field.value,
					};
				}
				return null;
			})
			.filter((item) => item !== null);

		setGenSourceName(newGenSourceName);
	};

	const handleMoveField = useCallback(
		(dragIndex: number, hoverIndex: number) => {
			const updatedFields = _.cloneDeep(fields);
			const [draggedField] = updatedFields.splice(dragIndex, 1);
			updatedFields.splice(hoverIndex, 0, draggedField);
			setFields(updatedFields);
		},
		[fields],
	);

	// biome-ignore lint/correctness/useExhaustiveDependencies: FIXME
	useEffect(() => {
		updateGenSourceName();
	}, [fields]);

	const handleFieldChange = (index: number, field: string, value: string) => {
		const updatedFields = [...fields];
		updatedFields[index] = { ...updatedFields[index], [field]: value };
		setFields(updatedFields);
	};

	const handleAddContext = () => {
		setFields([...fields, { type: "text", value: "" }]);
	};

	const handleRemoveContext = (index: number) => {
		const updatedFields = fields.filter((_, i) => i !== index);
		setFields(updatedFields);
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
						operatorTypeToUrlMap[OPERATOR_TYPE.DATA_STRUCTURE]
					}?templateId=${tempTemplate.id.toString()}`,
				);
			}
		}
		setIsModalSelectOpen(false);
	};

	// Handle generate
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
		if (!genSourceName?.length) {
			notification.warning({
				message: jp.message.common.warning,
				description: jp.message.operator.missingGenSourceName,
				placement: "topRight",
			});
			return;
		}

		const formData = new FormData();
		formData.set("assetId", assetDetail?.id ?? "");
		formData.set("files", JSON.stringify(files ?? []));
		formData.set("content", JSON.stringify(content));
		formData.set("genSourceName", JSON.stringify(genSourceName));
		formData.set("prompt", prompt ?? "");
		formData.set("typeOutput", typeOutput ?? TYPE_OUTPUT.OBJECT);
		formData.set("actionType", ACTION_TYPES_OPERATOR.GENERATE);

		submit(formData, { method: "post", action: fullPath });

		setIsLoadingGenerate(true);
	};

	const handleSave = () => {
		if (!genSourceName?.length) {
			notification.warning({
				message: jp.message.common.warning,
				description: jp.message.operator.missingGenSourceName,
				placement: "topRight",
			});
			return;
		}

		const formData = new FormData();
		formData.set("content", JSON.stringify(content));
		formData.set("genSourceName", JSON.stringify(genSourceName));
		formData.set("prompt", prompt ?? "");
		formData.set("typeOutput", typeOutput ?? TYPE_OUTPUT.OBJECT);

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
		formData.set(
			"input",
			JSON.stringify({
				assetId: assetDetail?.id,
				files,
			}),
		);
		formData.set(
			"workflowDetails",
			JSON.stringify(workflowDetail?.workflowDetails ?? []),
		);
		formData.set("actionType", ACTION_TYPES_OPERATOR.START_WORKFLOW);

		submit(formData, { method: "post", action: fullPath });

		setIsLoadingGenerate(true);
	};

	const handleSuggestion = () => {
		const formData = new FormData();
		formData.set("input", files ? files[0].url : "");
		formData.set("actionType", ACTION_TYPES_OPERATOR.SUGGESTION);

		submit(formData, { method: "post", action: fullPath });

		setIsLoadingSuggestion(true);
	};

	// Handle response data
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
				navigate(`${routes.operatorDataStructure}/${actionData?.data?.id}`);
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

		const handleSuggestionAction = () => {
			if (actionData?.status === false) {
				showNotification(false, "Suggestion", actionData.error);
			} else {
				showNotification(true, "Suggestion");
				const suggestionData = actionData?.data as unknown as OptionsSuggest;
				const newColumns = suggestionData.map((option) => ({
					id: String(Math.random()),
					name: option.value,
					type: option.type,
					additionalAttributes: {
						position: "",
						unit: "",
						keyword: "",
						description: option.description,
					},
				}));
				setColumns(newColumns);
				setIsFormDirty(true);
			}
			setIsLoadingSuggestion(false);
		};

		if (actionData && navigation.state === "idle") {
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
				case ACTION_TYPES_OPERATOR.SUGGESTION:
					handleSuggestionAction();
					break;
				default:
					break;
			}
		}
	}, [actionData, navigation.state]);

	return (
		<SettingOperatorS>
			<Tabs defaultActiveKey="1" type="card">
				<TabPane tab={jp.common.setting} key="1">
					<div className="tab-setting">
						<div className="step">
							<div className="button-suggest">
								<Button
									color="primary"
									variant="text"
									disabled={!files || files?.length === 0}
									loading={isLoadingSuggestion}
									onClick={handleSuggestion}
								>
									スキーマ提案の実行
								</Button>
							</div>
						</div>

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
									disabled={!columns.length || !genSourceName?.length}
									loading={isLoadingSave}
								>
									{jp.common.saveTemplate}
								</Button>
							</div>

							<div className="add-column">
								{columns.map((column, index) => (
									<DraggableColumn
										// biome-ignore lint/suspicious/noArrayIndexKey: FIXME
										key={`wrap-column-${index}`}
										index={index}
										column={column}
										moveColumn={handleMoveColumn}
										renderPanelHeader={renderPanelHeader}
										setIsFormDirty={setIsFormDirty}
										activeKeys={activeKeys}
										setActiveKeys={setActiveKeys}
									>
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
												onChange={(value) => {
													const updatedColumns = [...columns];
													updatedColumns[index].type = value;
													setColumns(updatedColumns);
													setIsFormDirty(true);
												}}
												disabled={isDisabledForWorkflow}
												options={optionsTypeCol}
											/>
										</div>
										<div className="column-setting">
											<label>ポジション</label>
											<Input
												disabled={isDisabledForWorkflow}
												placeholder={jp.common.placeholder}
												value={column.additionalAttributes.position}
												onChange={(e) => {
													const updatedColumns = [...columns];
													updatedColumns[index].additionalAttributes.position =
														e.target.value;
													setColumns(updatedColumns);
													setIsFormDirty(true);
												}}
											/>
										</div>
										<div className="column-setting">
											<label>単位</label>
											<Input
												disabled={isDisabledForWorkflow}
												placeholder={jp.common.placeholder}
												value={column.additionalAttributes.unit}
												onChange={(e) => {
													const updatedColumns = [...columns];
													updatedColumns[index].additionalAttributes.unit =
														e.target.value;
													setColumns(updatedColumns);
													setIsFormDirty(true);
												}}
											/>
										</div>
										<div className="column-setting">
											<label>キーワード</label>
											<TextArea
												disabled={isDisabledForWorkflow}
												size="small"
												placeholder={jp.common.placeholder}
												onChange={(e) => {
													const updatedColumns = [...columns];
													updatedColumns[index].additionalAttributes.keyword =
														e.target.value;
													setColumns(updatedColumns);
													setIsFormDirty(true);
												}}
												value={column.additionalAttributes.keyword}
											/>
										</div>
										<div className="column-setting">
											<label>自由文</label>
											<TextArea
												disabled={isDisabledForWorkflow}
												placeholder={jp.common.placeholder}
												size="middle"
												onChange={(e) => {
													const updatedColumns = [...columns];
													updatedColumns[
														index
													].additionalAttributes.description = e.target.value;
													setColumns(updatedColumns);
													setIsFormDirty(true);
												}}
												value={column.additionalAttributes.description}
											/>
										</div>
									</DraggableColumn>
								))}

								<Button
									type="dashed"
									className="text-[#8080809c] font-bold mt-2 border-0 w-full"
									icon={<Icon icon="plus" />}
									onClick={handleAddColumn}
									disabled={isDisabledForWorkflow}
								>
									{jp.common.addColumn}
								</Button>
							</div>
						</div>

						<div className="step">
							<p className="step-name">
								出典名作成 <span>*</span>
							</p>

							<div className="add-context">
								<div className="form">
									{fields.map((field, index) => (
										<DraggableField
											// biome-ignore lint/suspicious/noArrayIndexKey: FIXME
											key={`context-${index}`}
											index={index}
											field={field}
											moveField={handleMoveField}
											handleFieldChange={handleFieldChange}
											handleRemoveContext={handleRemoveContext}
											isDisabledForWorkflow={isDisabledForWorkflow}
										/>
									))}

									<Button
										type="dashed"
										onClick={handleAddContext}
										block
										className="text-[#8080809c] font-bold border-0"
										icon={<Icon icon="plus" />}
										disabled={isDisabledForWorkflow}
									>
										{jp.common.addContext}
									</Button>
								</div>
							</div>
						</div>

						<div className="step">
							<p className="step-name">{jp.common.freePrompt}</p>
							<div className="add-context">
								<Input.TextArea
									placeholder={jp.common.typeSomething}
									value={prompt}
									disabled={isDisabledForWorkflow}
									onChange={(e) => {
										setIsFormDirty(true);
										setPrompt(e.target.value);
									}}
								/>
							</div>
						</div>
					</div>
				</TabPane>
				<TabPane tab={jp.common.history} key="2">
					{data && columnConfident ? (
						<History
							data={data as ContentConfig}
							columnConfident={columnConfident}
						/>
					) : null}
				</TabPane>
			</Tabs>

			<div className="button-bottom">
				<div className="button-bottom-in">
					<Checkbox
						checked={typeOutput === TYPE_OUTPUT.ARRAY}
						onChange={(e) => {
							setIsFormDirty(true);
							setTypeOutput(
								e.target.checked ? TYPE_OUTPUT.ARRAY : TYPE_OUTPUT.OBJECT,
							);
						}}
						disabled={isDisabledForWorkflow}
					>
						1ファイル複数行に構造化する
					</Checkbox>

					<Button
						type="primary"
						disabled={
							startedGenerate ||
							!files?.length ||
							!columns.length ||
							!genSourceName?.length
						}
						icon={<Icon icon="settings" size={16} />}
						loading={isLoadingGenerate}
						onClick={handleStartGenerate}
					>
						{jp.common.startGenerate}
					</Button>
				</div>
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
				operatorType={OPERATOR_TYPE.DATA_STRUCTURE}
			/>

			<ModalSelectTemplate
				isModalSelectOpen={isModalSelectOpen}
				setIsModalSelectOpen={setIsModalSelectOpen}
				tempTemplate={tempTemplate}
				setTempTemplate={setTempTemplate}
				operatorType={
					workflowDetail
						? OPERATOR_TYPE.WORK_FLOW
						: OPERATOR_TYPE.DATA_STRUCTURE
				}
				handleAcceptedTemplate={handleAcceptedTemplate}
			/>
		</SettingOperatorS>
	);
};

export default SettingOperator;
