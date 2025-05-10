import { useCallback, useEffect, useState } from "react";

import Button from "app/components/atoms/Button";
import Form, { type ValidateErrorEntity } from "app/components/atoms/Form";
import Input from "app/components/atoms/Input";
import Modal from "app/components/atoms/Modal";
import type { CurrentView } from "app/components/molecules/View/types";
// import { modalStateType } from "app/components/organisms/Project/Content/ViewsMenu/hooks";

interface Props {
	currentView: CurrentView;
	open: boolean;
	// modalState: modalStateType;
	// biome-ignore lint/suspicious/noExplicitAny: FIXME
	modalState: any;
	submitting: boolean;
	onClose: () => void;
	onCreate: (name: string) => Promise<void>;
	OnUpdate: (viewId: string, name: string) => Promise<void>;
}

interface FormType {
	name: string;
}

const ViewFormModal: React.FC<Props> = ({
	currentView,
	open,
	modalState,
	submitting,
	onClose,
	onCreate,
	OnUpdate,
}) => {
	const [form] = Form.useForm<FormType>();
	const [isDisabled, setIsDisabled] = useState(true);

	useEffect(() => {
		if (open) {
			if (currentView && modalState === "rename") {
				form.setFieldsValue(currentView);
			} else {
				form.resetFields();
			}
		}
	}, [form, currentView, open, modalState]);

	const handleSubmit = useCallback(async () => {
		setIsDisabled(true);
		try {
			const values = await form.validateFields();
			if (modalState === "create") {
				await onCreate(values.name);
			} else if (currentView.id) {
				await OnUpdate(currentView.id, values.name);
			}
			onClose();
			form.resetFields();
		} catch {
			setIsDisabled(false);
		}
	}, [form, modalState, onClose, onCreate, OnUpdate, currentView.id]);

	const handleClose = useCallback(() => {
		form.resetFields();
		setIsDisabled(true);
		onClose();
	}, [form, onClose]);

	const handleValuesChange = useCallback(
		async (_: unknown, values: FormType) => {
			if (currentView.name === values.name) {
				setIsDisabled(true);
				return;
			}
			const hasError = await form
				.validateFields()
				.then(() => false)
				.catch(
					(errorInfo: ValidateErrorEntity) => errorInfo.errorFields.length > 0,
				);
			setIsDisabled(hasError);
		},
		[currentView.name, form],
	);

	return (
		<Modal
			open={open}
			onCancel={handleClose}
			title={modalState === "create" ? "新しいビュー" : "ビューを更新します"}
			footer={[
				<Button key="back" onClick={handleClose} disabled={submitting}>
					キャンセル
				</Button>,
				<Button
					key="submit"
					type="primary"
					loading={submitting}
					onClick={handleSubmit}
					disabled={isDisabled}
				>
					OK
				</Button>,
			]}
		>
			<Form form={form} layout="vertical" onValuesChange={handleValuesChange}>
				<Form.Item
					name="name"
					label="ビュー名"
					extra="ビューのタイトル"
					rules={[{ required: true, message: "ビュー名を入力してください！" }]}
				>
					<Input />
				</Form.Item>
			</Form>
		</Modal>
	);
};

export default ViewFormModal;
