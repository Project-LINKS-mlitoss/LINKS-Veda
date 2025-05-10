import type { Meta, StoryObj } from "@storybook/react";

import BarChart from "app/components/molecules/Chart/BarChart";

const meta = {
	title: "Charts/BarChart",
	component: BarChart,
	parameters: {
		layout: "centered",
	},
	decorators: [
		(Story) => (
			<div style={{ width: "800px", height: "400px" }}>
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof BarChart>;

export default meta;
type Story = StoryObj<typeof BarChart>;

const sampleData = [
	{ month: "Jan", sales: 30, revenue: 40, profit: 20 },
	{ month: "Feb", sales: 45, revenue: 55, profit: 25 },
	{ month: "Mar", sales: 35, revenue: 45, profit: 22 },
	{ month: "Apr", sales: 50, revenue: 60, profit: 30 },
	{ month: "May", sales: 40, revenue: 50, profit: 24 },
];

export const Default: Story = {
	args: {
		//@ts-ignore
		data: sampleData,
		xValue: "month",
		yValues: "revenue",
		height: 300,
	},
};

export const SingleBar: Story = {
	args: {
		//@ts-ignore
		data: sampleData,
		xValue: "month",
		yValues: "sales",
		height: 300,
	},
};

export const CustomHeight: Story = {
	args: {
		...Default.args,
		height: 500,
	},
};

export const CustomMargins: Story = {
	args: {
		...Default.args,
		margins: { top: 20, right: 30, left: 20, bottom: 5 },
	},
};

export const CustomBarConfig: Story = {
	args: {
		...Default.args,
		barConfig: {
			barSize: 10,
			barGap: 10,
			barCategoryGap: 10,
		},
	},
};

export const CustomAxisStyle: Story = {
	args: {
		...Default.args,
		xAxisTickStyle: {
			fontSize: 14,
			fill: "#666",
		},
		yAxisTickStyle: {
			fontSize: 12,
			fill: "#888",
		},
	},
};

export const NoAxes: Story = {
	args: {
		...Default.args,
		showXAxis: false,
		showYAxis: false,
	},
};

const largeDataset = Array.from({ length: 12 }, (_, i) => ({
	month: [
		"Jan",
		"Feb",
		"Mar",
		"Apr",
		"May",
		"Jun",
		"Jul",
		"Aug",
		"Sep",
		"Oct",
		"Nov",
		"Dec",
	][i],
	sales: Math.floor(Math.random() * 100),
	revenue: Math.floor(Math.random() * 150),
	profit: Math.floor(Math.random() * 50),
}));

export const LargeDataset: Story = {
	args: {
		//@ts-ignore
		data: largeDataset,
		xValue: "month",
		yValues: "profit",
		height: 400,
	},
};
