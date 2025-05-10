import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import DatePicker from "app/components/atoms/DatePicker";

const meta = {
	title: "Example/DatePicker",
	component: DatePicker,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],

	args: { onChange: fn() },
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DateOrigin: Story = {
	args: {
		picker: "date",
	},
};
export const Month: Story = {
	args: {
		picker: "month",
	},
};
export const Quarter: Story = {
	args: {
		picker: "quarter",
	},
};
export const Year: Story = {
	args: {
		picker: "year",
	},
};
