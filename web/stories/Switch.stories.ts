import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import Switch from "app/components/atoms/Switch";

const meta = {
	title: "Example/Switch",
	component: Switch,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],

	args: { onChange: fn() },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
	args: {
		defaultChecked: true,
	},
};

export const Small: Story = {
	args: {
		...Basic.args,
		size: "small",
	},
};
