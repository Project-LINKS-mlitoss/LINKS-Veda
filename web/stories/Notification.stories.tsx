import type { Meta, StoryObj } from "@storybook/react";
import { Button, Space } from "antd";
import notification from "app/components/atoms/Notification";

type NotificationType = "success" | "info" | "warning" | "error";

const meta: Meta = {
	title: "Example/Notification",
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
	args: {},
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
	args: {
		placement: "topRight",
	},
	render: (args) => {
		const [api, contextHolder] = notification.useNotification();

		const openNotificationWithIcon = (type: NotificationType) => {
			api[type]({
				message: "Notification Title",
				description:
					"This is the content of the notification. This is the content of the notification. This is the content of the notification.",
				placement: args?.placement,
			});
		};

		return (
			<>
				{contextHolder}
				<Space>
					<Button onClick={() => openNotificationWithIcon("success")}>
						Success
					</Button>
					<Button onClick={() => openNotificationWithIcon("info")}>Info</Button>
					<Button onClick={() => openNotificationWithIcon("warning")}>
						Warning
					</Button>
					<Button onClick={() => openNotificationWithIcon("error")}>
						Error
					</Button>
				</Space>
			</>
		);
	},
};
