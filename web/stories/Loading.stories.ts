import type { Meta, StoryObj } from "@storybook/react";
import Loading from "app/components/atoms/Loading";

const meta = {
	title: "Example/Loading",
	component: Loading,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],

	args: {},
} satisfies Meta<typeof Loading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
	args: {
		spinnerSize: "default",
	},
};

export const Small: Story = {
	args: {
		spinnerSize: "small",
	},
};

export const Large: Story = {
	args: {
		spinnerSize: "large",
	},
};
