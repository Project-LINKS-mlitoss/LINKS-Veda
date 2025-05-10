import type { Meta, StoryObj } from "@storybook/react";
import PageHeader from "app/components/atoms/PageHeader";

const meta = {
	title: "Example/PageHeader",
	component: PageHeader,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],

	args: {},
} satisfies Meta<typeof PageHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

//TODO: double check
// export const Basic: Story = {
// 	args: {
// 	},
// };
