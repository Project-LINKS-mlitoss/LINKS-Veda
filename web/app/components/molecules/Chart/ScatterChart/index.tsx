import type React from "react";
import { memo, useMemo } from "react";
import {
	CartesianGrid,
	ResponsiveContainer,
	Scatter,
	ScatterChart as ScatterChartBase,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import type {
	RegressionCoefficients,
	ScatterDataItem,
} from "../../../pages/Visualizations/UC12/UFN001/hooks/useScatterAnalysis";
import { useUC12ScatterPlot } from "../../../pages/Visualizations/UC12/UFN001/hooks/useUC12ScatterPlot";

interface ScatterChartProps {
	scatterData: ScatterDataItem[];
	regressionCoefficients: RegressionCoefficients | null;
}

const ScatterChart: React.FC<ScatterChartProps> = ({
	scatterData,
	regressionCoefficients,
}) => {
	const {
		objectiveKey,
		explanatoryConditions,
		processData,
		calculateRegressionLine,
		objectiveLabels,
	} = useUC12ScatterPlot(scatterData, regressionCoefficients);

	if (!objectiveKey || explanatoryConditions.length === 0) return null;

	// biome-ignore lint/suspicious/noExplicitAny: FIXME
	const CustomTooltip = ({ active, payload }: any) => {
		if (active && payload && payload.length) {
			return (
				<div className="bg-white p-2 border border-gray-300">
					<p>事業者名: {payload[0].payload.businessName}</p>
					<p>{`${payload[0].name}: ${payload[0].value}`}</p>
					<p>{`${payload[1].name}: ${payload[1].value}`}</p>
				</div>
			);
		}
		return null;
	};

	return (
		<div
			style={{
				display: "grid",
				gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
				gap: "20px",
				padding: "20px",
				position: "relative",
			}}
		>
			<div
				className="border-b border-gray-300 pb-2 mb-2 text-center text-gray-600 font-medium"
				style={{
					position: "absolute",
					top: 0,
					left: "50%",
					transform: "translateX(-50%)",
					width: "100%",
					zIndex: 1,
					backgroundColor: "white",
				}}
			>
				目的変数と各説明変数の散布図
			</div>
			{explanatoryConditions.map((condition) => {
				const chartData = processData(condition);
				const regressionLine = calculateRegressionLine(condition, chartData);

				return (
					<div
						key={condition}
						style={{
							border: "1px solid #eee",
							borderRadius: "8px",
							padding: "10px",
							marginTop: "40px",
						}}
					>
						{regressionLine.length === 0 && (
							<div
								style={{
									padding: "4px 16px",
									borderRadius: "4px",
									border: "1px solid #e0e0e0",
									boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
									color: "#666",
									fontSize: "14px",
									textAlign: "center",
									marginBottom: "10px",
								}}
							>
								データが少なすぎるため回帰直線が表示できません
							</div>
						)}
						<h3 style={{ textAlign: "center", marginBottom: "10px" }}>
							{condition}
						</h3>
						<ResponsiveContainer width="100%" height={300}>
							<ScatterChartBase
								margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
							>
								<CartesianGrid strokeDasharray="3 3" />
								<XAxis
									dataKey="x"
									name={condition}
									type="number"
									domain={["dataMin", "dataMax"]}
									label={{ value: condition, position: "bottom" }}
								/>
								<YAxis
									dataKey="y"
									name={objectiveLabels[objectiveKey]}
									label={{
										value: objectiveLabels[objectiveKey],
										angle: -90,
										position: "left",
									}}
								/>
								<Tooltip
									content={<CustomTooltip />}
									cursor={{ strokeDasharray: "3 3" }}
								/>
								<Scatter name="Data Points" data={chartData} fill="#8884d8" />
								{regressionLine.length > 0 && (
									<Scatter
										data={regressionLine}
										line={{ stroke: "#ff0000", strokeWidth: 2 }}
										name="回帰直線"
										legendType="none"
										lineType="fitting"
										lineJointType="linear"
										shape={() => <circle r={0} />}
									/>
								)}
							</ScatterChartBase>
						</ResponsiveContainer>
					</div>
				);
			})}
		</div>
	);
};

export default memo(ScatterChart);
