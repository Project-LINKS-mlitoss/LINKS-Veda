import type { Meta, StoryObj } from "@storybook/react";
import { MemoryRouter } from "react-router-dom";
import { TablePanel } from "~/components/pages/Visualizations/UC16/UFN001/TablePanel";

const meta: Meta<typeof TablePanel> = {
	title: "Pages/Visualizations/UC16/UFN001/SidePanel/ItemDetailPanel",
	component: TablePanel,
	args: {},
} satisfies Meta<typeof TablePanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {},
	render: (args) => (
		<MemoryRouter>
			<TablePanel
				flightPlans={[]}
				onFlightPlanClick={(flightPlan): void => {
					throw new Error("Function not implemented.");
				}}
			/>
		</MemoryRouter>
	),
};
