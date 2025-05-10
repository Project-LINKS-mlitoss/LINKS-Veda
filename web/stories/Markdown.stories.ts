import type { Meta, StoryObj } from "@storybook/react";
import Markdown from "app/components/atoms/Markdown";

const meta = {
	title: "Example/Markdown",
	component: Markdown,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],

	args: {},
} satisfies Meta<typeof Markdown>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
	args: {
		value: "This is an sample markdown",
	},
};
