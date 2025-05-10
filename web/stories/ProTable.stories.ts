import type { Meta, StoryObj } from "@storybook/react";
import ProTable from "app/components/atoms/ProTable";

const meta = {
	title: "Example/ProTable",
	component: ProTable,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],

	args: {},
} satisfies Meta<typeof ProTable>;

export default meta;
type Story = StoryObj<typeof meta>;

//TODO: double check
// export const Basic: Story = {
// 	args: {

// 	},
// };
