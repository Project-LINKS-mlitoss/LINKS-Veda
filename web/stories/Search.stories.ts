import type { Meta, StoryObj } from "@storybook/react";
import Search from "app/components/atoms/Search";

const meta = {
	title: "Example/Search",
	component: Search,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],

	args: {},
} satisfies Meta<typeof Search>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
	args: {
		placeholder: "enter keyword",
		enterButton: "Search",
		size: "small",
	},
};

export const Large: Story = {
	args: {
		...Basic.args,
		size: "large",
	},
};

export const Loading: Story = {
	args: {
		...Basic.args,
		loading: true,
	},
};
