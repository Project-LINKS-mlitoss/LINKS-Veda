import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import Modal from "app/components/atoms/Modal";

const meta = {
	title: "Example/Modal",
	component: Modal,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],

	args: {
		open: true,
		onOk: fn(),
		onCancel: fn(),
	},
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
	args: {},
};
