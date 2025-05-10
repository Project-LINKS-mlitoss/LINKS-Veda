import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import AutoComplete from "app/components/atoms/AutoComplete";

const meta = {
	title: "Example/AutoComplete",
	component: AutoComplete,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],

	args: { onSelect: fn(), onSearch: fn(), onClear: fn() },
} satisfies Meta<typeof AutoComplete>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleOptions = [{ value: "abc" }, { value: "aaa" }, { value: "ccc" }];

export const Basic: Story = {
	args: {
		style: { width: 200 },
		options: sampleOptions,
		onSelect: fn(),
		defaultValue: "",
		placeholder: "input something",
		variant: "outlined",
		allowClear: false,
		status: "",
		defaultOpen: false,
	},
};

export const Filled: Story = {
	args: {
		...Basic.args,
		variant: "filled",
	},
};

export const Borderless: Story = {
	args: {
		...Basic.args,
		variant: "borderless",
	},
};

export const AllowClear: Story = {
	args: {
		...Basic.args,
		allowClear: true,
	},
};

export const StatusError: Story = {
	args: {
		...Basic.args,
		status: "error",
	},
};

export const StatusWarning: Story = {
	args: {
		...Basic.args,
		status: "warning",
	},
};

export const DefaultOpen: Story = {
	args: {
		...Basic.args,
		defaultOpen: true,
	},
};

export const DefaultValue: Story = {
	args: {
		...Basic.args,
		defaultValue: "hello world",
	},
};
