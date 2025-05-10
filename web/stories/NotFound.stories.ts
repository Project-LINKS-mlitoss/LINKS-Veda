import type { Meta, StoryObj } from "@storybook/react";
import NotFound from "app/components/atoms/NotFound";

const meta = {
	title: "Example/NotFound",
	component: NotFound,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],

	args: {},
} satisfies Meta<typeof NotFound>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
	args: {},
};
