import type { Meta, StoryObj } from "@storybook/react";
import Content from "app/components/atoms/Content";

const meta: Meta<typeof Content> = {
	title: "Example/Content",
	component: Content,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Basic: Story = {
	args: {
		children: "This is some content",
	},
};

export const Long: Story = {
	args: {
		children:
			"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc at pellentesque neque. Pellentesque eu leo velit. In hac habitasse platea dictumst. Duis rutrum dictum mauris. Nam rhoncus tempus nulla, a sagittis diam viverra quis. Sed tincidunt pretium vestibulum. Quisque at arcu est. Pellentesque vel lorem bibendum, feugiat quam vitae, ornare enim. Mauris vulputate purus sit amet tempus cursus. Integer erat nunc, dapibus id lectus et, efficitur pulvinar nunc. Nulla quam sapien, aliquam interdum justo ac, lobortis iaculis enim. Nulla cursus tristique ullamcorper. Vestibulum sodales lorem convallis velit rutrum condimentum et a mauris. In sit amet porta leo, non tempus dui. Vestibulum tortor turpis, pretium a fermentum a, suscipit sit amet diam. Duis sit amet justo nec orci varius gravida. Nam hendrerit libero nec efficitur accumsan. Ut ultricies leo et vehicula commodo. Maecenas at pellentesque massa. Cras varius, odio eget luctus lobortis, felis arcu porta lacus, vitae viverra enim massa sed massa. Cras quis lacus nec turpis tincidunt consequat quis non arcu. Ut lorem enim, bibendum venenatis elementum ac, tincidunt sit amet quam. Vestibulum ut erat vitae orci placerat consectetur non at sapien. Etiam eu quam eget ex pretium porta ut sed metus. Phasellus cursus nisl eu rhoncus auctor.",
	},
};

export const HtmlContent: Story = {
	args: {
		children: (
			<div>
				<h1>Title</h1>
				<p>
					This is some <strong>bold</strong> content with <em>italic</em> text
					and <a href="/">a link</a>.
				</p>
			</div>
		),
	},
};

export const Dynamic: Story = {
	args: {
		children: `Dynamic content at ${new Date().toLocaleTimeString()}`,
	},
};

export const WithNestedComponent: Story = {
	args: {
		children: (
			<div>
				<h2>Nested Component</h2>
				<Content>Inner content inside another Content component</Content>
			</div>
		),
	},
};
