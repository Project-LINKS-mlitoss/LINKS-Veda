import type { Meta, StoryObj } from "@storybook/react";
import { Button, Menu, Space } from "antd";
import Dropdown from "app/components/atoms/Dropdown";

const meta: Meta<typeof Dropdown> = {
	title: "Example/Dropdown",
	component: Dropdown,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
	args: {},
} satisfies Meta<typeof Dropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

const menu = (
	<Menu>
		<Menu.Item key="1">
			<a
				target="_blank"
				rel="noopener noreferrer"
				href="https://www.antgroup.com"
			>
				1st menu item
			</a>
		</Menu.Item>
		<Menu.Item key="2" disabled>
			<a
				target="_blank"
				rel="noopener noreferrer"
				href="https://www.aliyun.com"
			>
				2nd menu item (disabled)
			</a>
		</Menu.Item>
		<Menu.Item key="3" disabled>
			<a
				target="_blank"
				rel="noopener noreferrer"
				href="https://www.luohanacademy.com"
			>
				3rd menu item (disabled)
			</a>
		</Menu.Item>
		<Menu.Item key="4" danger>
			a danger item
		</Menu.Item>
	</Menu>
);

export const Basic: Story = {
	args: {
		overlay: menu,
		trigger: ["hover"],
	},
	render: (args) => (
		<Dropdown {...args}>
			<button type="button" onClick={(e) => e.preventDefault()}>
				<Space>Hover me</Space>
			</button>
		</Dropdown>
	),
};

export const MultipleTriggers: Story = {
	args: {
		overlay: menu,
		trigger: ["click", "hover"],
	},
	render: (args) => (
		<Dropdown {...args}>
			<Button>Click or Hover me</Button>
		</Dropdown>
	),
};

export const CustomTitle: Story = {
	args: {
		overlay: menu,
		trigger: ["click"],
	},
	render: (args) => (
		<Dropdown {...args}>
			<button type="button" onClick={(e) => e.preventDefault()}>
				<Space>Click me for dropdown</Space>
			</button>
		</Dropdown>
	),
};

export const CustomMenu: Story = {
	args: {
		overlay: (
			<Menu>
				<Menu.Item key="1">Custom Item 1</Menu.Item>
				<Menu.Item key="2">Custom Item 2</Menu.Item>
				<Menu.Item key="3">Custom Item 3</Menu.Item>
			</Menu>
		),
		trigger: ["click"],
	},
	render: (args) => (
		<Dropdown {...args}>
			<Button>Custom Menu</Button>
		</Dropdown>
	),
};
