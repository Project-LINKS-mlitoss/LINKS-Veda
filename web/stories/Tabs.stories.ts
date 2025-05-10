import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import Tabs from "app/components/atoms/Tabs";

const meta = {
	title: "Example/Tabs",
	component: Tabs,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],

	args: { onChange: fn() },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleData = [
	{ key: "1", label: "Tab 1", children: "This is tab 1" },
	{ key: "2", label: "Tab 2", children: "This is tab 2" },
];

const sampleDataDisabled = [
	{ key: "1", label: "Tab 1", children: "This is tab 1" },
	{ key: "2", label: "Tab 2", children: "This is tab 2", disabled: true },
];

export const Basic: Story = {
	args: {
		defaultActiveKey: "1",
		items: sampleData,
	},
};

export const Disabled: Story = {
	args: {
		defaultActiveKey: "1",
		items: sampleDataDisabled,
	},
};
