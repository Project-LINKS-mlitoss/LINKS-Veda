import type { Meta, StoryObj } from "@storybook/react";
import CustomLegend from "app/components/molecules/Chart/CustomLegend";

const meta = {
	title: "Charts/CustomLegend",
	component: CustomLegend,
	parameters: {
		layout: "centered",
	},
	decorators: [
		(Story) => (
			<div
				style={{
					width: "200px",
					background: "white",
					padding: "10px",
					boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
				}}
			>
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof CustomLegend>;

export default meta;
type Story = StoryObj<typeof CustomLegend>;

const pieData = [
	{
		fields: [
			{ key: "curry", value: "3" },
			{ key: "don", value: "1" },
		],
	},
];

const lineData = [
	{
		fields: [
			{ key: "salesNumeric", value: "40" },
			{ key: "revenueNumeric", value: "50" },
			{ key: "profitNumeric", value: "24.3" },
		],
	},
];

export const PieChartLegend: Story = {
	args: {
		data: pieData,
		chart: {
			type: "pie",
			xAxis: "fields",
			yAxis: "fields",
		},
		showAverage: true,
	},
};

export const LineChartLegend: Story = {
	args: {
		data: lineData,
		chart: {
			type: "line",
			xAxis: "fields",
			yAxis: "fields",
		},
		showAverage: true,
		unit: "K",
	},
};
