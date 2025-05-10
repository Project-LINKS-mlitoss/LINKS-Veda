import type { Meta, StoryObj } from "@storybook/react";
import Badge from "app/components/atoms/Badge";

const meta = {
	title: "Example/Badge",
	component: Badge,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],

	args: {},
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		count: 499,
		size: "default",
		overflowCount: 99,
	},
};

export const Small: Story = {
	args: {
		...Default.args,
		size: "small",
	},
};

export const OverflowCount: Story = {
	args: {
		...Default.args,
		overflowCount: 500,
	},
};
