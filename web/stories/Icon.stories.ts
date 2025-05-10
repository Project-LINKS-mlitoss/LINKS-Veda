import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import Icon from "app/components/atoms/Icon";

const meta = {
	title: "Example/Icon",
	component: Icon,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],

	args: { onClick: fn() },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
	args: {
		icon: "home",
	},
};
