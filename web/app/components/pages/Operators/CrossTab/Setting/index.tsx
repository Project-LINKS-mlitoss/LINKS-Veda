import {
	useActionData,
	useFetcher,
	useLocation,
	useNavigate,
	useSearchParams,
	useSubmit,
} from "@remix-run/react";
import type { CheckboxChangeEvent } from "antd/es/checkbox";
import type * as React from "react";
import { useEffect, useState } from "react";
import jp from "~/commons/locales/jp";
import Button from "~/components/atoms/Button";
import Checkbox from "~/components/atoms/Checkbox";
import Collapse from "~/components/atoms/Collapse";
import Icon from "~/components/atoms/Icon";
import Input from "~/components/atoms/Input";
import Modal from "~/components/atoms/Modal";
import Select from "~/components/atoms/Select";
import Tabs from "~/components/atoms/Tabs";
import { showNotification } from "~/components/molecules/Common/utils";
import ModalSaveTemplate from "~/components/pages/Operators/Modal/ModalSaveTemplate";
import {
	ColumnItem,
	ModalGenerate,
	SettingOperatorS,
} from "~/components/pages/Operators/styles";
import {
	type OptionColumnsT,
	SETTING_TYPE_CROSS_TAB,
	type SettingCrossTab,
	type TotalAverage,
} from "~/components/pages/Operators/types";
import { parseConfigJson } from "~/components/pages/Operators/utils";
import ModalSelectTemplate from "~/components/pages/Templates/Modal/ModalSelectTemplate";
import {
	ACTION_TYPES_OPERATOR,
	type ContentConfig,
	type CrossTabContentConfigs,
	type FieldsCrossTabToMB,
	type SettingCrossTabRequest,
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
const { Option } = Select;

interface Props {
	contentId: string;
	data?: CrossTabContentConfigs | null;
	workflowDetail?: WorkflowT | undefined;
	optionColumns: OptionColumnsT[] | undefined;
}

const Setting: React.FC<Props> = (props) => {
	// Props
	const { contentId, data, workflowDetail, optionColumns } = props;

	// Remix
	const navigate = useNavigate();
	const submit = useSubmit();
	const actionData = useActionData<ApiResponse<ContentConfig>>();
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
	const [isLoadingGenerate, setIsLoadingGenerate] = useState(false);
	const [setting, setSetting] = useState<SettingCrossTab>({
		type: SETTING_TYPE_CROSS_TAB.TOTAL_AVERAGE,
		data: {
			columnUnit: [{ id: 1, value: "" }],
			columnTarget: [{ id: 1, name: "", sum: false, avg: false, cnt: false }],
		},
	});
	const [keyFields, setKeyFields] = useState<string[]>();
	const [fields, setFields] = useState<FieldsCrossTabToMB[]>();

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
			setSetting(configJson?.setting);
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
	const handleChange = (value: SETTING_TYPE_CROSS_TAB) => {
		if (value === SETTING_TYPE_CROSS_TAB.TOTAL_AVERAGE) {
			setSetting({
				type: SETTING_TYPE_CROSS_TAB.TOTAL_AVERAGE,
				data: {
					columnUnit: [{ id: 1, value: "" }],
					columnTarget: [
						{ id: 1, name: "", sum: false, avg: false, cnt: false },
					],
				},
			});
		} else if (value === SETTING_TYPE_CROSS_TAB.COUNT) {
			setSetting({
				type: SETTING_TYPE_CROSS_TAB.COUNT,
				data: {
					columnUnit: [{ id: 1, value: "" }],
					columnTarget: [
						{ id: 1, name: "", sum: false, avg: false, cnt: true },
					],
				},
			});
		}
	};

	const handleInputColChange = (
		value: string,
		index: number,
		type: "columnUnit" | "columnTarget",
		field?: "name" | "value",
	) => {
		const newSetting = { ...setting } as TotalAverage;

		if (type === "columnUnit" && field === "value") {
			newSetting.data.columnUnit[index][field] = value;
		} else if (type === "columnTarget" && field === "name") {
			newSetting.data.columnTarget[index][field] = value;
		}

		setSetting(newSetting);
	};

	const handleCheckboxChange = (
		event: CheckboxChangeEvent,
		index: number,
		type: "columnTarget",
		field: "sum" | "avg",
	) => {
		const isChecked = event.target.checked;
		const newSetting = { ...setting } as TotalAverage;

		if (type === "columnTarget") {
			newSetting.data.columnTarget[index][field] = isChecked;
		}

		setSetting(newSetting);
	};

	const handleAddUnit = () => {
		setSetting((prevSetting) => {
			return {
				...prevSetting,
				data: {
					...prevSetting.data,
					columnUnit: [
						...prevSetting.data.columnUnit,
						{
							id: Date.now(),
							value: "",
						},
					],
				},
			};
		});
	};

	const handleDeleteUnit = (index: number) => {
		setSetting((prevSetting) => {
			const updatedColumnUnit = [...prevSetting.data.columnUnit];
			updatedColumnUnit.splice(index, 1);

			return {
				...prevSetting,
				data: {
					...prevSetting.data,
					columnUnit: updatedColumnUnit,
				},
			};
		});
	};

	const handleAddTarget = () => {
		setSetting((prevSetting) => {
			return {
				...prevSetting,
				data: {
					...prevSetting.data,
					columnTarget: [
						...prevSetting.data.columnTarget,
						{ id: Date.now(), name: "", sum: false, avg: false, cnt: false },
					],
				},
			};
		});
	};

	const handleDeleteTarget = (index: number) => {
		setSetting((prevSetting) => {
			const updatedColumnTarget = [...prevSetting.data.columnTarget];
			updatedColumnTarget.splice(index, 1);

			return {
				...prevSetting,
				data: {
					...prevSetting.data,
					columnTarget: updatedColumnTarget,
				},
			};
		});
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
						operatorTypeToUrlMap[OPERATOR_TYPE.CROSS_TAB]
					}?templateId=${tempTemplate.id.toString()}`,
				);
			}
		}
		setIsModalSelectOpen(false);
	};

	// Handle generate
	useEffect(() => {
		const keyFields = setting?.data?.columnUnit?.map((col) => col?.value);
		setKeyFields(keyFields);

		const fields = setting?.data?.columnTarget?.map((col) => {
			if (setting?.type === SETTING_TYPE_CROSS_TAB.TOTAL_AVERAGE) {
				return {
					name: col?.name,
					sum: col?.sum,
					avg: col?.avg,
					cnt: false,
				};
			}
			return {
				name: col?.name,
				sum: false,
				avg: false,
				cnt: true,
			};
		});
		setFields(fields);
	}, [setting]);

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
		formData.set("inputId", contentId ?? "");
		formData.set("setting", JSON.stringify(setting ?? {}));
		const settingCrossTabRequest: SettingCrossTabRequest = {
			keyFields: keyFields ?? [],
			fields: fields ?? [],
		};
		formData.set(
			"settingCrossTabRequest",
			JSON.stringify(settingCrossTabRequest ?? {}),
		);

		formData.set("actionType", ACTION_TYPES_OPERATOR.GENERATE);

		submit(formData, { method: "post", action: fullPath });
		setIsLoadingGenerate(true);
	};

	const handleSave = () => {
		const formData = new FormData();
		formData.set("setting", JSON.stringify(setting ?? {}));
		const settingCrossTabRequest: SettingCrossTabRequest = {
			keyFields: keyFields ?? [],
			fields: fields ?? [],
		};
		formData.set(
			"settingCrossTabRequest",
			JSON.stringify(settingCrossTabRequest ?? {}),
		);

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
		formData.set("input", JSON.stringify(contentId));
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
				navigate(`${routes.operatorCrossTab}/${actionData?.data?.id}`);
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
									disabled={!setting}
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

													<span className="mr-2">クロス集計</span>
												</div>

												<div className="header-panel-cross-tab">
													<Select
														className="header-panel-cross-tab-select"
														onChange={handleChange}
														value={setting?.type}
														disabled={isDisabledForWorkflow}
													>
														<Option
															value={SETTING_TYPE_CROSS_TAB.TOTAL_AVERAGE}
														>
															合計／平均
														</Option>
														<Option value={SETTING_TYPE_CROSS_TAB.COUNT}>
															カウント
														</Option>
													</Select>
												</div>
											</>
										}
										key={1}
										showArrow={true}
										className="panel panel-cross-tab"
									>
										<div className="panel-content-cross-tab">
											<div className="column-unit">
												{setting?.data?.columnUnit?.map((col, index) => {
													return (
														<ColumnItem key={col?.id}>
															<div className="column-item-title">集計単位</div>

															<div className="column-item-content">
																{optionColumns ? (
																	<Select
																		onChange={(value) =>
																			handleInputColChange(
																				value,
																				index,
																				"columnUnit",
																				"value",
																			)
																		}
																		value={col?.value}
																		options={optionColumns}
																		disabled={isDisabledForWorkflow}
																	/>
																) : (
																	<Input
																		value={col?.value}
																		onChange={(e) =>
																			handleInputColChange(
																				e.target.value,
																				index,
																				"columnUnit",
																				"value",
																			)
																		}
																		disabled={isDisabledForWorkflow}
																	/>
																)}

																{index > 0 && (
																	<Button
																		disabled={isDisabledForWorkflow}
																		type="text"
																		icon={<Icon icon="close" />}
																		onClick={() => handleDeleteUnit(index)}
																	/>
																)}
															</div>
														</ColumnItem>
													);
												})}

												<Button
													type="dashed"
													className="button-add-col"
													icon={<Icon icon="plus" />}
													disabled={isDisabledForWorkflow}
													onClick={handleAddUnit}
												>
													{jp.common.addColumn}
												</Button>
											</div>

											<div className="column-target">
												{setting?.type === SETTING_TYPE_CROSS_TAB.TOTAL_AVERAGE
													? setting?.data?.columnTarget?.map((col, index) => {
															return (
																<ColumnItem key={col?.id}>
																	<div className="column-item-title">
																		集計対象
																	</div>

																	<div className="column-item-content">
																		<div className="column-item-target-content">
																			{optionColumns ? (
																				<Select
																					onChange={(value) =>
																						handleInputColChange(
																							value,
																							index,
																							"columnTarget",
																							"name",
																						)
																					}
																					value={col?.name}
																					options={optionColumns}
																					disabled={isDisabledForWorkflow}
																				/>
																			) : (
																				<Input
																					value={col?.name}
																					onChange={(e) =>
																						handleInputColChange(
																							e.target.value,
																							index,
																							"columnTarget",
																							"name",
																						)
																					}
																					disabled={isDisabledForWorkflow}
																				/>
																			)}

																			<Checkbox
																				checked={col?.sum}
																				onChange={(e) =>
																					handleCheckboxChange(
																						e,
																						index,
																						"columnTarget",
																						"sum",
																					)
																				}
																				disabled={isDisabledForWorkflow}
																			>
																				合計
																			</Checkbox>

																			<Checkbox
																				checked={col?.avg}
																				onChange={(e) =>
																					handleCheckboxChange(
																						e,
																						index,
																						"columnTarget",
																						"avg",
																					)
																				}
																				disabled={isDisabledForWorkflow}
																			>
																				平均
																			</Checkbox>
																		</div>

																		{index > 0 && (
																			<Button
																				disabled={isDisabledForWorkflow}
																				type="text"
																				icon={<Icon icon="close" />}
																				onClick={() =>
																					handleDeleteTarget(index)
																				}
																			/>
																		)}
																	</div>
																</ColumnItem>
															);
														})
													: setting?.data?.columnTarget?.map((col, index) => {
															return (
																<ColumnItem key={col?.id}>
																	<div className="column-item-title">
																		集計対象
																	</div>

																	<div className="column-item-content">
																		{optionColumns ? (
																			<Select
																				onChange={(value) =>
																					handleInputColChange(
																						value,
																						index,
																						"columnTarget",
																						"name",
																					)
																				}
																				value={col?.name}
																				options={optionColumns}
																				disabled={isDisabledForWorkflow}
																			/>
																		) : (
																			<Input
																				value={col?.name}
																				onChange={(e) =>
																					handleInputColChange(
																						e.target.value,
																						index,
																						"columnTarget",
																						"name",
																					)
																				}
																				disabled={isDisabledForWorkflow}
																			/>
																		)}

																		{index > 0 && (
																			<Button
																				disabled={isDisabledForWorkflow}
																				type="text"
																				icon={<Icon icon="close" />}
																				onClick={() =>
																					handleDeleteTarget(index)
																				}
																			/>
																		)}
																	</div>
																</ColumnItem>
															);
														})}
												<Button
													type="dashed"
													className="button-add-col"
													icon={<Icon icon="plus" />}
													disabled={isDisabledForWorkflow}
													onClick={handleAddTarget}
												>
													{jp.common.addColumn}
												</Button>
											</div>
										</div>
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
					disabled={startedGenerate || !setting || !contentId}
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
				operatorType={OPERATOR_TYPE.CROSS_TAB}
			/>

			<ModalSelectTemplate
				isModalSelectOpen={isModalSelectOpen}
				setIsModalSelectOpen={setIsModalSelectOpen}
				tempTemplate={tempTemplate}
				setTempTemplate={setTempTemplate}
				operatorType={
					workflowDetail ? OPERATOR_TYPE.WORK_FLOW : OPERATOR_TYPE.CROSS_TAB
				}
				handleAcceptedTemplate={handleAcceptedTemplate}
			/>
		</SettingOperatorS>
	);
};

export default Setting;
