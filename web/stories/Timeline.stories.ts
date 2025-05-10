import type { Meta, StoryObj } from "@storybook/react";
import Timeline from "app/components/atoms/Timeline";

const meta = {
	title: "Example/Timeline",
	component: Timeline,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],

	args: {},
} satisfies Meta<typeof Timeline>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampelData = [
	{ children: "2010-2013" },
	{ children: "2014-2019" },
	{ children: "2020-2024" },
];

export const Basic: Story = {
	args: {
		items: sampelData,
	},
};
