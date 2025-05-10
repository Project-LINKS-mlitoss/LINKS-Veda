import type { Meta, StoryObj } from "@storybook/react";
import { ParameterPanel } from "~/components/pages/Visualizations/UC16/UFN001/ParameterPanel";

const meta: Meta<typeof ParameterPanel> = {
	title: "Pages/Visualizations/UC16/UFN001/SidePanel/ParameterPanel",
	component: ParameterPanel,
	args: {},
} satisfies Meta<typeof ParameterPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {},
	render: (_) => (
		<ParameterPanel
			areas={[]}
			aircraftInfo={{
				manufacturerNames: [],
				modelNames: [],
				manufacturingTypes: [],
			}}
		/>
	),
};
