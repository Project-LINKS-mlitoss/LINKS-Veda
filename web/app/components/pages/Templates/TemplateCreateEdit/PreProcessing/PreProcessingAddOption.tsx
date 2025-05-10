import type { JsonValue } from "@prisma/client/runtime/library";
import type * as React from "react";
import { Fragment, useEffect, useState } from "react";
import jp from "~/commons/locales/jp";
import Button from "~/components/atoms/Button";
import Checkbox from "~/components/atoms/Checkbox";
import Collapse from "~/components/atoms/Collapse";
import Dropdown, { type MenuProps } from "~/components/atoms/Dropdown";
import Icon from "~/components/atoms/Icon";
import Input from "~/components/atoms/Input";
import Select from "~/components/atoms/Select";
import { OptionsPreProcessingS } from "~/components/pages/Operators/styles";
import {
	type DeleteOption,
	type DocumentNameOption,
	type GeocodingOption,
	type MaskingAddressOption,
	type MaskingIdOption,
	type MissingOption,
	type NormalizationOption,
	type OptionsPreProcessing,
	PREPROCESS_TYPE,
	PreprocessOptions,
	type RankingOption,
	type ReplaceOption,
	optionNormalize,
	rankingRangeOptions,
	rankingTypeOptions,
} from "~/components/pages/Operators/types";
import { SettingOperatorTemplateS } from "~/components/pages/Templates/styles";
import { MODE_TEMPLATE } from "~/components/pages/Templates/types";

const { Panel } = Collapse;
const { Option } = Select;

interface Props {
	data?: JsonValue | null;
	mode?: MODE_TEMPLATE;
	handleRemoveTemplateByIndex?: () => void;
	isActive?: boolean;
}

const PreProcessingAddOption: React.FC<Props> = (props) => {
	const { data, mode, handleRemoveTemplateByIndex, isActive } = props;
	const isPreview = mode === MODE_TEMPLATE.USE;

	const [options, setOptions] = useState<OptionsPreProcessing[]>();
	const [activeKeys, setActiveKeys] = useState<(string | number)[]>([]);
	const [preProcessType, setPreProcessType] = useState<PREPROCESS_TYPE>(
		PREPROCESS_TYPE.CLEANING,
	);

	// handle detail UI
	useEffect(() => {
		if (data) {
			const configJson = typeof data === "string" ? JSON.parse(data ?? "") : {};
			setOptions(configJson?.options);
			setPreProcessType(
				configJson?.preProcessType
					? configJson?.preProcessType
					: PREPROCESS_TYPE.CLEANING,
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
				<span className="mr-2">結合前処理</span>

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

	const renderPanelHeader = (option: OptionsPreProcessing, index: number) => {
		const items: MenuProps["items"] = [
			{
				key: `clone-${index}`,
				label: <button type="button">複製</button>,
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
							<button type="button" disabled={isPreview}>
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
							<Checkbox checked={isChecked}>カラム指定</Checkbox>
							<Input
								value={deleteOption?.input1}
								placeholder={jp.common.placeholder}
								disabled={!isChecked}
							/>
						</div>

						<div className="line">
							<Select
								defaultValue="一致する文字列"
								value={
									deleteOption?.select === "\t" ? "tab" : deleteOption?.select
								}
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
								disabled={deleteOption?.isFirstOption}
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
							<Checkbox checked={isChecked}>カラム指定</Checkbox>
							<Input
								value={replaceOption?.input1}
								placeholder={jp.common.placeholder}
								disabled={!isChecked}
							/>
						</div>

						<div className="line">
							<Input
								value={replaceOption?.input2}
								placeholder={jp.common.placeholder}
							/>
							<p>と一致する文字列を</p>
						</div>

						<div className="line">
							<Input
								value={replaceOption?.input3}
								placeholder={jp.common.placeholder}
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
							<Checkbox checked={isChecked}>カラム指定</Checkbox>
							<Input
								value={normalizeOption?.input1}
								placeholder={jp.common.placeholder}
								disabled={!isChecked}
							/>
						</div>
						<div className="line">
							<p>対象</p>
							<Select
								value={normalizeOption.select}
								options={optionNormalize}
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
							<Checkbox checked={isChecked}>カラム指定</Checkbox>
							<Input
								value={missingOption?.input1}
								placeholder={jp.common.placeholder}
								disabled={!isChecked}
							/>
						</div>

						<div className="line">
							<Select value={missingOption?.select} defaultValue={"文字列"}>
								<Option value="文字列">文字列</Option>
								<Option value="0を代入">0を代入</Option>
								<Option value="行ごと削除">行ごと削除</Option>
							</Select>
							<Input
								value={missingOption?.input2}
								placeholder={jp.common.placeholder}
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
								value={documentNameOption?.input1}
								placeholder={jp.common.placeholder}
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
							<Input
								value={geocodingOption?.input1}
								placeholder={jp.common.placeholder}
							/>
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

							<Input
								value={rankingOption?.input1}
								placeholder={jp.common.placeholder}
							/>
						</div>
						<div className="line line-grid">
							<p>採番方法</p>
							<Select
								value={rankingOption?.select1}
								options={rankingTypeOptions}
							/>
						</div>
						<div className="line line-grid">
							<p>階層</p>
							<Select
								value={rankingOption?.select2}
								options={rankingRangeOptions}
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
													<Input value={r?.min ?? undefined} type="number" />
													<Button type="text" icon={<Icon icon="close" />} />
												</div>
											</div>
											<div className="line line-grid">
												<p>最大値</p>
												<Input value={r?.max ?? undefined} type="number" />
											</div>
										</Fragment>
									);
								})}
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

							<Input
								value={maskingIdOption?.input1}
								placeholder={jp.common.placeholder}
							/>
						</div>
						<div className="line">
							<p>接頭辞</p>
							<Input
								value={maskingIdOption?.input2}
								placeholder={jp.common.placeholder}
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

							<Input
								value={maskingAddressOption?.input1}
								placeholder={jp.common.placeholder}
							/>
						</div>
					</div>
				);
			}
			default:
				return null;
		}
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
				>
					<Panel
						header={renderPanelHeaderParent()}
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
							}}
							className="coll"
						>
							{options?.map((option, index) => (
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
						</Collapse>
					</Panel>
				</Collapse>
			</div>
		</SettingOperatorTemplateS>
	);
};

export default PreProcessingAddOption;
