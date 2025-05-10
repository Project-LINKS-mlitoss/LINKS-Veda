import { useCallback, useState } from "react";

import Button from "app/components/atoms/Button";
import Form, { type ValidateErrorEntity } from "app/components/atoms/Form";
import Input from "app/components/atoms/Input";
import Modal from "app/components/atoms/Modal";
import TextArea from "app/components/atoms/TextArea";
import { IntegrationType } from "app/components/molecules/MyIntegrations/types";

interface Props {
	open: boolean;
	loading: boolean;
	onClose: () => void;
	onSubmit: (values: FormValues) => Promise<void>;
}

interface FormValues {
	name: string;
	description: string;
	logoUrl: string;
	type: IntegrationType;
}

const initialValues: FormValues = {
	name: "",
	description: "",
	logoUrl: "",
	type: IntegrationType.Private,
};

const IntegrationCreationModal: React.FC<Props> = ({
	open,
	loading,
	onClose,
	onSubmit,
}) => {
	const [form] = Form.useForm<FormValues>();
	const [isDisabled, setIsDisabled] = useState(true);

	const handleSubmit = useCallback(async () => {
		setIsDisabled(true);
		try {
			const values = await form.validateFields();
			values.logoUrl = "_"; // TODO: should be implemented when assets upload is ready to use
			values.type = IntegrationType.Private;
			await onSubmit(values);
			onClose();
			form.resetFields();
		} catch (_) {
			setIsDisabled(false);
		}
	}, [form, onClose, onSubmit]);

	const handleClose = useCallback(() => {
		form.resetFields();
		onClose();
		setIsDisabled(true);
	}, [onClose, form]);

	const handleValuesChange = useCallback(async () => {
		const hasError = await form
			.validateFields()
			.then(() => false)
			.catch(
				(errorInfo: ValidateErrorEntity) => errorInfo.errorFields.length > 0,
			);
		setIsDisabled(hasError);
	}, [form]);

	return (
		<Modal
			open={open}
			onCancel={handleClose}
			onOk={handleSubmit}
			title="新規インテグレーション"
			footer={[
				<Button key="back" onClick={handleClose} disabled={loading}>
					キャンセル
				</Button>,
				<Button
					key="submit"
					type="primary"
					onClick={handleSubmit}
					disabled={isDisabled}
					loading={loading}
				>
					作成
				</Button>,
			]}
		>
			<Form
				form={form}
				layout="vertical"
				initialValues={initialValues}
				onValuesChange={handleValuesChange}
			>
				<Form.Item
					name="name"
					label="インテグレーション名"
					rules={[
						{
							required: true,
							message: "インテグレーションの名前を入力してください",
						},
					]}
				>
					<Input />
				</Form.Item>
				<Form.Item name="description" label="説明">
					<TextArea rows={3} showCount maxLength={100} />
				</Form.Item>
			</Form>
		</Modal>
	);
};

export default IntegrationCreationModal;
