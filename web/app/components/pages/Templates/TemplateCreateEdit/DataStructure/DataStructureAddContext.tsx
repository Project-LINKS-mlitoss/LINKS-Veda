import type { JsonValue } from "@prisma/client/runtime/library";
import type * as React from "react";
import { useEffect, useState } from "react";
import jp from "~/commons/locales/jp";
import Button from "~/components/atoms/Button";
import Form from "~/components/atoms/Form";
import Icon from "~/components/atoms/Icon";
import Input from "~/components/atoms/Input";
import Select from "~/components/atoms/Select";
import { SettingOperatorTemplateS } from "~/components/pages/Templates/styles";
import type {
	FieldType,
	MODE_TEMPLATE,
} from "~/components/pages/Templates/types";
import type { GenSourceItem } from "~/models/operators";

const { Option } = Select;

interface Props {
	data?: JsonValue | null;
	mode?: MODE_TEMPLATE;
	setFieldsTemplate?: (vaL: FieldType[]) => void;
}

const DataStructureAddContext: React.FC<Props> = (props) => {
	const { data, mode, setFieldsTemplate } = props;
	const configJson = typeof data === "string" ? JSON.parse(data ?? "") : {};

	const [fields, setFields] = useState<FieldType[]>([
		{ type: "text", value: "" },
	]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: FIXME
	useEffect(() => {
		if (setFieldsTemplate) {
			setFieldsTemplate(fields);
		}
	}, [fields]);

	// handle setting detail
	// biome-ignore lint/correctness/useExhaustiveDependencies: FIXME
	useEffect(() => {
		if (data && configJson) {
			const initialFieldsData = configJson.genSourceName.map(
				(field: GenSourceItem) => ({
					type: field.type,
					value: field.target,
				}),
			);
			setFields(initialFieldsData);
		}
	}, [data]);

	return (
		<SettingOperatorTemplateS>
			<div className="form">
				{fields.map((field, index) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: FIXME
					<Form.Item key={`context-${index}`}>
						<Icon icon="dotsSixVertical" />
						<Select defaultValue={field.type} className="select">
							<Option value="text">テキスト</Option>
							<Option value="column">カラム</Option>
						</Select>
						<Input placeholder={jp.common.enterValue} value={field.value} />
						{fields.length > 1 && index !== 0 && (
							<Button type="text" icon={<Icon icon="close" />} />
						)}
					</Form.Item>
				))}
			</div>
		</SettingOperatorTemplateS>
	);
};

export default DataStructureAddContext;
