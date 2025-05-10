import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import Checkbox from "app/components/atoms/Checkbox";

const meta = {
	title: "Example/Checkbox",
	component: Checkbox,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],

	args: { onChange: fn() },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
	args: {
		disabled: false,
	},
	render: (args) => (
		<div style={{ height: "200px", display: "flex", flexDirection: "column" }}>
			<Checkbox {...args}>My checkbox</Checkbox>
		</div>
	),
};

export const Disabled: Story = {
	args: {
		disabled: true,
	},
	render: (args) => (
		<div style={{ height: "200px", display: "flex", flexDirection: "column" }}>
			<Checkbox {...args}>My checkbox</Checkbox>
		</div>
	),
};
