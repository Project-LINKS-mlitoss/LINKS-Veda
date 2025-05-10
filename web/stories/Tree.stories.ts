import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import Tree from "app/components/atoms/Tree";

const meta = {
	title: "Example/Tree",
	component: Tree,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],

	args: { onSelect: fn(), onCheck: fn() },
} satisfies Meta<typeof Tree>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampeData = [
	{
		title: "item 1.0",
		key: "1.0",
		children: [
			{ title: "item 1.1", key: "1.1" },
			{ title: "item 1.2", key: "1.2" },
		],
	},
];

export const Basic: Story = {
	args: {
		checkable: true,
		treeData: sampeData,
	},
};
