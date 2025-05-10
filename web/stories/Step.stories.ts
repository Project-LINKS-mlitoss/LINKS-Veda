import type { Meta, StoryObj } from "@storybook/react";
import Step from "app/components/atoms/Step";

const meta = {
	title: "Example/Step",
	component: Step,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],

	args: {},
} satisfies Meta<typeof Step>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleData = [
	{ title: "Step 1", description: "" },
	{ title: "Step 2", description: "" },
];

export const Basic: Story = {
	args: {
		current: 1,
		items: sampleData,
	},
};
