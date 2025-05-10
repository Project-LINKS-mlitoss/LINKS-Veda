import {
	Link,
	useActionData,
	useFetcher,
	useLocation,
	useNavigate,
	useNavigation,
	useParams,
	useSubmit,
} from "@remix-run/react";
import type * as React from "react";
import { useEffect, useState } from "react";
import {
	CONTENT_FIELD_TYPE,
	CONTENT_MANAGEMENT_PUBLISH,
	DEFAULT_REGION,
	INPUT_TYPE,
} from "~/commons/core.const";
import jp from "~/commons/locales/jp";
import Button from "~/components/atoms/Button";
import Collapse from "~/components/atoms/Collapse";
import Icon from "~/components/atoms/Icon";
import Input from "~/components/atoms/Input";
import Select from "~/components/atoms/Select";
import Switch from "~/components/atoms/Switch";
import {
	formatDate,
	showNotification,
} from "~/components/molecules/Common/utils";
import ModalSelectContent from "~/components/pages/Dataset/Modal/ModalSelectContent";
import { DatasetCreateEditS } from "~/components/pages/Dataset/styles";
import {
	type Field,
	MODE_DATASET_COMPONENT,
	type SettingT,
	defaultMetaData,
} from "~/components/pages/Dataset/types";
import type { ContentItem } from "~/models/content";
import {
	ACTION_TYPES_DATASET,
	type DatasetT,
	type SaveDatasetDatabaseT,
} from "~/models/dataset";
import type { UseCaseI } from "~/models/useCaseModel";
import type { ApiResponse } from "~/repositories/utils";
import { routes } from "~/routes/routes";

const TextArea = Input.TextArea;

type Props = {
	data?: DatasetT;
	mode: MODE_DATASET_COMPONENT;
};

