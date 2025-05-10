import type { Meta, StoryObj } from "@storybook/react";

import PieChart from "app/components/molecules/Chart/PieChart";

const meta = {
	title: "Charts/PieChart",
	component: PieChart,
	parameters: {
		layout: "centered",
	},
	decorators: [
		(Story) => (
			<div style={{ width: "500px", height: "500px" }}>
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof PieChart>;

export default meta;
type Story = StoryObj<typeof PieChart>;

// biome-ignore lint/suspicious/noExplicitAny: FIXME
const transformData = (rawData: any[]) => {
	return rawData.map((item) => ({
		name: item.name,
		value: item.value,
		color: item.color,
	}));
};

const sampleData = [
	{ name: "Category A", value: 30, color: "rgba(0, 50, 254, 1)" },
	{ name: "Category B", value: 25, color: "rgba(0, 50, 254, 0.8)" },
	{ name: "Category C", value: 20, color: "rgba(0, 50, 254, 0.6)" },
	{ name: "Category D", value: 15, color: "rgba(0, 50, 254, 0.4)" },
	{ name: "Category E", value: 10, color: "rgba(0, 50, 254, 0.2)" },
];

export const Default: Story = {
	args: {
		data: sampleData,
		selectedKey: "value",
		width: 400,
		height: 400,
		innerRadius: 60,
		outerRadius: 80,
	},
};

export const LargerGaps: Story = {
	args: {
		...Default.args,
		data: transformData([
			{ name: "Group 1", value: 35, color: "rgba(0, 50, 254, 1)" },
			{ name: "Group 2", value: 30, color: "rgba(0, 50, 254, 0.8)" },
			{ name: "Group 3", value: 25, color: "rgba(0, 50, 254, 0.6)" },
		]),
	},
};

export const NoInnerRadius: Story = {
	args: {
		...Default.args,
		innerRadius: 0,
	},
};

export const CustomSized: Story = {
	args: {
		...Default.args,
		width: 600,
		height: 300,
		outerRadius: 100,
	},
};
