import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import Select from "app/components/atoms/Select";

const meta: Meta<typeof Select> = {
	title: "Example/Select",
	component: Select,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
	args: { onChange: fn() },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
	args: {
		options: [
			{ label: "Option 1", value: "option1" },
			{ label: "Option 2", value: "option2" },
			{ label: "Option 3", value: "option3" },
		],
		placeholder: "Select an option",
		style: { width: "200px" },
	},
};

export const Disabled: Story = {
	args: {
		options: [
			{ label: "Option 1", value: "option1" },
			{ label: "Option 2", value: "option2" },
			{ label: "Option 3", value: "option3" },
		],
		placeholder: "Select an option",
		disabled: true,
		style: { width: "200px" },
	},
};

export const WithDefaultValue: Story = {
	args: {
		options: [
			{ label: "Option 1", value: "option1" },
			{ label: "Option 2", value: "option2" },
			{ label: "Option 3", value: "option3" },
		],
		placeholder: "Select an option",
		defaultValue: "option2",
		style: { width: "200px" },
	},
};

export const WithCustomOptions: Story = {
	args: {
		options: [
			{ label: "Custom Option 1", value: "custom1" },
			{ label: "Custom Option 2", value: "custom2" },
			{ label: "Custom Option 3", value: "custom3" },
		],
		placeholder: "Select a custom option",
		style: { width: "250px", borderColor: "#d9d9d9" },
	},
};

export const MultipleSelect: Story = {
	args: {
		options: [
			{ label: "Option 1", value: "option1" },
			{ label: "Option 2", value: "option2" },
			{ label: "Option 3", value: "option3" },
			{ label: "Option 4", value: "option4" },
		],
		placeholder: "Select multiple options",
		mode: "multiple",
		style: { width: "300px" },
	},
};
