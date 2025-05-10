import styled from "@emotion/styled";
import { useCallback, useState } from "react";

import Button from "app/components/atoms/Button";
import Form, { type ValidateErrorEntity } from "app/components/atoms/Form";
import Input from "app/components/atoms/Input";

interface Props {
	workspaceName?: string;
	updateWorkspaceLoading: boolean;
	onWorkspaceUpdate: (name: string) => Promise<void>;
}

interface FormType {
	name: string;
}

const WorkspaceGeneralForm: React.FC<Props> = ({
	workspaceName,
	updateWorkspaceLoading,
	onWorkspaceUpdate,
}) => {
	const [form] = Form.useForm<FormType>();
	const [isDisabled, setIsDisabled] = useState(true);

	const handleValuesChange = useCallback(
		async (_: unknown, values: FormType) => {
			if (workspaceName === values.name) {
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
		[form, workspaceName],
	);

	const handleSubmit = useCallback(async () => {
		setIsDisabled(true);
		try {
			const values = await form.validateFields();
			await onWorkspaceUpdate(values.name);
		} catch (_) {
			setIsDisabled(false);
		}
	}, [form, onWorkspaceUpdate]);

	return (
		<StyledForm
			form={form}
			initialValues={{ name: workspaceName }}
			layout="vertical"
			autoComplete="off"
			onValuesChange={handleValuesChange}
			requiredMark={false}
		>
			<Form.Item
				name="name"
				label="ワークスペース名"
				extra="ワークスペース名はワークスペースを判別するために表示されます。あなたの会社名、部署名、その他プロジェクトのテーマなどを利用することをお勧めします。"
				rules={[
					{
						required: true,
						message: "新しいワークスペース名を入力してください。",
					},
				]}
			>
				<Input />
			</Form.Item>
			<Button
				onClick={handleSubmit}
				type="primary"
				loading={updateWorkspaceLoading}
				disabled={isDisabled}
			>
				変更を保存
			</Button>
		</StyledForm>
	);
};

const StyledForm = styled(Form<FormType>)`
  max-width: 400px;
`;

export default WorkspaceGeneralForm;
