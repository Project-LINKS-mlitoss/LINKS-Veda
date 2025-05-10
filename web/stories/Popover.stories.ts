import type { Meta, StoryObj } from "@storybook/react";
import Popover from "app/components/atoms/Popover";

const meta = {
	title: "Example/Popover",
	component: Popover,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],

	args: {},
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

//TODO: double check
// export const Basic: Story = {
// 	args: {

// 	},
// };
