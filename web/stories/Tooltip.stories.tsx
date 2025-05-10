import type { Meta, StoryObj } from "@storybook/react";
import Tooltip from "app/components/atoms/Tooltip";

const meta: Meta<typeof Tooltip> = {
	title: "Example/Tooltip",
	component: Tooltip,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
	args: {},
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
	args: {
		title: "Prompt text",
	},
	render: (args) => (
		<Tooltip {...args}>
			<span>Hover me</span>
		</Tooltip>
	),
};

export const CustomPosition: Story = {
	args: {
		title: "Tooltip at the top",
		placement: "top",
	},
	render: (args) => (
		<Tooltip {...args}>
			<span>Hover me</span>
		</Tooltip>
	),
};

export const CustomColor: Story = {
	args: {
		title: "Custom color tooltip",
		color: "#f50",
	},
	render: (args) => (
		<Tooltip {...args}>
			<span>Hover me</span>
		</Tooltip>
	),
};
