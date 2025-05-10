import type { Meta, StoryObj } from "@storybook/react";
import CustomTag from "app/components/atoms/CustomTag";

const meta = {
	title: "Example/CustomTag",
	component: CustomTag,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],

	args: {},
} satisfies Meta<typeof CustomTag>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
	args: {
		value: "tag",
		color: "red",
	},
};
