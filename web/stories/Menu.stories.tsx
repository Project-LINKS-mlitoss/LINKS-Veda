import type { Meta, StoryObj } from "@storybook/react";
import { type MenuTheme, Switch } from "antd";
import Menu from "app/components/atoms/Menu";
import { useState } from "react";

const meta: Meta<typeof Menu> = {
	title: "Example/Menu",
	component: Menu,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
} satisfies Meta<typeof Menu>;

export default meta;
type Story = StoryObj<typeof meta>;

const topMenuSampleData = [
	{ label: "Home", key: "home" },
	{ label: "News", key: "news" },
	{ label: "Contact", key: "contact" },
];

export const LightModeMenu: Story = {
	args: {
		items: topMenuSampleData,
	},
	render: (args) => (
		<div
			style={{
				backgroundColor: "#ffffff",
				padding: "16px",
				borderRadius: "8px",
			}}
		>
			<Menu
				{...args}
				style={{ backgroundColor: "#ffffff", color: "#000000" }}
			/>
		</div>
	),
};

export const DarkModeMenu: Story = {
	args: {
		items: topMenuSampleData,
	},
	render: (args) => (
		<div
			style={{
				backgroundColor: "#333333",
				padding: "16px",
				borderRadius: "8px",
			}}
		>
			<Menu
				{...args}
				style={{ backgroundColor: "#333333", color: "#ffffff" }}
			/>
		</div>
	),
};

export const SwitchDarkLight: Story = {
	args: {
		items: topMenuSampleData,
	},
	render: (args) => {
		const [theme, setTheme] = useState<MenuTheme>("dark");

		const changeTheme = (value: boolean) => {
			setTheme(value ? "dark" : "light");
		};

		return (
			<div style={{ padding: "16px" }}>
				<Switch
					checked={theme === "dark"}
					onChange={changeTheme}
					checkedChildren="Dark"
					unCheckedChildren="Light"
				/>
				<div
					style={{
						padding: "16px",
						borderRadius: "8px",
					}}
				>
					<Menu {...args} theme={theme} />
				</div>
			</div>
		);
	},
};
