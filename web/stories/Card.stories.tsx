import type { Meta, StoryObj } from "@storybook/react";
import Card from "app/components/atoms/Card";

const meta = {
	title: "Example/Card",
	component: Card,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],

	args: {},
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

const tabs = ["tab 1", "tab 2"];

export const Simple: Story = {
	args: {
		title: "Card title",
		bordered: true,
	},
	render: (args) => (
		<div style={{ height: "200px", display: "flex", flexDirection: "column" }}>
			<Card {...args} style={{ width: 300 }}>
				<p>Card content 1</p>
				<p>Card content 2</p>
				<p>Card content 3</p>
			</Card>
		</div>
	),
};

export const NoBorder: Story = {
	args: {
		...Simple.args,
		bordered: false,
	},
	render: (args) => (
		<div style={{ height: "200px", display: "flex", flexDirection: "column" }}>
			<Card {...args} style={{ width: 300 }}>
				<p>Card content 1</p>
				<p>Card content 2</p>
				<p>Card content 3</p>
			</Card>
		</div>
	),
};
