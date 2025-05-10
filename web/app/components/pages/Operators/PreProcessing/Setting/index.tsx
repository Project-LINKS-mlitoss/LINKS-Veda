import {
	useActionData,
	useFetcher,
	useLocation,
	useNavigate,
	useSearchParams,
	useSubmit,
} from "@remix-run/react";
import type { CheckboxChangeEvent } from "antd/es/checkbox";
import _ from "lodash";
import type * as React from "react";
import { Fragment, useEffect, useState } from "react";
import jp from "~/commons/locales/jp";
import Button from "~/components/atoms/Button";
import Checkbox from "~/components/atoms/Checkbox";
import Collapse from "~/components/atoms/Collapse";
import Dropdown, { type MenuProps } from "~/components/atoms/Dropdown";
import Icon from "~/components/atoms/Icon";
import Input from "~/components/atoms/Input";
import Modal from "~/components/atoms/Modal";
import Select from "~/components/atoms/Select";
import Tabs from "~/components/atoms/Tabs";
import { showNotification } from "~/components/molecules/Common/utils";
import ModalSaveTemplate from "~/components/pages/Operators/Modal/ModalSaveTemplate";
import {
	ModalContent,
	ModalGenerate,
	OptionsPreProcessingS,
	SettingOperatorS,
} from "~/components/pages/Operators/styles";
import {
	type DeleteOption,
	type DocumentNameOption,
	type GeocodingOption,
	type MaskingAddressOption,
	type MaskingIdOption,
	MaskingTypes,
	type MissingOption,
	type NormalizationOption,
	type OptionColumnsT,
	type OptionsPreProcessing,
	PREPROCESS_TYPE,
	PreprocessOptions,
	type RankingOption,
	type ReplaceOption,
	optionNormalize,
	rankingRangeOptions,
	rankingTypeOptions,
} from "~/components/pages/Operators/types";
import { parseConfigJson } from "~/components/pages/Operators/utils";
import ModalSelectTemplate from "~/components/pages/Templates/Modal/ModalSelectTemplate";
import {
	ACTION_TYPES_OPERATOR,
	type CleansingOp,
	type ContentConfig,
	type Geocoding,
	type InputType,
	type MaskingOp,
	type PreprocessContentConfigs,
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
const { Option } = Select;
const { TabPane } = Tabs;

interface Props {
	assetId: string;
	contentId: string;
	input: string;
	inputType: InputType | undefined;
	data?: PreprocessContentConfigs | null;
	workflowDetail?: WorkflowT | undefined;
	optionColumns: OptionColumnsT[] | undefined;
}

const Setting: React.FC<Props> = (props) => {
	// Props
	const {
		assetId,
		contentId,
		input,
		inputType,
		data,
		workflowDetail,
		optionColumns,
	} = props;

	// Remix
	const [searchParams] = useSearchParams();
	const geoCoding = searchParams.get("geoCoding") === "true";
	const navigate = useNavigate();
	const submit = useSubmit();
	const actionData = useActionData<ApiResponse<ContentConfig>>();
	const location = useLocation();
	const fullPath = `${location.pathname}${location.search}`;
	const templateIdURL = searchParams.get("templateId");
	const fetchTemplateDetail = useFetcher<ApiResponse<TemplatesT>>();

	// State
	const [isUnloadModalOpen, setIsUnloadModalOpen] = useState(false);
	const [isDiscardModalOpen, setIsDiscardModalOpen] = useState(false);
	const [modalText, setModalText] = useState("");
	const [isFormDirty, setIsFormDirty] = useState(false);
	const [startedGenerate, setStartedGenerate] = useState(false);
	const defaultOp: OptionsPreProcessing[] = [
		{
			id: Date.now(),
			type: PreprocessOptions.DOCUMENT_NAME,
			text: "資料名作成",
			input1: "",
		} as DocumentNameOption,
		...(geoCoding
			? [
					{
						id: Date.now(),
						type: PreprocessOptions.GEOCODING,
						text: "ジオコーディング",
						input1: "",
					} as GeocodingOption,
				]
			: []),
	];
	const [options, setOptions] = useState<OptionsPreProcessing[]>(defaultOp);
	const [activeKeys, setActiveKeys] = useState<(string | number)[]>([]);
	const [isLoadingGenerate, setIsLoadingGenerate] = useState(false);
	const [isModalOptionOpen, setIsModalOptionOpen] = useState(false);
	const [isModalCleansingOpen, setIsModalCleansingOpen] = useState(false);
	const [isOpenModalSaveTemplate, setIsOpenModalSaveTemplate] = useState(false);
	const [cleansing, setCleansing] = useState<CleansingOp[]>();
	const [masking, setMasking] = useState<MaskingOp[]>();
	const [documentName, setDocumentName] = useState<string>();
	const [geocoding, setGeocoding] = useState<Geocoding>();
	const [preProcessType, setPreProcessType] = useState<PREPROCESS_TYPE>(
		PREPROCESS_TYPE.CLEANING,
	);

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

	// Handle detail UI
	// biome-ignore lint/correctness/useExhaustiveDependencies: FIXME
	useEffect(() => {
		if ((data || templateDetail || dataFirstTemplateWorkflow) && configJson) {
			setOptions(configJson?.options);
			setPreProcessType(
				configJson?.preProcessType
					? configJson?.preProcessType
					: PREPROCESS_TYPE.CLEANING,
			);
		}
	}, [data, templateDetail, dataFirstTemplateWorkflow]);

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

	// step 2
	const handleAddOption = (type: string) => {
		let newOption: OptionsPreProcessing;

		switch (type) {
			case PreprocessOptions.DELETE:
				newOption = {
					id: Date.now(),
					type: PreprocessOptions.DELETE,
					text: "削除",
					checked: false,
					isFirstOption: true,
					input1: "",
					input2: "",
					select: "",
				} as DeleteOption;
				break;

			case PreprocessOptions.REPLACE:
				newOption = {
					id: Date.now(),
					type: PreprocessOptions.REPLACE,
					text: "置換",
					checked: false,
					input1: "",
					input2: "",
					input3: "",
				} as ReplaceOption;
				break;

			case PreprocessOptions.NORMALIZE:
				newOption = {
					id: Date.now(),
					type: PreprocessOptions.NORMALIZE,
					text: "表記ゆれの正規化",
					checked: false,
					input1: "",
					select: optionNormalize[0].value,
				} as NormalizationOption;
				break;

			case PreprocessOptions.MISSING:
				newOption = {
					id: Date.now(),
					type: PreprocessOptions.MISSING,
					text: "欠損値の処理",
					checked: false,
					input1: "",
					select: "",
					input2: "",
				} as MissingOption;
				break;

			case PreprocessOptions.GEOCODING:
				newOption = {
					id: Date.now(),
					type: PreprocessOptions.GEOCODING,
					text: "ジオコーディング",
					input1: "",
				} as GeocodingOption;
				break;

			case PreprocessOptions.RANKING:
				newOption = {
					id: Date.now(),
					type: PreprocessOptions.RANKING,
					text: "階層化・偏差値化",
					input1: "",
					select1: rankingTypeOptions[0].value,
					select2: rankingRangeOptions[0].value,
				} as RankingOption;
				break;

			case PreprocessOptions.MASKING_ID:
				newOption = {
					id: Date.now(),
					type: PreprocessOptions.MASKING_ID,
					text: "新規ID付与",
					input1: "",
					input2: "",
				} as MaskingIdOption;
				break;

			case PreprocessOptions.MASKING_ADDRESS:
				newOption = {
					id: Date.now(),
					type: PreprocessOptions.MASKING_ADDRESS,
					text: "住所秘匿",
					input1: "",
				} as MaskingAddressOption;
				break;

			default:
				throw new Error("Unknown option type");
		}

		const isMaskingType = MaskingTypes.includes(type);
		const isMakingProcess = preProcessType === PREPROCESS_TYPE.MAKING;
		setPreProcessType(
			isMaskingType ? PREPROCESS_TYPE.MAKING : PREPROCESS_TYPE.CLEANING,
		);

		setOptions((prevOptions) =>
			isMaskingType
				? isMakingProcess
					? [...prevOptions, newOption]
					: [newOption]
				: isMakingProcess
					? [...defaultOp, newOption]
					: [...prevOptions, newOption],
		);

		setIsModalOptionOpen(false);
		setIsModalCleansingOpen(false);
	};

	const handleDeleteOption = (index: number) => {
		setOptions((prevOptions) => prevOptions.filter((_, i) => i !== index));
	};

	const handleCloneOption = (index: number) => {
		setOptions((prevOptions) => [
			...prevOptions.slice(0, index + 1),
			_.cloneDeep(prevOptions[index]),
			...prevOptions.slice(index + 1),
		]);
	};

	const handleCheckboxChange = (index: number, e: CheckboxChangeEvent) => {
		setOptions((prevOptions) => {
			const newOptions = [...prevOptions];
			const option = newOptions[index];

			if (!e.target.checked && option.input1) {
				newOptions[index] = {
					...option,
					checked: e.target.checked,
					input1: "",
				};
			} else {
				newOptions[index] = {
					...option,
					checked: e.target.checked,
				};
			}

			return newOptions;
		});
	};

	const updateOption = (
		index: number,
		field: string,
		value: string | boolean | number,
	) => {
		setOptions((prevOptions) => {
			const newOptions = [...prevOptions];
			if (newOptions[index]) {
				newOptions[index] = {
					...newOptions[index],
					[field]: value,
				};
			}
			return newOptions;
		});
	};

	const handleInputChange = (
		value: string | number,
		field: string,
		index: number,
	) => {
		updateOption(index, field, value);
	};

	const handleSelectChange = (value: string, field: string, index: number) => {
		const finalValue = value === "tab" ? "\t" : value;
		const isUserInput = finalValue === "userInputText";
		updateOption(index, "isFirstOption", !isUserInput);
		updateOption(index, field, finalValue);
	};

	// Function for ranking option
	const handleAddRankingRange = (index: number) => {
		setOptions((prevOptions) => {
			const newOptions = [...prevOptions];
			const option = newOptions[index] as RankingOption;
			const newRankRange = { id: Date.now(), min: null, max: null };
			option.rankRanges = [...(option.rankRanges || []), newRankRange];
			newOptions[index] = option;
			return newOptions;
		});
	};

	const handleDeleteRankingRange = (
		optionIndex: number,
		rangeIndex: number,
	) => {
		setOptions((prevOptions) => {
			const newOptions = [...prevOptions];
			const option = newOptions[optionIndex] as RankingOption;
			const newRankRanges = [...(option.rankRanges || [])];
			newRankRanges.splice(rangeIndex, 1);
			option.rankRanges = newRankRanges;
			newOptions[optionIndex] = option;
			return newOptions;
		});
	};

	const handleInputRankingRangeChange = (
		value: string | number,
		field: "min" | "max",
		optionIndex: number,
		rangeIndex: number,
	) => {
		setOptions((prevOptions) => {
			const newOptions = [...prevOptions];
			const option = newOptions[optionIndex] as RankingOption;
			const newRankRanges = [...(option.rankRanges || [])];
			newRankRanges[rangeIndex] = {
				...newRankRanges[rangeIndex],
				[field]: value,
			};
			option.rankRanges = newRankRanges;
			newOptions[optionIndex] = option;
			return newOptions;
		});
	};

	const renderPanelHeader = (option: OptionsPreProcessing, index: number) => {
		const items: MenuProps["items"] = [
			{
				key: `clone-${index}`,
				label: (
					<button type="button" onClick={() => handleCloneOption(index)}>
						複製
					</button>
				),
			},
			{
				key: `delete-${index}`,
				label: (
					<button type="button" onClick={() => handleDeleteOption(index)}>
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
					<span className="mr-2">
						処理{" "}
						{option?.type === PreprocessOptions.DOCUMENT_NAME ? (
							<span className="required">*</span>
						) : null}
					</span>
				</div>
				<div className="panel-header-side">
					<Select value={option.text} disabled />
					{option?.type !== PreprocessOptions.DOCUMENT_NAME && (
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
					)}
				</div>
			</div>
		);
	};

	const renderOptionContent = (option: OptionsPreProcessing, index: number) => {
		const isChecked = option.checked || false;

		switch (option.type) {
			case PreprocessOptions.DELETE: {
				const deleteOption = option as DeleteOption;
				return (
					<div className="option-type delete">
						<div className="line">
							<Checkbox
								checked={isChecked}
								onChange={(e) => handleCheckboxChange(index, e)}
								disabled={isDisabledForWorkflow}
							>
								カラム指定
							</Checkbox>
							{optionColumns ? (
								<Select
									onChange={(value) =>
										handleInputChange(value, "input1", index)
									}
									value={deleteOption?.input1}
									options={optionColumns}
									disabled={!isChecked || isDisabledForWorkflow}
								/>
							) : (
								<Input
									value={deleteOption?.input1}
									placeholder={jp.common.placeholder}
									onChange={(e) =>
										handleInputChange(e.target.value, "input1", index)
									}
									disabled={!isChecked || isDisabledForWorkflow}
								/>
							)}
						</div>

						<div className="line">
							<Select
								onChange={(value) => handleSelectChange(value, "select", index)}
								defaultValue="一致する文字列"
								value={
									deleteOption?.select === "\t" ? "tab" : deleteOption?.select
								}
								disabled={isDisabledForWorkflow}
							>
								<Option value="userInputText">一致する文字列</Option>
								<Option value=",">カンマ</Option>
								<Option value="  ">全角スペース</Option>
								<Option value=" ">半角スペース</Option>
								<Option value="tab">タブ</Option>
							</Select>
							<Input
								value={deleteOption?.input2}
								placeholder={jp.common.placeholder}
								disabled={deleteOption?.isFirstOption || isDisabledForWorkflow}
								onChange={(e) =>
									handleInputChange(e.target.value, "input2", index)
								}
							/>
							<p>を削除</p>
						</div>
					</div>
				);
			}
			case PreprocessOptions.REPLACE: {
				const replaceOption = option as ReplaceOption;
				return (
					<div className="option-type replace">
						<div className="line">
							<Checkbox
								checked={isChecked}
								disabled={isDisabledForWorkflow}
								onChange={(e) => handleCheckboxChange(index, e)}
							>
								カラム指定
							</Checkbox>
							{optionColumns ? (
								<Select
									onChange={(value) =>
										handleInputChange(value, "input1", index)
									}
									value={replaceOption?.input1}
									options={optionColumns}
									disabled={!isChecked || isDisabledForWorkflow}
								/>
							) : (
								<Input
									value={replaceOption?.input1}
									placeholder={jp.common.placeholder}
									onChange={(e) =>
										handleInputChange(e.target.value, "input1", index)
									}
									disabled={!isChecked || isDisabledForWorkflow}
								/>
							)}
						</div>

						<div className="line">
							<Input
								value={replaceOption?.input2}
								placeholder={jp.common.placeholder}
								disabled={isDisabledForWorkflow}
								onChange={(e) =>
									handleInputChange(e.target.value, "input2", index)
								}
							/>
							<p>と一致する文字列を</p>
						</div>

						<div className="line">
							<Input
								value={replaceOption?.input3}
								placeholder={jp.common.placeholder}
								disabled={isDisabledForWorkflow}
								onChange={(e) =>
									handleInputChange(e.target.value, "input3", index)
								}
							/>
							<p>に置換</p>
						</div>
					</div>
				);
			}
			case PreprocessOptions.NORMALIZE: {
				const normalizeOption = option as NormalizationOption;
				return (
					<div className="option-type normalize">
						<div className="line">
							<Checkbox
								checked={isChecked}
								onChange={(e) => handleCheckboxChange(index, e)}
								disabled={isDisabledForWorkflow}
							>
								カラム指定
							</Checkbox>
							{optionColumns ? (
								<Select
									onChange={(value) =>
										handleInputChange(value, "input1", index)
									}
									value={normalizeOption?.input1}
									options={optionColumns}
									disabled={!isChecked || isDisabledForWorkflow}
								/>
							) : (
								<Input
									value={normalizeOption?.input1}
									placeholder={jp.common.placeholder}
									onChange={(e) =>
										handleInputChange(e.target.value, "input1", index)
									}
									disabled={!isChecked || isDisabledForWorkflow}
								/>
							)}
						</div>
						<div className="line">
							<p>対象</p>
							<Select
								onChange={(value) => handleInputChange(value, "select", index)}
								value={normalizeOption.select}
								options={optionNormalize}
								disabled={isDisabledForWorkflow}
							/>
						</div>
					</div>
				);
			}
			case PreprocessOptions.MISSING: {
				const missingOption = option as MissingOption;
				return (
					<div className="option-type missing">
						<div className="line">
							<Checkbox
								checked={isChecked}
								disabled={isDisabledForWorkflow}
								onChange={(e) => handleCheckboxChange(index, e)}
							>
								カラム指定
							</Checkbox>
							{optionColumns ? (
								<Select
									onChange={(value) =>
										handleInputChange(value, "input1", index)
									}
									value={missingOption?.input1}
									options={optionColumns}
									disabled={!isChecked || isDisabledForWorkflow}
								/>
							) : (
								<Input
									value={missingOption?.input1}
									placeholder={jp.common.placeholder}
									onChange={(e) =>
										handleInputChange(e.target.value, "input1", index)
									}
									disabled={!isChecked || isDisabledForWorkflow}
								/>
							)}
						</div>

						<div className="line">
							<Select
								onChange={(value) => handleSelectChange(value, "select", index)}
								value={missingOption?.select}
								defaultValue={"文字列"}
								disabled={isDisabledForWorkflow}
							>
								<Option value="文字列">文字列</Option>
								<Option value="0を代入">0を代入</Option>
								<Option value="行ごと削除">行ごと削除</Option>
							</Select>
							<Input
								value={missingOption?.input2}
								placeholder={jp.common.placeholder}
								disabled={isDisabledForWorkflow}
								onChange={(e) =>
									handleInputChange(e.target.value, "input2", index)
								}
							/>
							<p>を入力</p>
						</div>
					</div>
				);
			}
			case PreprocessOptions.DOCUMENT_NAME: {
				const documentNameOption = option as DocumentNameOption;
				return (
					<div className="option-type documentName">
						<div className="line">
							<p>資料名</p>
							<Input
								disabled={isDisabledForWorkflow}
								value={documentNameOption?.input1}
								placeholder={jp.common.placeholder}
								onChange={(e) =>
									handleInputChange(e.target.value, "input1", index)
								}
							/>
						</div>
					</div>
				);
			}
			case PreprocessOptions.GEOCODING: {
				const geocodingOption = option as GeocodingOption;
				return (
					<div className="option-type geocoding">
						<div className="line">
							<p>カラム指定</p>
							{optionColumns ? (
								<Select
									onChange={(value) =>
										handleInputChange(value, "input1", index)
									}
									value={geocodingOption?.input1}
									options={optionColumns}
									disabled={isDisabledForWorkflow}
								/>
							) : (
								<Input
									disabled={isDisabledForWorkflow}
									value={geocodingOption?.input1}
									placeholder={jp.common.placeholder}
									onChange={(e) =>
										handleInputChange(e.target.value, "input1", index)
									}
								/>
							)}
						</div>
					</div>
				);
			}
			case PreprocessOptions.RANKING: {
				const rankingOption = option as RankingOption;
				return (
					<div className="option-type geocoding">
						<div className="line line-grid">
							<p>カラム指定</p>
							{optionColumns ? (
								<Select
									onChange={(value) =>
										handleInputChange(value, "input1", index)
									}
									value={rankingOption?.input1}
									options={optionColumns}
									disabled={isDisabledForWorkflow}
								/>
							) : (
								<Input
									disabled={isDisabledForWorkflow}
									value={rankingOption?.input1}
									placeholder={jp.common.placeholder}
									onChange={(e) =>
										handleInputChange(e.target.value, "input1", index)
									}
								/>
							)}
						</div>
						<div className="line line-grid">
							<p>採番方法</p>
							<Select
								onChange={(value) => handleInputChange(value, "select1", index)}
								value={rankingOption?.select1}
								options={rankingTypeOptions}
								disabled={isDisabledForWorkflow}
							/>
						</div>
						<div className="line line-grid">
							<p>階層</p>
							<Select
								onChange={(value) => handleInputChange(value, "select2", index)}
								value={rankingOption?.select2}
								options={rankingRangeOptions}
								disabled={isDisabledForWorkflow}
							/>
						</div>
						{rankingOption?.select1 === rankingTypeOptions[1].value ? (
							<>
								{rankingOption?.rankRanges?.map((r, rangeIndex) => {
									return (
										<Fragment key={("id" in r && r.id) as React.Key}>
											<div className="line line-grid">
												<p>最小値</p>
												<div className="line-right">
													<Input
														onChange={(e) =>
															handleInputRankingRangeChange(
																e.target.value,
																"min",
																index,
																rangeIndex,
															)
														}
														value={r?.min ?? undefined}
														type="number"
														disabled={isDisabledForWorkflow}
													/>
													<Button
														disabled={isDisabledForWorkflow}
														type="text"
														icon={<Icon icon="close" />}
														onClick={() =>
															handleDeleteRankingRange(index, rangeIndex)
														}
													/>
												</div>
											</div>
											<div className="line line-grid">
												<p>最大値</p>
												<Input
													onChange={(e) =>
														handleInputRankingRangeChange(
															e.target.value,
															"max",
															index,
															rangeIndex,
														)
													}
													value={r?.max ?? undefined}
													type="number"
													disabled={isDisabledForWorkflow}
												/>
											</div>
										</Fragment>
									);
								})}
								<Button
									type="dashed"
									className="text-[#8080809c] font-bold mt-2 border-0 w-full"
									icon={<Icon icon="plus" />}
									onClick={() => handleAddRankingRange(index)}
									disabled={isDisabledForWorkflow}
								>
									ランク範囲を追加
								</Button>
							</>
						) : null}
					</div>
				);
			}
			case PreprocessOptions.MASKING_ID: {
				const maskingIdOption = option as MaskingIdOption;
				return (
					<div className="option-type geocoding">
						<div className="line">
							<p>カラム指定</p>
							{optionColumns ? (
								<Select
									onChange={(value) =>
										handleInputChange(value, "input1", index)
									}
									value={maskingIdOption?.input1}
									options={optionColumns}
									disabled={isDisabledForWorkflow}
								/>
							) : (
								<Input
									disabled={isDisabledForWorkflow}
									value={maskingIdOption?.input1}
									placeholder={jp.common.placeholder}
									onChange={(e) =>
										handleInputChange(e.target.value, "input1", index)
									}
								/>
							)}
						</div>
						<div className="line">
							<p>接頭辞</p>
							<Input
								disabled={isDisabledForWorkflow}
								value={maskingIdOption?.input2}
								placeholder={jp.common.placeholder}
								onChange={(e) =>
									handleInputChange(e.target.value, "input2", index)
								}
							/>
						</div>
					</div>
				);
			}
			case PreprocessOptions.MASKING_ADDRESS: {
				const maskingAddressOption = option as MaskingAddressOption;
				return (
					<div className="option-type geocoding">
						<div className="line">
							<p>カラム指定</p>
							{optionColumns ? (
								<Select
									onChange={(value) =>
										handleInputChange(value, "input1", index)
									}
									value={maskingAddressOption?.input1}
									options={optionColumns}
									disabled={isDisabledForWorkflow}
								/>
							) : (
								<Input
									disabled={isDisabledForWorkflow}
									value={maskingAddressOption?.input1}
									placeholder={jp.common.placeholder}
									onChange={(e) =>
										handleInputChange(e.target.value, "input1", index)
									}
								/>
							)}
						</div>
					</div>
				);
			}
			default:
				return null;
		}
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
						operatorTypeToUrlMap[OPERATOR_TYPE.PRE_PROCESSING]
					}?templateId=${tempTemplate.id.toString()}`,
				);
			}
		}
		setIsModalSelectOpen(false);
	};

	// Handle generate
	useEffect(() => {
		const cleansing: CleansingOp[] = [];
		const masking: MaskingOp[] = [];
		let documentName = "";
		const geocoding: string[] = [];

		for (const option of options) {
			switch (option?.type) {
				case PreprocessOptions.DELETE:
					cleansing.push({
						type: PreprocessOptions.REPLACE,
						field: option?.input1,
						target: option?.isFirstOption ? option?.select : option?.input2,
						replace: "",
					});
					break;

				case PreprocessOptions.REPLACE:
					cleansing.push({
						type: PreprocessOptions.REPLACE,
						field: option?.input1,
						target: option?.input2,
						replace: option?.input3,
					});
					break;

				case PreprocessOptions.NORMALIZE:
					cleansing.push({
						type: PreprocessOptions.NORMALIZE,
						field: option?.input1,
						dataType: option?.select,
					});
					break;

				// case PreprocessOptions.MISSING:
				// 	cleansing.push({
				// 		type: PreprocessOptions.MISSING,
				// 		target: option?.input2,
				// 	});
				// 	break;

				case PreprocessOptions.DOCUMENT_NAME:
					if (option?.input1) documentName = option.input1;
					break;

				case PreprocessOptions.GEOCODING:
					if (option?.input1) geocoding.push(option.input1);
					break;

				case PreprocessOptions.RANKING:
					{
						const maskingItem: MaskingOp = {
							type: "ranking",
							field: option?.input1,
							max_rank: option?.select2,
						};

						if (option?.select1 === rankingTypeOptions[1].value) {
							maskingItem.rankRanges = option?.rankRanges?.map((r) => ({
								min: r?.min,
								max: r?.max,
							}));
						}

						masking.push(maskingItem);
					}
					break;

				case PreprocessOptions.MASKING_ID:
					{
						const maskingItem: MaskingOp = {
							type: "masking_id",
							field: option?.input1,
						};
						if (option?.input2) {
							maskingItem.prefix = option?.input2;
						}
						masking.push(maskingItem);
					}
					break;

				case PreprocessOptions.MASKING_ADDRESS:
					masking.push({
						type: "masking_address",
						field: option?.input1,
					});
					break;

				default:
					break;
			}
		}

		setCleansing(cleansing);
		setDocumentName(documentName);
		setGeocoding({
			fields: geocoding,
		});
		setMasking(masking);
	}, [options]);

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
		if (assetId) {
			formData.set("assetId", assetId ?? "");
		} else if (contentId) {
			formData.set("contentId", contentId ?? "");
		}
		formData.set("input", input ?? "");
		formData.set("inputType", inputType ?? "");
		formData.set("preProcessType", preProcessType ?? PREPROCESS_TYPE.CLEANING);
		formData.set("masking", JSON.stringify(masking ?? { op: [] }));
		formData.set("cleansing", JSON.stringify(cleansing ?? { op: [] }));
		formData.set("documentName", documentName ?? "");
		formData.set("geocoding", JSON.stringify(geocoding ?? { fields: [] }));
		formData.set("options", JSON.stringify(options ?? { fields: [] }));

		formData.set("actionType", ACTION_TYPES_OPERATOR.GENERATE);

		submit(formData, { method: "post", action: fullPath });
		setIsLoadingGenerate(true);
	};

	const handleSave = () => {
		const formData = new FormData();
		formData.set("preProcessType", preProcessType ?? PREPROCESS_TYPE.CLEANING);
		formData.set("masking", JSON.stringify(masking ?? { op: [] }));
		formData.set("cleansing", JSON.stringify(cleansing ?? { op: [] }));
		formData.set("documentName", documentName ?? "");
		formData.set("geocoding", JSON.stringify(geocoding ?? { fields: [] }));
		formData.set("options", JSON.stringify(options ?? { fields: [] }));

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
				assetId,
				contentId,
				input,
				inputType,
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
				navigate(`${routes.operatorPreProcessing}/${actionData?.data?.id}`);
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

	// Buttons
	const optionButtons = [
		{
			title: "結合前処理",
			buttons: [
				{ label: "クレンジング", onClick: () => setIsModalCleansingOpen(true) },
				{
					label: "ジオコーディング",
					onClick: () => handleAddOption(PreprocessOptions.GEOCODING),
				},
			],
		},
		{
			title: "秘匿化処理",
			buttons: [
				{
					label: "階層化・偏差値化",
					onClick: () => handleAddOption(PreprocessOptions.RANKING),
				},
				{
					label: "新規ID付与",
					onClick: () => handleAddOption(PreprocessOptions.MASKING_ID),
				},
				{
					label: "住所秘匿",
					onClick: () => handleAddOption(PreprocessOptions.MASKING_ADDRESS),
				},
			],
		},
	];

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
									disabled={!options.length}
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
											<div className="header-panel">
												<Icon icon="dotsSixVertical" />

												<span className="mr-2">結合前処理</span>
											</div>
										}
										key={1}
										showArrow={true}
										className="panel"
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
											{options.map((option, index) => (
												<Panel
													className="panel panel-child"
													header={renderPanelHeader(option, index)}
													// biome-ignore lint/suspicious/noArrayIndexKey: FIXME
													key={`option-${index}`}
													showArrow={true}
												>
													<OptionsPreProcessingS>
														{renderOptionContent(option, index)}
													</OptionsPreProcessingS>
												</Panel>
											))}

											<Button
												type="dashed"
												className="text-[#8080809c] font-bold mt-2 border-0 w-full"
												icon={<Icon icon="plus" />}
												onClick={() => setIsModalOptionOpen(true)}
												disabled={isDisabledForWorkflow}
											>
												{jp.common.addOption}
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
					disabled={
						startedGenerate || !options.length || (!assetId && !contentId)
					}
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

			<Modal
				centered
				open={isModalOptionOpen}
				onCancel={() => setIsModalOptionOpen(false)}
				title={jp.common.addOption}
				footer={false}
			>
				<ModalContent>
					{optionButtons.map((group) => (
						<div key={group?.title}>
							<p className="title">{group.title}</p>
							<div className="option">
								{group.buttons.map((button) => (
									<Button
										key={button?.label}
										htmlType="button"
										type="default"
										onClick={button.onClick}
									>
										{button.label}
									</Button>
								))}
							</div>
						</div>
					))}
				</ModalContent>
			</Modal>

			<Modal
				centered
				open={isModalCleansingOpen}
				onCancel={() => setIsModalCleansingOpen(false)}
				title={jp.common.addOption}
				footer={false}
			>
				<ModalContent>
					<p className="title">クレンジング</p>

					<div className="option">
						<Button
							htmlType="button"
							type="default"
							onClick={() => handleAddOption(PreprocessOptions.DELETE)}
						>
							削除
						</Button>
						<Button
							htmlType="button"
							type="default"
							onClick={() => handleAddOption(PreprocessOptions.REPLACE)}
						>
							置換
						</Button>
						<Button
							htmlType="button"
							type="default"
							onClick={() => handleAddOption(PreprocessOptions.NORMALIZE)}
						>
							表記ゆれの正規化
						</Button>
						<Button
							htmlType="button"
							type="default"
							onClick={() => handleAddOption(PreprocessOptions.MISSING)}
						>
							欠損値の処理
						</Button>
					</div>

					<div className="back">
						<button
							type="button"
							onClick={() => setIsModalCleansingOpen(false)}
						>
							一覧に戻る
						</button>
					</div>
				</ModalContent>
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
				operatorType={OPERATOR_TYPE.PRE_PROCESSING}
			/>

			<ModalSelectTemplate
				isModalSelectOpen={isModalSelectOpen}
				setIsModalSelectOpen={setIsModalSelectOpen}
				tempTemplate={tempTemplate}
				setTempTemplate={setTempTemplate}
				operatorType={
					workflowDetail
						? OPERATOR_TYPE.WORK_FLOW
						: OPERATOR_TYPE.PRE_PROCESSING
				}
				handleAcceptedTemplate={handleAcceptedTemplate}
			/>
		</SettingOperatorS>
	);
};

export default Setting;
