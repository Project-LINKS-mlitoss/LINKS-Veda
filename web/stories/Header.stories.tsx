import type { Meta, StoryObj } from "@storybook/react";
import Header from "app/components/atoms/Header";
import type { ReactElement } from "react";

const meta: Meta<typeof Header> = {
	title: "Example/Header",
	component: Header,
	parameters: {
		layout: "fullscreen",
	},
	tags: ["autodocs"],
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
	args: {
		title: "Basic Header",
	},
	render: (args): ReactElement => (
		<div style={{ height: "200px", backgroundColor: "#f0f0f0" }}>
			<Header
				{...args}
				style={{
					width: "100%",
					height: "60px",
					padding: "16px",
					backgroundColor: "#fff",
					boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
					color: "#000000",
				}}
			>
				<div>
					<h1>{args.title}</h1>
				</div>
			</Header>
		</div>
	),
};

export const WithLogo: Story = {
	args: {
		title: "Header with Logo",
	},
	render: (args): ReactElement => (
		<div style={{ height: "200px", backgroundColor: "#e0e0e0" }}>
			<Header
				{...args}
				style={{
					width: "100%",
					height: "60px",
					padding: "16px",
					backgroundColor: "#f0f0f0",
					display: "flex",
					alignItems: "center",
				}}
			>
				<div style={{ marginRight: "16px" }}>Logo</div>
				<div>
					<h1>{args.title}</h1>
				</div>
			</Header>
		</div>
	),
};

export const CustomBackground: Story = {
	args: {
		title: "Custom Background Header",
	},
	render: (args): ReactElement => (
		<div style={{ height: "200px", backgroundColor: "#e0e0e0" }}>
			<Header
				{...args}
				style={{
					width: "100%",
					height: "60px",
					padding: "16px",
					backgroundColor: "#1d1a1a",
					color: "#ffffff",
				}}
			>
				<div>
					<h1>{args.title}</h1>
				</div>
			</Header>
		</div>
	),
};

export const WithLongTitle: Story = {
	args: {
		title:
			"This is a very long title that might need truncation or special handling",
	},
	render: (args): ReactElement => (
		<div style={{ height: "200px", backgroundColor: "#f0f0f0" }}>
			<Header
				{...args}
				style={{
					width: "100%",
					height: "60px",
					padding: "16px",
					backgroundColor: "#fff",
					textOverflow: "ellipsis",
					overflow: "hidden",
				}}
			>
				<div>
					<h1>{args.title}</h1>
				</div>
			</Header>
		</div>
	),
};

export const Responsive: Story = {
	args: {
		title: "Responsive Header",
	},
	render: (args): ReactElement => (
		<div style={{ height: "120px", backgroundColor: "#333", padding: "20px" }}>
			<Header
				{...args}
				style={{
					width: "100%",
					height: "80px",
					padding: "20px",
					backgroundColor: "#333",
					color: "#fff",
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
				}}
			>
				<div>
					<h1>{args.title}</h1>
				</div>
			</Header>
		</div>
	),
};

export const StickyHeader: Story = {
	args: {
		title: "Sticky Header",
	},
	render: (args): ReactElement => (
		<div style={{ height: "300px", backgroundColor: "#f0f0f0" }}>
			<Header
				{...args}
				style={{
					width: "100%",
					height: "60px",
					padding: "16px",
					backgroundColor: "#fff",
					position: "sticky",
					top: 0,
					boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
				}}
			>
				<div>
					<h1>{args.title}</h1>
				</div>
			</Header>
		</div>
	),
};

export const HeaderWithSearch: Story = {
	args: {
		title: "Header with Search",
	},
	render: (args): ReactElement => (
		<div style={{ height: "200px", backgroundColor: "#f0f0f0" }}>
			<Header
				{...args}
				style={{
					width: "100%",
					height: "60px",
					padding: "16px",
					backgroundColor: "#fff",
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
				}}
			>
				<div>
					<h1>{args.title}</h1>
				</div>
				<input
					type="text"
					placeholder="Search..."
					style={{
						padding: "8px",
						borderRadius: "4px",
						border: "1px solid #ccc",
					}}
				/>
			</Header>
		</div>
	),
};

