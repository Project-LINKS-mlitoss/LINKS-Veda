import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { UC14GeojsonLFiles } from "~/components/pages/Visualizations/UC14/UFN001v2/_mock";
import { loadJSONL } from "../../GeojsonLUtils/loadJSONL";
import type { TrafficVolumeData } from "../types";

export function useTrafficData(
	startDate: string,
	endDate: string,
	meshId: string,
) {
	const [trafficData, setTrafficData] = useState<
		{ name: string; averageTrafficVolume: number }[]
	>([]);

	useEffect(() => {
		if (!startDate || !endDate) return;

		const processTrafficData = async () => {
			const trafficVolumeData: Record<
				string,
				{ name: string; totalTrafficVolume: number; recordCount: number }
			> = {};
			await loadJSONL(UC14GeojsonLFiles.tvData, (data: TrafficVolumeData) => {
				if (data.properties?.日時 && data.properties?.交通量 !== undefined) {
					if (meshId && data.properties?.メッシュID?.toString() === meshId) {
						// Parse the date-time string, e.g., "2023-03-07 19:00:00"
						const parsedDate = dayjs(
							data.properties.日時,
							"YYYY-MM-DD HH:mm:ss",
						).startOf("day");

						// Check if the parsed date is within the selected range [startDate, endDate]
						if (
							(parsedDate.isSame(startDate, "day") ||
								parsedDate.isAfter(startDate, "day")) &&
							(parsedDate.isSame(endDate, "day") ||
								parsedDate.isBefore(endDate, "day"))
						) {
							const dateKey = parsedDate.format("YYYY-MM-DD");

							// Initialize traffic data for the date if not already present
							if (!trafficVolumeData[dateKey]) {
								trafficVolumeData[dateKey] = {
									name: dateKey,
									totalTrafficVolume: 0,
									recordCount: 0,
								};
							}

							// Sum the traffic volume and increment the count for the same date
							trafficVolumeData[dateKey].totalTrafficVolume +=
								data.properties.交通量;
							trafficVolumeData[dateKey].recordCount += 1;
						}
					}
				}
			});
			const averagedTrafficData = Object.entries(trafficVolumeData).map(
				([date, { totalTrafficVolume, recordCount }]) => ({
					name: date,
					averageTrafficVolume:
						recordCount * 4
							? Number((totalTrafficVolume / recordCount).toFixed(2)) * 4
							: 0,
				}),
			);

			setTrafficData(averagedTrafficData);
		};

		processTrafficData();
	}, [startDate, endDate, meshId]);

	return trafficData;
}
