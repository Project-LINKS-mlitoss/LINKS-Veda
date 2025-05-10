import type { Meta, StoryObj } from "@storybook/react";
import Radio from "app/components/atoms/Radio";

const meta = {
	title: "Example/Radio",
	component: Radio,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],

	args: {},
} satisfies Meta<typeof Radio>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
	args: {
		value: "1",
	},
	render: (args) => (
		<div style={{ height: "200px", display: "flex", flexDirection: "column" }}>
			<Radio {...args}>Option 1</Radio>
		</div>
	),
};

export const Disabled: Story = {
	args: {
		disabled: true,
	},
	render: (args) => (
		<div style={{ height: "200px", display: "flex", flexDirection: "column" }}>
			<Radio {...args}>Option 1</Radio>
		</div>
	),
};

export const Group: Story = {
	args: {
		disabled: false,
	},
	render: (args) => (
		<div style={{ height: "200px", display: "flex", flexDirection: "column" }}>
			<Radio.Group>
				<Radio {...args}>Option 1</Radio>
				<Radio {...args} value="2">
					Option 2
				</Radio>
				<Radio {...args} value="3">
					Option 2
				</Radio>
			</Radio.Group>
		</div>
	),
};
