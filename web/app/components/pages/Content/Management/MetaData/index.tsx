import { useLocation, useSubmit } from "@remix-run/react";
import type * as React from "react";
import { DEFAULT_REGION } from "~/commons/core.const";
import jp from "~/commons/locales/jp";
import Button from "~/components/atoms/Button";
import Input from "~/components/atoms/Input";
import { formatDate } from "~/components/molecules/Common/utils";
import type { DataTableContentType } from "~/components/pages/Content/types";
import { ACTION_TYPES_CONTENT, type ContentItem } from "~/models/content";
import {
	type ContentMetaData,
	ContentMetaDataLabel,
} from "~/models/contentMetadataModel";
import { bytesFormat } from "~/utils/format";

type MetaDataProps = {
	contentDetail: DataTableContentType | ContentItem;
	metaData: ContentMetaData;
	setMetaData: (val: (prevItem: ContentMetaData) => ContentMetaData) => void;
};

type MetaDataField = {
	key: keyof typeof ContentMetaDataLabel;
	type: "input" | "textarea" | "text";
	placeholder?: string;
	defaultValue?: string;
	formatter?: (
		// biome-ignore lint/suspicious/noExplicitAny: FIXME
		val: any,
	) => string;
};

const TextArea = Input.TextArea;

const MetaData: React.FC<MetaDataProps> = ({
	contentDetail,
	metaData,
	setMetaData,
}) => {
	const submit = useSubmit();
	const location = useLocation();
	const fullPath = `${location.pathname}${location.search}`;

	const handleUpdateContent = (key: string, value: string) => {
		setMetaData(
			(prevState: ContentMetaData | undefined) =>
				({
					...prevState,
					[key]: value,
				}) as ContentMetaData,
		);
	};

	const fields: MetaDataField[] = [
		{ key: "title", type: "input", placeholder: jp.common.typeSomething },
		{
			key: "description",
			type: "textarea",
			placeholder: jp.common.typeSomething,
		},
		{ key: "byteSize", type: "text", formatter: bytesFormat },
		{ key: "format", type: "input", placeholder: "csv", defaultValue: "csv" },
		{
			key: "compressFormat",
			type: "input",
			placeholder: jp.common.typeSomething,
		},
		{
			key: "mediaType",
			type: "input",
			placeholder: "text/csv",
			defaultValue: "text/csv",
		},
		{
			key: "issued",
			type: "text",
			formatter: (val) =>
				formatDate(new Date(val).toISOString(), DEFAULT_REGION, "yyyy-MM-dd"),
			placeholder: "2024-11-23",
			defaultValue: "2024-11-23",
		},
		{
			key: "modified",
			type: "text",
			formatter: (val) =>
				formatDate(new Date(val).toISOString(), DEFAULT_REGION, "yyyy-MM-dd"),
			placeholder: "2024-11-22",
			defaultValue: "2024-11-22",
		},
		{
			key: "temporalResolution",
			type: "input",
			placeholder: "2024-11-23/2025-11-22",
			defaultValue: "2024-11-23/2025-11-22",
		},
		{
			key: "accessRights",
			type: "input",
			placeholder: "配信中",
			defaultValue: "配信中",
		},
		{ key: "language", type: "input", placeholder: "ja", defaultValue: "ja" },
		{
			key: "license",
			type: "input",
			placeholder: "政府標準利用規約（第2.0版）",
			defaultValue: "政府標準利用規約（第2.0版）",
		},
		{
			key: "rights",
			type: "input",
			placeholder: "https://www.mlit.go.jp/links/terms-of-use.html",
			defaultValue: "https://www.mlit.go.jp/links/terms-of-use.html",
		},
		{
			key: "conformsTo",
			type: "input",
			placeholder: "https://www.w3.org/TR/vocab-dcat-3/",
			defaultValue: "https://www.w3.org/TR/vocab-dcat-3/",
		},
		{
			key: "isReferencedBy",
			type: "input",
			placeholder: "https://www.mlit.go.jp/links/",
			defaultValue: "https://www.mlit.go.jp/links/",
		},
		{ key: "accessURL", type: "input", placeholder: "https" },
		{ key: "downloadURL", type: "input", placeholder: "https" },
		{ key: "source", type: "text" },
		{ key: "documentName", type: "text" },
	];

	const renderValue = (field: MetaDataField) => {
		const value =
			metaData && typeof metaData[field.key] === "string"
				? metaData[field.key]
				: field?.defaultValue;

		if (field.formatter) return value ? field.formatter(value) : "-";
		if (field.type === "text") return value ?? "-";
		if (field.type === "textarea")
			return (
				<TextArea
					placeholder={field.placeholder}
					size="middle"
					onChange={(e) => handleUpdateContent(field.key, e.target.value)}
					value={value}
				/>
			);

		return (
			<Input
				placeholder={field.placeholder}
				className="input"
				value={value}
				onChange={(e) => handleUpdateContent(field.key, e.target.value)}
			/>
		);
	};

	const handleSaveMetadata = () => {
		const formData = new FormData();
		formData.append("_action", ACTION_TYPES_CONTENT.SAVE_METADATA);
		formData.append("contentId", contentDetail.id);
		formData.append("metaData", JSON.stringify(metaData));

		submit(formData, { method: "post", action: fullPath });
	};

	return (
		<div className="management-item content-detail">
			{fields.map((field) => (
				<div key={field.key}>
					<p className="management-item-title">
						{ContentMetaDataLabel[field.key]}
					</p>
					<p className="management-item-title">{renderValue(field)}</p>
				</div>
			))}
			<div className="mt-5">
				<Button onClick={handleSaveMetadata}>{jp.common.save}</Button>
			</div>
		</div>
	);
};

export default MetaData;
