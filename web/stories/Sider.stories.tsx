import type { Meta, StoryObj } from "@storybook/react";
import Sider from "app/components/atoms/Sider";

const meta: Meta<typeof Sider> = {
	title: "Example/Sider",
	component: Sider,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
	args: {},
} satisfies Meta<typeof Sider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
	args: {},
	render: (args) => (
		<Sider {...args} style={{ height: "200px", backgroundColor: "#f0f0f0" }}>
			<div>Basic Sider</div>
		</Sider>
	),
};

export const WithContent: Story = {
	args: {},
	render: (args) => (
		<Sider
			{...args}
			style={{ height: "200px", backgroundColor: "#ffffff", padding: "16px" }}
		>
			<div>
				<h2>Content Title</h2>
				<p>This is some content inside the Sider.</p>
			</div>
		</Sider>
	),
};

export const Fixed: Story = {
	args: {},
	render: (args) => (
		<div style={{ display: "flex", height: "200px" }}>
			<Sider
				{...args}
				style={{ width: "250px", backgroundColor: "#333", color: "#fff" }}
			>
				<div>
					<h3>Fixed Sider</h3>
					<p>This Sider is fixed and has a fixed width.</p>
				</div>
			</Sider>
			<div style={{ flex: 1, padding: "16px" }}>
				<p>Main content area.</p>
			</div>
		</div>
	),
};

export const CustomWidth: Story = {
	args: {},
	render: (args) => (
		<Sider {...args} style={{ width: "300px", backgroundColor: "#e0e0e0" }}>
			<div>
				<h2>Custom Width</h2>
				<p>This Sider has a custom width set to 300px.</p>
			</div>
		</Sider>
	),
};
