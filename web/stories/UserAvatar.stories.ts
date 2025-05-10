import type { Meta, StoryObj } from "@storybook/react";
import UserAvatar from "app/components/atoms/UserAvatar";

const meta = {
	title: "Example/UserAvatar",
	component: UserAvatar,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],

	args: {},
} satisfies Meta<typeof UserAvatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
	args: {
		username: "My Username",
		shadow: true,
		anonymous: false,
	},
};
