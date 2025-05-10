import type { Meta, StoryObj } from "@storybook/react";

import LineChart from "app/components/molecules/Chart/LineChart";

const meta = {
	title: "Charts/LineChart",
	component: LineChart,
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
} satisfies Meta<typeof LineChart>;

export default meta;
type Story = StoryObj<typeof LineChart>;

const sampleData = [
	{ month: "Jan", salesNumeric: 30, revenueNumeric: 40, profitNumeric: 20 },
	{ month: "Feb", salesNumeric: 45, revenueNumeric: 55, profitNumeric: 25 },
	{ month: "Mar", salesNumeric: 35, revenueNumeric: 45, profitNumeric: 22 },
	{ month: "Apr", salesNumeric: 50, revenueNumeric: 60, profitNumeric: 30 },
	{ month: "May", salesNumeric: 40, revenueNumeric: 50, profitNumeric: 24 },
];

const mappedData = [
	{ month: "Jan", statusNumeric: 1, priorityNumeric: 2 },
	{ month: "Feb", statusNumeric: 2, priorityNumeric: 1 },
	{ month: "Mar", statusNumeric: 3, priorityNumeric: 3 },
	{ month: "Apr", statusNumeric: 1, priorityNumeric: 2 },
	{ month: "May", statusNumeric: 2, priorityNumeric: 1 },
];

const mappings = {
	status: {
		mapping: { Low: 1, Medium: 2, High: 3 },
		reverseMapping: { 1: "Low", 2: "Medium", 3: "High" },
	},
	priority: {
		mapping: { P1: 1, P2: 2, P3: 3 },
		reverseMapping: { 1: "P1", 2: "P2", 3: "P3" },
	},
};

export const Default: Story = {
	args: {
		data: sampleData,
		xAxis: "month",
		yAxes: "sales",
		isDot: true,
		showLegend: true,
	},
};

export const WithoutDots: Story = {
	args: {
		...Default.args,
		isDot: false,
	},
};

export const WithoutLegend: Story = {
	args: {
		...Default.args,
		showLegend: false,
	},
};

export const SingleLine: Story = {
	args: {
		data: sampleData,
		xAxis: "month",
		yAxes: "sales",
		isDot: true,
		showLegend: true,
	},
};

export const WithMappings: Story = {
	args: {
		data: mappedData,
		xAxis: "month",
		yAxes: "status",
		isDot: true,
		showLegend: true,
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
	salesNumeric: Math.floor(Math.random() * 100),
	revenueNumeric: Math.floor(Math.random() * 150),
	profitNumeric: Math.floor(Math.random() * 50),
}));

export const LargeDataset: Story = {
	args: {
		data: largeDataset,
		xAxis: "month",
		yAxes: "profit",
		isDot: true,
		showLegend: true,
	},
};
