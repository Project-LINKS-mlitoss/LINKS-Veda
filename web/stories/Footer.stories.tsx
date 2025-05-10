import type { Meta, StoryObj } from "@storybook/react";
import Footer from "app/components/atoms/Footer";

const meta: Meta<typeof Footer> = {
	title: "Example/Footer",
	component: Footer,
	parameters: {
		layout: "fullscreen",
	},
	tags: ["autodocs"],
} satisfies Meta<typeof Footer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
	render: (args) => (
		<div style={{ height: "200px", display: "flex", flexDirection: "column" }}>
			<div style={{ flex: 1 }} />
			<Footer {...args}>
				<p>Basic Footer Content</p>
			</Footer>
		</div>
	),
};

export const WithLinks: Story = {
	render: (args) => (
		<div style={{ height: "200px", display: "flex", flexDirection: "column" }}>
			<div style={{ flex: 1 }} />
			<Footer {...args}>
				<p>
					Footer with Links:{" "}
					<a href="#home" style={{ marginRight: "10px" }}>
						Home
					</a>{" "}
					|{" "}
					<a href="#about" style={{ marginRight: "10px" }}>
						About
					</a>{" "}
					| <a href="#contact">Contact</a>
				</p>
			</Footer>
		</div>
	),
};

export const WithSocialMedia: Story = {
	render: (args) => (
		<div style={{ height: "200px", display: "flex", flexDirection: "column" }}>
			<div style={{ flex: 1 }} />
			<Footer {...args}>
				<p>
					Follow us on:{" "}
					<a
						href="https://facebook.com"
						target="_blank"
						rel="noopener noreferrer"
						style={{ marginRight: "10px" }}
					>
						Facebook
					</a>{" "}
					|{" "}
					<a
						href="https://twitter.com"
						target="_blank"
						rel="noopener noreferrer"
						style={{ marginRight: "10px" }}
					>
						Twitter
					</a>{" "}
					|{" "}
					<a
						href="https://instagram.com"
						target="_blank"
						rel="noopener noreferrer"
					>
						Instagram
					</a>
				</p>
			</Footer>
		</div>
	),
};

export const WithCopyright: Story = {
	render: (args) => (
		<div style={{ height: "200px", display: "flex", flexDirection: "column" }}>
			<div style={{ flex: 1 }} />
			<Footer {...args}>
				<p>© 2024 Your Company. All rights reserved.</p>
			</Footer>
		</div>
	),
};

export const CustomStyle: Story = {
	render: (args) => (
		<div style={{ height: "200px", display: "flex", flexDirection: "column" }}>
			<div style={{ flex: 1 }} />
			<Footer
				{...args}
				style={{
					backgroundColor: "#282c34",
					color: "white",
					textAlign: "center",
					padding: "20px",
				}}
			>
				<p>Custom Styled Footer</p>
			</Footer>
		</div>
	),
};
