import type { Meta, StoryObj } from "@storybook/react";
import { Button, Typography } from "antd";
import ConfigProvider from "antd/lib/config-provider";

const { Title } = Typography;

const meta: Meta<typeof ConfigProvider> = {
	title: "Example/ConfigProvider",
	component: ConfigProvider,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
} satisfies Meta<typeof ConfigProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
	args: {
		componentSize: "small",
		theme: {
			token: {
				colorPrimary: "#1DA57A",
				colorText: "#000000",
			},
		},
	},
	render: (args) => (
		<ConfigProvider {...args}>
			<div style={{ padding: 20 }}>
				<Title level={3}>Basic Configuration</Title>
				<Button>Primary Button</Button>
			</div>
		</ConfigProvider>
	),
};

export const CustomTheme: Story = {
	args: {
		theme: {
			token: {
				colorPrimary: "#FF5733",
				colorText: "#FFFFFF",
			},
		},
	},
	render: (args) => (
		<ConfigProvider {...args}>
			<div style={{ padding: 20, backgroundColor: "#333" }}>
				<Title level={3} style={{ color: "#FFFFFF" }}>
					Custom Theme
				</Title>
				<Button>Primary Button</Button>
			</div>
		</ConfigProvider>
	),
};

export const ComponentSize: Story = {
	args: {
		componentSize: "large",
	},
	render: (args) => (
		<ConfigProvider {...args}>
			<div style={{ padding: 20 }}>
				<Title level={3}>Large Component Size</Title>
				<Button>Large Button</Button>
			</div>
		</ConfigProvider>
	),
};
