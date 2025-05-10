import { useState } from "react";
import jp from "~/commons/locales/jp";
import Button from "~/components/atoms/Button";
import Form from "~/components/atoms/Form";
import Icon from "~/components/atoms/Icon";
import Input from "~/components/atoms/Input";
import Modal from "~/components/atoms/Modal";
import Select from "~/components/atoms/Select";
import Switch from "~/components/atoms/Switch";
import {
	type AddContentInput,
	FIELD_TYPE,
} from "~/components/pages/Content/types";
import { useModal } from "~/hooks/useModal";
import type { ContentField } from "~/models/content";

const { Option } = Select;

type InsertColumnModalProps = {
	onAddColumn: (params: AddContentInput) => void;
	fields: ContentField[];
};

const columnTypeOptions = [
	{ value: FIELD_TYPE.Text, label: jp.common.string },
	{ value: FIELD_TYPE.Number, label: jp.common.int },
	{ value: FIELD_TYPE.Bool, label: jp.common.boolean },
	// { value: FIELD_TYPE.Multiple, label: jp.common.multiple },
];

export function InsertColumnModal({
	onAddColumn,
	fields,
}: InsertColumnModalProps) {
	const { open, closeModal, showModal } = useModal();
	const [form] = Form.useForm<AddContentInput>();
	const [type, setType] = useState<string>(FIELD_TYPE.Text);

	const handleTypeChange = (value: string) => {
		setType(value);
		form.resetFields(["initialValue"]);
	};

	return (
		<>
			<Button
				icon={<Icon icon="row" size={16} />}
				onClick={() => {
					showModal();
					form.resetFields();
				}}
			>
				{jp.common.addColumn}
			</Button>
			<Modal
				title={jp.common.addColumn}
				open={open}
				onCancel={closeModal}
				destroyOnClose
				centered
				footer={[
					<Button key="cancel" onClick={closeModal}>
						{jp.common.cancel}
					</Button>,
					<Button
						key="submit"
						type="primary"
						htmlType="submit"
						form="addRowForm"
						onClick={(e) => {
							form.validateFields().then((values) => {
								e.stopPropagation();
								onAddColumn(values);
								closeModal();
								setType(FIELD_TYPE.Text);
							});
						}}
					>
						{jp.common.addColumn}
					</Button>,
				]}
			>
				<Form
					id="addRowForm"
					layout="vertical"
					form={form}
					initialValues={{ type: FIELD_TYPE.Text }}
				>
					<Form.Item
						label={jp.common.columnName}
						name="contentName"
						required
						rules={[
							{ required: true, message: "Please enter content name" },
							{
								validator: (_, value) => {
									if (fields.some((field) => field.key === value)) {
										return Promise.reject("Duplicate content name");
									}
									if (value === "id") {
										return Promise.reject("Invalid column name.");
									}
									return Promise.resolve(undefined);
								},
							},
						]}
					>
						<Input placeholder="名前を入力してください" />
					</Form.Item>

					<Form.Item
						label={jp.common.type}
						name="type"
						rules={[
							{ required: true, message: "カラムの型を選択してください" },
						]}
					>
						<Select onChange={handleTypeChange}>
							{columnTypeOptions.map((option) => (
								<Option key={option?.value} value={option?.value}>
									{option?.label}
								</Option>
							))}
						</Select>
					</Form.Item>

					<Form.Item label={jp.common.initialValue} name="initialValue">
						{type === FIELD_TYPE.Text || type === FIELD_TYPE.Multiple ? (
							<Input placeholder="名前を入力してください" />
						) : type === FIELD_TYPE.Number ? (
							<Input
								type="number"
								step="any"
								placeholder="名前を入力してください"
							/>
						) : type === FIELD_TYPE.Bool ? (
							<Switch />
						) : null}
					</Form.Item>
				</Form>
			</Modal>
		</>
	);
}
