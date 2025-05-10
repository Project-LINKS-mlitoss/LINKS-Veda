import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import Spin from "app/components/atoms/Spin";

const meta = {
	title: "Example/Spin",
	component: Spin,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],

	args: {},
} satisfies Meta<typeof Spin>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
	args: {},
};

export const Large: Story = {
	args: {
		size: "large",
	},
};
