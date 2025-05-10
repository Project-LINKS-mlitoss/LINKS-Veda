import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import UnderlineButton from "app/components/atoms/UnderlineButton";

const meta = {
	title: "Example/UnderlineButton",
	component: UnderlineButton,
	parameters: {},
	tags: [],

	args: { onClick: fn() },
} satisfies Meta<typeof UnderlineButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
	args: {
		title: "button",
		children: "PRESS ME",
	},
};
