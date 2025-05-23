import styled from "@emotion/styled";
import { useCallback, useMemo, useState } from "react";

import Button from "app/components/atoms/Button";
import Col from "app/components/atoms/Col";
import Divider from "app/components/atoms/Divider";
import Form, { type ValidateErrorEntity } from "app/components/atoms/Form";
import Icon from "app/components/atoms/Icon";
import Input from "app/components/atoms/Input";
import Modal from "app/components/atoms/Modal";
import Row from "app/components/atoms/Row";
import TextArea from "app/components/atoms/TextArea";
import type { Integration } from "app/components/molecules/MyIntegrations/types";

interface Props {
	integration: Integration;
	updateIntegrationLoading: boolean;
	regenerateLoading: boolean;
	onIntegrationUpdate: (data: {
		name: string;
		description: string;
		logoUrl: string;
	}) => Promise<void>;
	onRegenerateToken: () => Promise<void>;
}

interface FormType {
	name: string;
	description: string;
	logoUrl: string;
}

const MyIntegrationForm: React.FC<Props> = ({
	integration,
	updateIntegrationLoading,
	regenerateLoading,
	onIntegrationUpdate,
	onRegenerateToken,
}) => {
	const [form] = Form.useForm<FormType>();
	const [isDisabled, setIsDisabled] = useState(true);

	const handleValuesChange = useCallback(
		async (_: unknown, values: FormType) => {
			const hasError = await form
				.validateFields()
				.then(() => false)
				.catch(
					(errorInfo: ValidateErrorEntity) => errorInfo.errorFields.length > 0,
				);
			if (hasError) {
				setIsDisabled(true);
			} else {
				setIsDisabled(
					integration.name === values.name &&
						integration.description === values.description,
				);
			}
		},
		[form, integration.description, integration.name],
	);

	const handleSubmit = useCallback(async () => {
		setIsDisabled(true);
		try {
			const values = await form.validateFields();
			values.logoUrl = "_"; // TODO: should be implemented when assets upload is ready to use
			await onIntegrationUpdate(values);
		} catch (_) {
			setIsDisabled(false);
		}
	}, [form, onIntegrationUpdate]);

	const handleRegenerateToken = useCallback(() => {
		Modal.confirm({
			title: "インテグレーショントークンを再生成しますか？",
			content:
				"インテグレーショントークンを再生成すると、以前のトークンは無効になり、この操作は元に戻せません。本当に続行しますか？",
			okText: "リセット",
			onOk() {
				onRegenerateToken();
			},
		});
	}, [onRegenerateToken]);

	const copyIcon = useMemo(() => {
		const onClick = () => {
			if (integration.config.token)
				navigator.clipboard.writeText(integration.config.token);
		};
		return <Icon icon="copy" onClick={onClick} />;
	}, [integration.config.token]);

	return (
		<Form
			form={form}
			layout="vertical"
			initialValues={integration}
			onValuesChange={handleValuesChange}
		>
			<Row gutter={32}>
				<Col span={11}>
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
					<Form.Item label="インテグレーショントークン">
						<StyledTokenInput
							value={integration.config.token}
							contentEditable={false}
							prefix={copyIcon}
						/>
						<StyledRegenerateTokenButton
							type="primary"
							onClick={handleRegenerateToken}
							loading={regenerateLoading}
						>
							再生成
						</StyledRegenerateTokenButton>
					</Form.Item>
					<Form.Item>
						<Button
							type="primary"
							onClick={handleSubmit}
							disabled={isDisabled}
							loading={updateIntegrationLoading}
						>
							保存
						</Button>
					</Form.Item>
				</Col>
				<Col>
					<StyledDivider type="vertical" />
				</Col>
				<Col span={11}>
					<CodeExampleTitle>コード例</CodeExampleTitle>
					{/* <CodeExample>
            curl --location --request POST <br />
            &apos;{window.REEARTH_CONFIG?.api}/models/
            <CodeImportant>“{t("your model id here")}”</CodeImportant>/items&apos;&nbsp;\
            <br />
            --header &apos;Authorization: Bearer&nbsp;
            <CodeImportant>“{t("your Integration Token here")}”</CodeImportant>&apos;
          </CodeExample> */}
				</Col>
			</Row>
		</Form>
	);
};

const CodeExampleTitle = styled.h2`
  font-weight: 400;
  font-size: 14px;
  line-height: 22px;
  color: rgba(0, 0, 0, 0.85);
`;

const CodeExample = styled.div`
  border: 1px solid #d9d9d9;
  padding: 5px 12px;
  font-weight: 400;
  font-size: 14px;
  line-height: 22px;
  color: rgba(0, 0, 0, 0.85);
`;

const CodeImportant = styled.span`
  color: #ff4d4f;
`;

const StyledDivider = styled(Divider)`
  height: 100%;
`;

const StyledTokenInput = styled(Input.Password)`
  width: calc(100% - 120px);
  .ant-input-prefix {
    order: 1;
    margin-left: 4px;
    color: rgb(0, 0, 0, 0.45);
    :hover {
      color: rgba(0, 0, 0, 0.88);
    }
  }
  .ant-input-suffix {
    order: 2;
  }
`;

const StyledRegenerateTokenButton = styled(Button)`
  width: 115px;
  margin-left: 5px;
`;

export default MyIntegrationForm;
