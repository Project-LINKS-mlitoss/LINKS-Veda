import type { Meta, StoryObj } from "@storybook/react";
import InnerContents from "app/components/atoms/InnerContents/ContentSection";

const meta = {
	title: "Example/InnerContents",
	component: InnerContents,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],

	args: {},
} satisfies Meta<typeof InnerContents>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
	args: {
		title: "This is the title of inner content",
		description: "this is the description",
		danger: false,
	},
};

export const Danger: Story = {
	args: {
		...Basic.args,
		danger: true,
	},
};
