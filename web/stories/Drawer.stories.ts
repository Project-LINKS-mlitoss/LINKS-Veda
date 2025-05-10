import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import Drawer from "app/components/atoms/Drawer";

const meta = {
	title: "Example/Drawer",
	component: Drawer,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],

	args: { onClose: fn() },
} satisfies Meta<typeof Drawer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
	args: {},
};
