import { Legend, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";

export default function TrafficChart({
	trafficData,
}: Readonly<{
	trafficData: { name: string; averageTrafficVolume: number }[];
}>) {
	return (
		<LineChart
			width={500}
			height={300}
			data={trafficData}
			margin={{ right: 10, left: 0 }}
			style={{ width: "100%" }}
		>
			<XAxis dataKey="name" />
			<YAxis />
			<Tooltip />
			<Legend />
			<Line
				type="monotone"
				dataKey="averageTrafficVolume"
				stroke="#82ca9d"
				name="平均交通量"
				dot={false}
			/>
		</LineChart>
	);
}
