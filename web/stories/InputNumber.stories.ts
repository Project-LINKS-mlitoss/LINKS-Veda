import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import InputNumber from "app/components/atoms/InputNumber";

const meta = {
	title: "Example/InputNumber",
	component: InputNumber,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],

	args: { onChange: fn() },
} satisfies Meta<typeof InputNumber>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
	args: {
		min: 1,
		max: 10,
		defaultValue: 5,
	},
};