const SettingDataset: React.FC<Props> = ({ data, mode }) => {
	// Props
	const isPreview = mode === MODE_DATASET_COMPONENT.PREVIEW;

	// Remix
	const navigation = useNavigation();
	const submit = useSubmit();
	const { datasetId } = useParams();
	const location = useLocation();
	const fullPath = `${location.pathname}${location.search}`;
	const fetchUseCase = useFetcher<ApiResponse<UseCaseI>>();
	const actionData = useActionData<ApiResponse<DatasetT>>();
	const navigate = useNavigate();

	// State
	const [isInitialized, setIsInitialized] = useState(false);
	const [isLoadingSave, setIsLoadingSave] = useState(false);
	const [isModalSelectContentOpen, setIsModalSelectContentOpen] =
		useState(false);
	const [tempContentZips, setTempContentZips] = useState<
		(ContentItem | undefined)[]
	>([]);
	const [editingContentIndex, setEditingContentIndex] = useState<number>(-1);
	const [setting, setSetting] = useState<SettingT>({
		name: "",
		useCase: "",
		isPublish: false,
		contents: [],
	});
	const isGeoJson =
		setting?.contents?.some((content) =>
			content?.schema?.fields?.some(
				(field) => field?.type === CONTENT_FIELD_TYPE.GEO,
			),
		) ?? false;
	const [optionsUseCase, setOptionsUseCase] = useState<
		{ value: string; label: string; id: number }[]
	>([]);
	const [metaData, setMetaData] = useState<Field[]>(defaultMetaData);

	useEffect(() => {
		if (isGeoJson) {
			handleInputChange("type", INPUT_TYPE.GEOJSON);
			return;
		}
		handleInputChange("type", INPUT_TYPE.JSON);
	}, [isGeoJson]);

	// Get use-case
	// biome-ignore lint/correctness/useExhaustiveDependencies: FIXME
	useEffect(() => {
		fetchUseCase.load("/use-case");
	}, []);

	useEffect(() => {
		if (fetchUseCase?.data?.status) {
			const optionsUseCase = fetchUseCase.data?.data
				? Array.isArray(fetchUseCase.data.data)
					? fetchUseCase.data.data.map((useCase) => ({
							value: useCase.name,
							label: useCase.name,
							id: useCase.id,
						}))
					: []
				: [];

			setOptionsUseCase(optionsUseCase);
		}
	}, [fetchUseCase]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: FIXME
	useEffect(() => {
		if (!isInitialized && data && optionsUseCase.length) {
			const initSetting = {
				name: data?.name,
				useCase:
					optionsUseCase.find((op) => op.id === data?.useCaseId)?.value ?? "",
				isPublish: data?.isPublish,
				contents: data?.contents ?? [],
			};
			setSetting(initSetting);

			const metaData =
				(data?.metaData as unknown as Field[]) || defaultMetaData;
			const updatedMetaData = metaData?.map((field: Field) => {
				const defaultMeta = defaultMetaData?.find((d) => d?.key === field?.key);
				const isDisabled = isPreview || (defaultMeta?.disabled as boolean);
				const placeholder = defaultMeta?.placeholder || "";
				const newDate = formatDate(
					new Date().toISOString(),
					DEFAULT_REGION,
					"yyyy-MM-dd",
				);

				if (field.key === "modified") {
					return {
						...field,
						value: newDate,
						placeholder: newDate,
						disabled: isDisabled,
					};
				}

				if (field.key === "title") {
					return {
						...field,
						value: field?.value || data?.name,
						placeholder,
						disabled: isDisabled,
					};
				}

				return {
					...field,
					placeholder,
					disabled: isDisabled,
				};
			});
			setMetaData(updatedMetaData);

			setIsInitialized(true);
		}
	}, [data, optionsUseCase, isInitialized]);

	// Action
	// biome-ignore lint/suspicious/noExplicitAny: FIXME
	const handleUpdateSetting = (key: string, value: any) => {
		setSetting((prevState) => ({
			...prevState,
			[key]: value,
		}));
	};

	const handleOpenModalChooseContent = (index: number) => {
		setEditingContentIndex(index);
		setTempContentZips(
			setting?.contents[index] ? [setting?.contents[index]] : [],
		);
		setIsModalSelectContentOpen(true);
	};

	const handleAcceptedContentZip = (index: number) => {
		if (tempContentZips) {
			setSetting((prevState) => {
				const updatedContents = [...prevState.contents];

				if (index === -1) {
					updatedContents.unshift(
						...tempContentZips.filter(
							(item): item is ContentItem => item !== undefined,
						),
					);
				} else if (index !== null) {
					updatedContents[index] = tempContentZips[0] ?? null;
				}

				return {
					...prevState,
					contents: updatedContents,
				};
			});

			setIsModalSelectContentOpen(false);
		}
	};

	const handleDeleteContent = (index: number) => {
		setSetting((prevState) => {
			const updatedContents = [...prevState.contents];
			updatedContents.splice(index, 1);
			return {
				...prevState,
				contents: updatedContents,
			};
		});
	};

	const handleInputChange = (key: string, newValue: string) => {
		setMetaData((prevMeta) =>
			prevMeta.map((meta) =>
				meta.key === key ? { ...meta, value: newValue } : meta,
			),
		);
	};

	// Handle Save
	const handleSave = (isPublish: boolean) => {
		setIsLoadingSave(true);

		const formData = new FormData();
		formData.append("actionType", ACTION_TYPES_DATASET.SAVE);

		const saveDatasetDatabase: SaveDatasetDatabaseT = {
			name: setting?.name,
			isPublish: isPublish,
			useCaseId:
				optionsUseCase.find((op) => op.value === setting?.useCase)?.id ?? 0,
			metaData: metaData.map((meta) => ({ ...meta })),
		};
		formData.append("saveDatasetDatabase", JSON.stringify(saveDatasetDatabase));
		formData.append(
			"saveDatasetContentManagementDatabase",
			JSON.stringify(setting?.contents),
		);

		if (isPreview) {
			formData.append("datasetId", JSON.stringify(data?.id));
		}

		submit(formData, { method: "post", action: fullPath });
	};

	// Handle Response data
	// biome-ignore lint/correctness/useExhaustiveDependencies: FIXME
	useEffect(() => {
		if (
			actionData &&
			navigation.state === "idle" &&
			actionData?.actionType === ACTION_TYPES_DATASET.SAVE
		) {
			if (actionData.status === false) {
				showNotification(false, jp.message.common.saveFailed, actionData.error);
				navigate(fullPath, { replace: true });
			} else {
				showNotification(true, jp.message.common.saveSuccessful);
				if (!isPreview && !datasetId) {
					navigate(routes.dataset);
				} else {
					navigate(fullPath, { replace: true });
				}
			}
			setIsLoadingSave(false);
		}
	}, [actionData, navigate, isPreview, datasetId, navigation.state]);

	return (
		<>
			<DatasetCreateEditS isPreview={isPreview}>
				<div className="wrap-setting">
					<div className="setting">
						<div className="title-publish">
							<div className="name-use-case">
								{isPreview ? (
									<>
										<p>{setting?.name}</p>

										<p>{setting?.useCase}</p>
									</>
								) : (
									<>
										<div className="name-use-case-item">
											<p>データセット名</p>

											<Input
												placeholder="データセットの名前"
												className="input"
												value={setting?.name}
												onChange={(e) => {
													handleUpdateSetting("name", e.target.value);
													handleInputChange("title", e.target.value);
												}}
											/>
										</div>

										<div className="name-use-case-item">
											<p>ユースケース</p>

											<Select
												value={setting?.useCase}
												onChange={(value) =>
													handleUpdateSetting("useCase", value)
												}
												loading={optionsUseCase.length === 0}
												options={optionsUseCase}
											/>
										</div>
									</>
								)}
							</div>

							<div className="publish">
								<span className="label">データ公開</span>
								<Switch
									checked={setting?.isPublish}
									onChange={(val: boolean) => {
										handleUpdateSetting("isPublish", val);
										if (isPreview) {
											handleSave(val);
										}
									}}
									disabled={isLoadingSave}
								/>
							</div>
						</div>

						<Collapse
							defaultActiveKey={["1", "2"]}
							ghost
							items={[
								{
									key: "1",
									label: "コンテンツ",
									children: (
										<>
											<div className="setting-item">
												<p className="setting-item-title">コンテンツ</p>

												<div className="setting-item-content">
													{isPreview ? (
														<p className="notice">
															コンテンツが選択されていません
														</p>
													) : (
														<Button
															type="text"
															className="button-add"
															icon={<Icon icon="plus" color="#00000073" />}
															onClick={() => handleOpenModalChooseContent(-1)}
														>
															コンテンツ選択
														</Button>
													)}
												</div>
											</div>

											{setting?.contents?.map((content, index) => {
												const idOpenData = content?.management
													? content?.id
													: content?.duplicateContent?.contentId;
												return (
													<div
														className="setting-item"
														key={`${content?.id}${index}`}
													>
														<p className="setting-item-title">コンテンツ</p>

														<div className="setting-item-content">
															<div className="setting-item-info">
																<Link
																	to={`${routes.content}/${content?.id}`}
																	target="_blank"
																	className="name-metadata"
																>
																	<Icon icon="schema" size={16} />
																	<span>{content?.name ?? ""}</span>
																</Link>

																{isPreview ? null : (
																	<div className="action">
																		<Button
																			type="text"
																			className="button-action"
																			onClick={() =>
																				handleOpenModalChooseContent(index)
																			}
																		>
																			変更
																		</Button>

																		<Button
																			type="text"
																			className="button-action"
																			onClick={() => handleDeleteContent(index)}
																		>
																			削除
																		</Button>
																	</div>
																)}
															</div>
														</div>

														<div className="setting-item-content">
															<div className="setting-item-info">
																<Link
																	to={`${routes.content}/${idOpenData}`}
																	target="_blank"
																	className="name-metadata"
																>
																	<Icon icon="schema" size={16} />
																	<span>
																		{content?.management
																			? content?.name
																			: content?.duplicateContent?.name ?? ""}
																	</span>
																</Link>

																<div className="action">
																	<Button type="text">
																		{(content?.management
																			? content?.management?.status
																			: content?.duplicateContent
																				? content?.duplicateContent.status
																				: undefined) ===
																		CONTENT_MANAGEMENT_PUBLISH.PUBLISH
																			? "公開"
																			: "非公開"}
																	</Button>
																</div>
															</div>
														</div>
													</div>
												);
											})}
										</>
									),
								},
								{
									key: "2",
									label: "メタデータ",
									children: (
										<>
											{metaData.map((meta) => (
												<div key={meta.key} className="setting-item">
													<p className="setting-item-title">{meta.label}</p>
													<div className="setting-item-content">
														{meta.type === "textarea" ? (
															<TextArea
																placeholder={meta.placeholder}
																size="middle"
																value={meta.value}
																disabled={meta.disabled}
																onChange={(e) =>
																	handleInputChange(meta.key, e.target.value)
																}
																autoSize={{ minRows: 1, maxRows: 10 }}
															/>
														) : (
															<Input
																placeholder={meta.placeholder}
																className="input"
																value={meta.value}
																disabled={meta.disabled}
																onChange={(e) =>
																	handleInputChange(meta.key, e.target.value)
																}
															/>
														)}
													</div>
												</div>
											))}
										</>
									),
								},
							]}
						/>
					</div>
				</div>

				{!isPreview ? (
					<div className="button-bottom">
						<Button
							type="primary"
							loading={isLoadingSave}
							disabled={!setting.name || !setting.useCase}
							icon={<Icon icon="save" size={16} />}
							onClick={() => handleSave(setting?.isPublish)}
						>
							{jp.common.save}
						</Button>
					</div>
				) : null}
			</DatasetCreateEditS>

			{!isPreview ? (
				<ModalSelectContent
					isOpen={isModalSelectContentOpen}
					onCancel={() => setIsModalSelectContentOpen(false)}
					onOk={() => handleAcceptedContentZip(editingContentIndex)}
					selectedContents={setting.contents.filter(
						(content): content is ContentItem => content !== null,
					)}
					tempSelectedContents={tempContentZips}
					setTempSelectedContents={setTempContentZips}
					isMultiple={editingContentIndex < 0}
				/>
			) : null}
		</>
	);
};

export default SettingDataset;
