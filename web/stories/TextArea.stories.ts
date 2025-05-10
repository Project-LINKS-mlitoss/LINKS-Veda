import type { Meta, StoryObj } from "@storybook/react";
import TextArea from "app/components/atoms/TextArea";

const meta: Meta<typeof TextArea> = {
	title: "Example/TextArea",
	component: TextArea,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
	args: {},
} satisfies Meta<typeof TextArea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
	args: {
		autoSize: true,
		rows: 4,
	},
};

export const DefaultValue: Story = {
	args: {
		value: "This is a default value",
		autoSize: true,
		rows: 4,
	},
};

export const Editable: Story = {
	args: {
		defaultValue: "You can edit this text.",
		autoSize: true,
		placeholder: "Type something here...",
		rows: 4,
	},
};

export const ErrorState: Story = {
	args: {
		defaultValue: "There is an error with this field.",
		autoSize: true,
		placeholder: "Enter text here...",
		status: "error",
		rows: 4,
	},
};
