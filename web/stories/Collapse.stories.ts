import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import Collapse from "app/components/atoms/Collapse";

const meta = {
	title: "Example/Collapse",
	component: Collapse,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],

	args: { onChange: fn() },
} satisfies Meta<typeof Collapse>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleData = [
	{ key: 1, label: "Pannel 1", children: "Content panel 1" },
	{ key: 2, label: "Pannel 2", children: "Content panel 2" },
];

export const Basic: Story = {
	args: {
		items: sampleData,
		size: "small",
		bordered: true,
	},
};

export const Large: Story = {
	args: {
		...Basic.args,
		size: "large",
	},
};

export const NoBorder: Story = {
	args: {
		...Basic.args,
		bordered: false,
	},
};
