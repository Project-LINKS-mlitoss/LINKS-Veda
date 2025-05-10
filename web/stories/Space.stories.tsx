import type { Meta, StoryObj } from "@storybook/react";
import Space from "app/components/atoms/Space";

const meta: Meta<typeof Space> = {
	title: "Example/Space",
	component: Space,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
	args: {},
} satisfies Meta<typeof Space>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
	args: {
		size: "middle",
	},
	render: (args) => (
		<Space {...args}>
			<div style={{ backgroundColor: "#f0f0f0", padding: "8px" }}>Item 1</div>
			<div style={{ backgroundColor: "#d0d0d0", padding: "8px" }}>Item 2</div>
			<div style={{ backgroundColor: "#b0b0b0", padding: "8px" }}>Item 3</div>
		</Space>
	),
};

export const DifferentSizes: Story = {
	args: {
		size: "large",
	},
	render: (args) => (
		<Space {...args}>
			<div style={{ backgroundColor: "#f0f0f0", padding: "8px" }}>Item 1</div>
			<div style={{ backgroundColor: "#d0d0d0", padding: "8px" }}>Item 2</div>
			<div style={{ backgroundColor: "#b0b0b0", padding: "8px" }}>Item 3</div>
		</Space>
	),
};

export const InlineSpace: Story = {
	args: {
		direction: "horizontal",
		size: "small",
	},
	render: (args) => (
		<Space {...args}>
			<div style={{ backgroundColor: "#f0f0f0", padding: "8px" }}>Item A</div>
			<div style={{ backgroundColor: "#d0d0d0", padding: "8px" }}>Item B</div>
			<div style={{ backgroundColor: "#b0b0b0", padding: "8px" }}>Item C</div>
		</Space>
	),
};

export const VerticalSpace: Story = {
	args: {
		direction: "vertical",
		size: "middle",
	},
	render: (args) => (
		<Space {...args}>
			<div style={{ backgroundColor: "#f0f0f0", padding: "8px" }}>Item 1</div>
			<div style={{ backgroundColor: "#d0d0d0", padding: "8px" }}>Item 2</div>
			<div style={{ backgroundColor: "#b0b0b0", padding: "8px" }}>Item 3</div>
		</Space>
	),
};
