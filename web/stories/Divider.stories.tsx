import type { Meta, StoryObj } from "@storybook/react";
import Divider from "app/components/atoms/Divider";

const meta: Meta<typeof Divider> = {
	title: "Example/Divider",
	component: Divider,
	parameters: {
		layout: "left",
	},
	tags: ["autodocs"],
} satisfies Meta<typeof Divider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
	args: {
		dashed: false,
		children: "Basic Divider",
	},
	render: (args) => (
		<div style={{ padding: 20 }}>
			<Divider {...args} />
		</div>
	),
};

export const Dashed: Story = {
	args: {
		dashed: true,
		children: "Dashed Divider",
	},
	render: (args) => (
		<div style={{ padding: 20 }}>
			<Divider {...args} />
		</div>
	),
};

export const WithText: Story = {
	args: {
		dashed: false,
		children: "Divider with Text",
	},
	render: (args) => (
		<div style={{ padding: 20 }}>
			<Divider {...args} orientation="left">
				Text Left
			</Divider>
			<Divider {...args} orientation="center">
				Text Center
			</Divider>
			<Divider {...args} orientation="right">
				Text Right
			</Divider>
		</div>
	),
};

export const Vertical: Story = {
	args: {
		dashed: false,
		children: "",
		type: "vertical",
	},
	render: (args) => (
		<div style={{ display: "flex", padding: 20, alignItems: "center" }}>
			<span>Item 1</span>
			<Divider {...args} />
			<span>Item 2</span>
		</div>
	),
};

export const LargeSize: Story = {
	args: {
		dashed: false,
		style: { fontSize: "24px", height: "3px" },
		children: "Large Divider",
	},
	render: (args) => (
		<div style={{ padding: 20 }}>
			<Divider {...args} />
		</div>
	),
};

export const SmallSize: Story = {
	args: {
		dashed: false,
		style: { fontSize: "12px", height: "1px" },
		children: "Small Divider",
	},
	render: (args) => (
		<div style={{ padding: 20 }}>
			<Divider {...args} />
		</div>
	),
};

export const CustomColor: Story = {
	args: {
		dashed: false,
		style: { borderColor: "#FF5733" },
		children: "Custom Color Divider",
	},
	render: (args) => (
		<div style={{ padding: 20 }}>
			<Divider {...args} />
		</div>
	),
};

export const NoText: Story = {
	args: {
		dashed: false,
		children: "",
	},
	render: (args) => (
		<div style={{ padding: 20 }}>
			<Divider {...args} />
		</div>
	),
};

export const LongText: Story = {
	args: {
		dashed: false,
		children:
			"Divider with a very long text to see how it handles overflow. This text should be long enough to test the wrapping behavior of the Divider.",
	},
	render: (args) => (
		<div style={{ padding: 20 }}>
			<Divider {...args} />
		</div>
	),
};
