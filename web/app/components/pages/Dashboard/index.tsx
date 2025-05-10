import Alert from "app/components/atoms/Alert";
import Button from "app/components/atoms/Button";
import Form from "app/components/atoms/Form";

export interface DashboardComponentProps {
	success: boolean | undefined;
	message: string | undefined;
	signOut: (values: FormData) => void;
}

const DashboardComponent: React.FC<DashboardComponentProps> = ({
	success,
	message,
	signOut,
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
				<p>This is the example dashboard page</p>
				<br />
				<Form
					name="basic"
					labelCol={{ span: 8 }}
					wrapperCol={{ span: 16 }}
					style={{ maxWidth: 600 }}
					onFinish={signOut}
					autoComplete="off"
					method="post"
				>
					<Form.Item wrapperCol={{ offset: 8, span: 16 }}>
						<Button type="primary" htmlType="submit">
							Sign Out
						</Button>
					</Form.Item>
				</Form>
			</div>
		</>
	);
};

export default DashboardComponent;