export const HeaderWithButtons: Story = {
	args: {
		title: "Header with Buttons",
	},
	render: (args): ReactElement => (
		<div style={{ height: "200px", backgroundColor: "#f0f0f0" }}>
			<Header
				{...args}
				style={{
					width: "100%",
					height: "60px",
					padding: "16px",
					backgroundColor: "#fff",
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
				}}
			>
				<div>
					<h1>{args.title}</h1>
				</div>
				<div>
					<button
						type="button"
						style={{
							marginRight: "8px",
							padding: "8px 16px",
							border: "none",
							borderRadius: "4px",
							backgroundColor: "#007bff",
							color: "#fff",
						}}
					>
						Action 1
					</button>
					<button
						type="button"
						style={{
							padding: "8px 16px",
							border: "none",
							borderRadius: "4px",
							backgroundColor: "#28a745",
							color: "#fff",
						}}
					>
						Action 2
					</button>
				</div>
			</Header>
		</div>
	),
};

export const HeaderWithFooter: Story = {
	args: {
		title: "Header with Footer",
	},
	render: (args): ReactElement => (
		<div style={{ height: "150px", backgroundColor: "#f0f0f0" }}>
			<Header
				{...args}
				style={{
					width: "100%",
					height: "200px",
					padding: "16px",
					backgroundColor: "#fff",
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
				}}
			>
				<div>
					<h1>{args.title}</h1>
				</div>
				<div style={{ marginTop: "16px", fontSize: "12px", color: "#888" }}>
					Footer Content
				</div>
			</Header>
		</div>
	),
};

export const HeaderWithDropdown: Story = {
	args: {
		title: "Header with Dropdown",
	},
	render: (args): ReactElement => (
		<div style={{ height: "200px", backgroundColor: "#f0f0f0" }}>
			<Header
				{...args}
				style={{
					width: "100%",
					height: "60px",
					padding: "16px",
					backgroundColor: "#fff",
					position: "relative",
					display: "flex",
					alignItems: "center",
				}}
			>
				<div style={{ marginRight: "16px" }}>
					<h1>{args.title}</h1>
				</div>
				<div style={{ position: "relative" }}>
					<button type="button">Dropdown</button>
					<div
						style={{
							position: "absolute",
							top: "100%",
							right: 0,
							backgroundColor: "#fff",
							boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
							padding: "8px",
						}}
					>
						<ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
							<li>
								<a
									href="/"
									style={{
										display: "block",
										padding: "8px",
										textDecoration: "none",
										color: "#000",
									}}
								>
									Option 1
								</a>
							</li>
							<li>
								<a
									href="/"
									style={{
										display: "block",
										padding: "8px",
										textDecoration: "none",
										color: "#000",
									}}
								>
									Option 2
								</a>
							</li>
							<li>
								<a
									href="/"
									style={{
										display: "block",
										padding: "8px",
										textDecoration: "none",
										color: "#000",
									}}
								>
									Option 3
								</a>
							</li>
						</ul>
					</div>
				</div>
			</Header>
		</div>
	),
};

export const HeaderWithAvatar: Story = {
	args: {
		title: "Header with Avatar",
	},
	render: (args): ReactElement => (
		<div style={{ height: "200px", backgroundColor: "#f0f0f0" }}>
			<Header
				{...args}
				style={{
					width: "100%",
					height: "60px",
					padding: "16px",
					backgroundColor: "#fff",
					display: "flex",
					alignItems: "center",
				}}
			>
				<img
					src="https://www.w3schools.com/w3images/avatar2.png"
					alt="User Avatar"
					style={{
						width: "40px",
						height: "40px",
						borderRadius: "50%",
						marginRight: "8px",
					}}
				/>
				<div>
					<h1>{args.title}</h1>
				</div>
			</Header>
		</div>
	),
};
