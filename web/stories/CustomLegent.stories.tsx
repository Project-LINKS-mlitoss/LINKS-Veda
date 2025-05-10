import type { Meta, StoryObj } from "@storybook/react";
import "../app/tailwind.css";
import CustomLegend from "~/components/molecules/Chart/CustomLegend";

const meta = {
	title: "Example/CustomLegend",
	component: CustomLegend,
	decorators: [
		(Story) => (
			<div className="w-[200px]">
				<Story />
			</div>
		),
	],
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
} satisfies Meta<typeof CustomLegend>;

export default meta;

type Story = StoryObj<typeof meta>;
