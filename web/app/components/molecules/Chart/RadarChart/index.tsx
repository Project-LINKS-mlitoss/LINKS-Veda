import type React from "react";
import { useMemo, useState } from "react";
import {
	PolarAngleAxis,
	PolarGrid,
	PolarRadiusAxis,
	Radar,
	RadarChart as RadarChartBase,
	ResponsiveContainer,
	Tooltip,
} from "recharts";
import type { filteredBusinessData } from "../../../pages/Visualizations/UC12/UFN001/components/Chart/UC12ChartViewer";
import type { ClusterAnalysisResult } from "../../../pages/Visualizations/UC12/UFN001/hooks/useClusterAnalysis";

interface MultiRadarChartProps {
	clusterAnalysisResult: ClusterAnalysisResult;
	filteredBusinessData: filteredBusinessData | [];
}

interface RadarDataPoint {
	category: string;
	[cluster: string]: number | string;
}

const clusterColors: Record<string, string> = {
	クラスター1: "#22d3ee",
	クラスター2: "#3b82f6",
	クラスター3: "#fde047",
	クラスター4: "#d32029",
	クラスター5: "#67e8f9",
	事業者: "#000000",
};

function getClusterColor(clusterName: string, isActive: boolean) {
	return isActive
		? clusterName === "事業者データ"
			? "#000000"
			: "#1890FF"
		: clusterColors[clusterName] ?? "#999999";
}

const MultiRadarChart: React.FC<MultiRadarChartProps> = ({
	clusterAnalysisResult,
	filteredBusinessData,
}) => {
	const [selectedCluster, setSelectedCluster] = useState<string | null>(null);

	const categories = useMemo(() => {
		const catSet = new Set<string>();
		const clusters = clusterAnalysisResult.clusters;

		for (let i = 0; i < clusters.length; i++) {
			const keys = Object.keys(clusters[i].averages);

			for (let j = 0; j < keys.length; j++) {
				catSet.add(keys[j]);
			}
		}

		return Array.from(catSet);
	}, [clusterAnalysisResult]);

	// MultiRadarChart.tsx（変更部分のみ）
	const chartData = useMemo(() => {
		const data: RadarDataPoint[] = [];
		const businessData = filteredBusinessData[0] || {};

		for (const category of categories) {
			const dataPoint: RadarDataPoint = { category };

			// クラスターデータの処理（変更なし）
			for (const cluster of clusterAnalysisResult.clusters) {
				dataPoint[cluster.cluster] = cluster.averages[category] ?? 0;
			}

			// 事業者データの処理
			if (businessData.businessProperties) {
				const businessValue = businessData.businessProperties[category];
				dataPoint[businessData.businessName] =
					typeof businessValue === "number" ? businessValue : 0;
			}

			data.push(dataPoint);
		}
		return data;
	}, [clusterAnalysisResult, categories, filteredBusinessData]);

	const buttons = [
		...clusterAnalysisResult.clusters.map((item) => {
			const isActive = item.cluster === selectedCluster;
			return (
				<button
					type="button"
					key={item.cluster}
					onClick={() =>
						setSelectedCluster((prev) =>
							prev === item.cluster ? null : item.cluster,
						)
					}
					className={`
				px-2 py-1 border rounded-md
				${
					isActive
						? "border-blue-500 text-blue-500"
						: "border-gray-300 text-gray-700"
				}
			  `}
				>
					{item.cluster}
				</button>
			);
		}),
		...(filteredBusinessData.length > 0
			? [
					<button
						type="button"
						key="business"
						onClick={() =>
							setSelectedCluster((prev) =>
								prev === "business" ? null : "business",
							)
						}
						className={`
			  px-2 py-1 border rounded-md
			  ${
					selectedCluster === "business"
						? "border-black text-black"
						: "border-gray-300 text-gray-700"
				}
			`}
					>
						{filteredBusinessData[0]?.businessName || "事業者データ"}
					</button>,
				]
			: []),
	];

	const radarComponents = [
		...clusterAnalysisResult.clusters.map((item) => {
			const isActive = item.cluster === selectedCluster;
			const color = getClusterColor(item.cluster, isActive);
			return (
				<Radar
					key={item.cluster}
					name={item.cluster}
					dataKey={item.cluster}
					stroke={color}
					fill={color}
					fillOpacity={isActive ? 0.3 : 0}
				/>
			);
		}),
		...(filteredBusinessData.length > 0
			? [
					<Radar
						key="business"
						name={filteredBusinessData[0]?.businessName || "事業者データ"}
						dataKey={filteredBusinessData[0]?.businessName || "事業者データ"}
						stroke="#000000"
						fill="#000000"
						fillOpacity={selectedCluster === "business" ? 0.3 : 0}
					/>,
				]
			: []),
	];

	if (chartData.length === 0) {
		return (
			<div className="text-center text-gray-500">
				表示するデータがありません
			</div>
		);
	}

	return (
		<div className="w-full h-full">
			<div className="border-b border-gray-300 pb-2 mb-4 text-center text-gray-600 font-medium">
				クラスター分析の結果
			</div>

			<div className="flex gap-2 flex-wrap mb-3">{buttons}</div>

			<ResponsiveContainer width="100%" height={300}>
				<RadarChartBase data={chartData}>
					<PolarGrid strokeDasharray="3 3" />
					<PolarAngleAxis
						dataKey="category"
						tick={{ fontSize: 10, fill: "#666" }}
					/>
					<PolarRadiusAxis
						angle={30}
						domain={[0, 100]}
						tick={{ fontSize: 10 }}
					/>
					<Tooltip
						contentStyle={{
							backgroundColor: "#fff",
							border: "none",
							borderRadius: "4px",
							boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
						}}
					/>
					{radarComponents}
				</RadarChartBase>
			</ResponsiveContainer>
		</div>
	);
};

export default MultiRadarChart;
