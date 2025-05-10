import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import Alert from "app/components/atoms/Alert";

const meta = {
	title: "Example/Alert",
	component: Alert,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],

	args: {
		onClose: fn(),
	},
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = {
	args: {
		message: "This is an alert message",
		type: "success",
		showIcon: false,
		banner: false,
	},
};

export const SuccessWithDescription: Story = {
	args: {
		...Success.args,
		type: "success",
		description: "This is the description",
	},
};

export const SuccessWithIcon: Story = {
	args: {
		...Success.args,
		showIcon: true,
	},
};

export const ErrorWithNoDescription: Story = {
	args: {
		...Success.args,
		type: "error",
	},
};

export const ErrorWithDescription: Story = {
	args: {
		...SuccessWithDescription.args,
		type: "error",
	},
};

export const ErrorWithIcon: Story = {
	args: {
		...SuccessWithIcon.args,
		type: "error",
	},
};

export const Info: Story = {
	args: {
		...Success.args,
		type: "info",
	},
};

export const InfoWithDescription: Story = {
	args: {
		...SuccessWithDescription.args,
		type: "info",
	},
};

export const InfoWithIcon: Story = {
	args: {
		...SuccessWithIcon.args,
		type: "info",
	},
};

export const Warning: Story = {
	args: {
		...Success.args,
		type: "warning",
	},
};

export const WarningWithDescription: Story = {
	args: {
		...SuccessWithDescription.args,
		type: "warning",
	},
};

export const WarningWithIcon: Story = {
	args: {
		...SuccessWithIcon.args,
		type: "warning",
	},
};

export const AlertAsBanner: Story = {
	args: {
		...Success.args,
		banner: true,
	},
};
