import Alert from "app/components/atoms/Alert";
import Button from "app/components/atoms/Button";
import Form from "app/components/atoms/Form";
import Input from "app/components/atoms/Input";

export interface ResetPasswordComponentProps {
	success: boolean | undefined;
	message: string | undefined;
	requestResetPassword: (values: FormData) => void;
}

type FieldType = {
	email?: string;
};

const ResetPasswordComponent: React.FC<ResetPasswordComponentProps> = ({
	success,
	message,
	requestResetPassword,
}) => {
	let alertType: "success" | "error" | "info" | "warning" | undefined =
		undefined;
	if (success !== undefined && success === true) {
		alertType = "success";
	} else if (success !== undefined) {
		alertType = "error";
	} else {
		alertType = undefined;
	}

	return (
		<>
			<div className="font-sans p-4">
				{message && <Alert message={message} type={alertType} />}
				<br />
				<Form
					name="basic"
					labelCol={{ span: 8 }}
					wrapperCol={{ span: 16 }}
					style={{ maxWidth: 600 }}
					onFinish={requestResetPassword}
					autoComplete="off"
					method="post"
				>
					<Form.Item<FieldType>
						label="Email"
						name="email"
						rules={[{ required: true, message: "Please input your email!" }]}
					>
						<Input />
					</Form.Item>

					<Form.Item wrapperCol={{ offset: 8, span: 16 }}>
						<Button type="primary" htmlType="submit">
							Submit
						</Button>
					</Form.Item>
				</Form>
			</div>
		</>
	);
};

export default ResetPasswordComponent;
