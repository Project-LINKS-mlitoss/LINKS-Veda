import type { Meta, StoryObj } from "@storybook/react";
import Input from "app/components/atoms/Input";

const meta = {
	title: "Example/Input",
	component: Input,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],

	args: {},
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
	args: {
		placeholder: "type something",
	},
};

export const Filled: Story = {
	args: {
		...Basic.args,
		variant: "filled",
	},
};

export const NoBorder: Story = {
	args: {
		...Basic.args,
		variant: "borderless",
	},
};
