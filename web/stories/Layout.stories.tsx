import type { Meta, StoryObj } from "@storybook/react";
import Layout from "app/components/atoms/Layout";
import type { ReactElement } from "react";

const meta: Meta<typeof Layout> = {
	title: "Example/Layout",
	component: Layout,
	parameters: {
		layout: "fullscreen",
	},
	tags: ["autodocs"],
} satisfies Meta<typeof Layout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
	args: {
		children: <div>Basic Layout Content</div>,
	},
	render: (args): ReactElement => (
		<Layout {...args} style={{ padding: "16px", backgroundColor: "#f0f0f0" }}>
			{args.children}
		</Layout>
	),
};

export const WithSidebar: Story = {
	args: {
		children: (
			<>
				<aside
					style={{
						width: "200px",
						backgroundColor: "#e0e0e0",
						padding: "16px",
					}}
				>
					Sidebar Content
				</aside>
				<main style={{ marginLeft: "220px", padding: "16px" }}>
					Main Content
				</main>
			</>
		),
	},
	render: (args): ReactElement => (
		<Layout {...args} style={{ display: "flex" }}>
			{args.children}
		</Layout>
	),
};

export const WithHeaderAndFooter: Story = {
	args: {
		children: (
			<>
				<header
					style={{ backgroundColor: "#333", color: "#fff", padding: "16px" }}
				>
					Header Content
				</header>
				<main style={{ padding: "16px" }}>Main Content</main>
				<footer
					style={{ backgroundColor: "#333", color: "#fff", padding: "16px" }}
				>
					Footer Content
				</footer>
			</>
		),
	},
	render: (args): ReactElement => (
		<Layout
			{...args}
			style={{ display: "flex", flexDirection: "column", height: "100vh" }}
		>
			{args.children}
		</Layout>
	),
};

export const CenteredContent: Story = {
	args: {
		children: <div style={{ textAlign: "center" }}>Centered Content</div>,
	},
	render: (args): ReactElement => (
		<Layout
			{...args}
			style={{
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				height: "100vh",
			}}
		>
			{args.children}
		</Layout>
	),
};

export const CustomBackground: Story = {
	args: {
		children: <div>Custom Background Layout</div>,
	},
	render: (args): ReactElement => (
		<Layout {...args} style={{ padding: "16px", backgroundColor: "#bada55" }}>
			{args.children}
		</Layout>
	),
};
