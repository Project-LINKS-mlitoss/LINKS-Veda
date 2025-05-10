import styled from "@emotion/styled";
import { useCallback, useState } from "react";

import Button from "app/components/atoms/Button";
import Checkbox, {
	type CheckboxOptionType,
} from "app/components/atoms/Checkbox";
import Col from "app/components/atoms/Col";
import Divider from "app/components/atoms/Divider";
import Form, { type ValidateErrorEntity } from "app/components/atoms/Form";
import Icon from "app/components/atoms/Icon";
import Input from "app/components/atoms/Input";
import Row from "app/components/atoms/Row";
import type {
	WebhookTrigger,
	WebhookValues,
} from "app/components/molecules/MyIntegrations/types";
// import { validateURL } from "@reearth-cms/utils/regex";

interface Props {
	webhookInitialValues?: WebhookValues;
	loading: boolean;
	onBack: () => void;
	onWebhookCreate: (data: {
		name: string;
		url: string;
		active: boolean;
		trigger: WebhookTrigger;
		secret: string;
	}) => Promise<void>;
	onWebhookUpdate: (data: {
		webhookId: string;
		name: string;
		url: string;
		active: boolean;
		trigger: WebhookTrigger;
		secret?: string;
	}) => Promise<void>;
}

interface FormType {
	name: string;
	url: string;
	secret: string;
	trigger: string[];
}

const WebhookForm: React.FC<Props> = ({
	webhookInitialValues,
	loading,
	onBack,
	onWebhookCreate,
	onWebhookUpdate,
}) => {
	const [form] = Form.useForm<FormType>();
	const [isDisabled, setIsDisabled] = useState(true);

	const itemOptions: CheckboxOptionType[] = [
		{ label: "作成", value: "onItemCreate" },
		{ label: "更新", value: "onItemUpdate" },
		{ label: "削除", value: "onItemDelete" },
		{ label: "公開", value: "onItemPublish" },
		{ label: "非公開", value: "onItemUnPublish" },
	];

	const assetOptions: CheckboxOptionType[] = [
		{ label: "アップロード", value: "onAssetUpload" },
		{ label: "圧縮", value: "onAssetDecompress" },
		{ label: "削除", value: "onAssetDelete" },
	];

	const checkIfArrayEquals = useCallback(
		(ary1: unknown[], ary2: unknown[]) =>
			ary1.length === ary2.length &&
			ary1.every((value) => ary2.includes(value)),
		[],
	);

	const handleValuesChange = useCallback(
		async (_: unknown, values: FormType) => {
			const hasError = await form
				.validateFields()
				.then(() => false)
				.catch(
					(errorInfo: ValidateErrorEntity) => errorInfo.errorFields.length > 0,
				);
			if (!hasError && webhookInitialValues) {
				let isSame = true;
				for (const newValueKey in values) {
					const initialValue =
						webhookInitialValues?.[newValueKey as keyof FormType];
					const newValue = values[newValueKey as keyof FormType];
					if (Array.isArray(initialValue) && Array.isArray(newValue)) {
						if (!checkIfArrayEquals(initialValue, newValue)) {
							isSame = false;
							break;
						}
					} else if (initialValue !== newValue) {
						isSame = false;
						break;
					}
				}
				setIsDisabled(isSame);
			} else {
				setIsDisabled(hasError);
			}
		},
		[checkIfArrayEquals, form, webhookInitialValues],
	);

	const handleSubmit = useCallback(async () => {
		try {
			const values = await form.validateFields();
			const trigger: WebhookTrigger = (values.trigger ?? []).reduce(
				// biome-ignore lint/performance/noAccumulatingSpread: FIXME
				(ac, a) => ({ ...ac, [a]: true }),
				{},
			);
			const payload = {
				...values,
				active: false,
				trigger,
			};
			if (webhookInitialValues?.id) {
				await onWebhookUpdate({
					...payload,
					active: webhookInitialValues.active,
					webhookId: webhookInitialValues.id,
				});
				onBack?.();
			} else {
				await onWebhookCreate(payload);
				form.resetFields();
			}
		} catch (info) {
			console.log("Validate Failed:", info);
		}
	}, [form, onWebhookCreate, onWebhookUpdate, onBack, webhookInitialValues]);

	return (
		<>
			<Icon icon="arrowLeft" onClick={onBack} />
			<StyledForm
				form={form}
				layout="vertical"
				initialValues={webhookInitialValues}
				onValuesChange={handleValuesChange}
			>
				<Row gutter={32}>
					<Col span={11}>
						<Form.Item
							name="name"
							label="名前"
							extra="Webhookの名前です"
							rules={[
								{
									required: true,
									message: "Webhookの名前を入力してください",
								},
							]}
						>
							<Input />
						</Form.Item>
						<Form.Item
							name="url"
							label="URL"
							extra="WebhookのURLがhttp://で始まることを確認してください"
							rules={[
								{
									required: true,
									message: "無効なURLです",
									// validator: async (_, value) => {
									//   return validateURL(value) ? Promise.resolve() : Promise.reject();
									// },
								},
							]}
						>
							<Input />
						</Form.Item>
						<Form.Item
							name="secret"
							label="シークレット"
							extra="このシークレットはWebhookのリクエストを署名する時に使用されます。"
							rules={[
								{
									required: true,
									message: "シークレットを入力してください。",
								},
							]}
						>
							<Input />
						</Form.Item>
						<Form.Item>
							<Button
								type="primary"
								onClick={handleSubmit}
								disabled={isDisabled}
								loading={loading}
							>
								保存
							</Button>
						</Form.Item>
					</Col>
					<Col>
						<StyledDivider type="vertical" />
					</Col>
					<Col span={11}>
						<CheckboxTitle>イベント</CheckboxTitle>
						<Form.Item name="trigger">
							<StyledCheckboxGroup>
								<CheckboxLabel>アイテム</CheckboxLabel>
								<Row>
									{itemOptions.map((item, index) => (
										// biome-ignore lint/suspicious/noArrayIndexKey: FIXME
										<Col key={index}>
											<Checkbox value={item.value}>{item.label}</Checkbox>
										</Col>
									))}
								</Row>
								<CheckboxLabel>アセット</CheckboxLabel>
								<Row>
									{assetOptions.map((item, index) => (
										// biome-ignore lint/suspicious/noArrayIndexKey: FIXME
										<Col key={index}>
											<Checkbox value={item.value}>{item.label}</Checkbox>
										</Col>
									))}
								</Row>
							</StyledCheckboxGroup>
						</Form.Item>
					</Col>
				</Row>
			</StyledForm>
		</>
	);
};

const StyledCheckboxGroup = styled(Checkbox.Group)`
  display: block;
`;

const CheckboxLabel = styled.p`
  margin-top: 24px;
  margin-bottom: 8px;
  font-weight: 400;
  font-size: 14px;
  line-height: 22px;
  color: #000000d9;
`;

const StyledForm = styled(Form<FormType>)`
  margin-top: 36px;
`;

const CheckboxTitle = styled.h5`
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  color: #000000d9;
  margin-bottom: 24px;
`;

const StyledDivider = styled(Divider)`
  height: 100%;
`;

export default WebhookForm;
