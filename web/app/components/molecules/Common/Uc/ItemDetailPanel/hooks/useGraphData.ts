import dayjs from "dayjs";
import { useMemo } from "react";
import type { MeshItem } from "../types";

export function useGraphData(
	startDate: string,
	endDate: string,
	filteredMeshes?: MeshItem[],
	selectedMeshIds?: string[],
) {
	return useMemo(() => {
		if (!filteredMeshes) return [];

		const isValidValue = (value: number) => {
			if (value === null || value === undefined) return false;
			const numStr = value.toString();
			const nineCount = numStr.split("").filter((char) => char === "9").length;
			return nineCount <= 2; // Valid if it has two or fewer '9's
		};
		const selectedMeshIdSet = selectedMeshIds
			? new Set(selectedMeshIds)
			: undefined;

		const filteredData = (filteredMeshes ?? [])
			.filter((mesh) => {
				if (!mesh || !mesh.properties || !mesh.properties.date) {
					return false; // Skip if mesh or properties are undefined
				}
				const meshDate = dayjs(mesh.properties.date);

				if (selectedMeshIdSet?.has(mesh.properties.mesh_id)) {
					return (
						selectedMeshIdSet.has(mesh.properties.mesh_id) &&
						(meshDate.isAfter(startDate, "day") ||
							meshDate.isSame(startDate, "day")) &&
						(meshDate.isBefore(endDate, "day") ||
							meshDate.isSame(endDate, "day"))
					);
				}
				return (
					(meshDate.isAfter(startDate, "day") ||
						meshDate.isSame(startDate, "day")) &&
					(meshDate.isBefore(endDate, "day") || meshDate.isSame(endDate, "day"))
				);
			})
			.reduce<
				Record<
					string,
					{
						name: string;
						windSpeed: number;
						waveHeight: number;
						visibility: number;
						count: number;
					}
				>
			>((acc, mesh) => {
				if (!mesh.properties.date) return acc;
				const meshDate = dayjs(mesh.properties.date).format("YYYY-MM-DD");

				if (!acc[meshDate]) {
					acc[meshDate] = {
						name: meshDate,
						windSpeed: 0,
						waveHeight: 0,
						visibility: 0,
						count: 0,
					};
				}
				const windSpeed = isValidValue(mesh.properties.風速)
					? mesh.properties.風速
					: 0;
				const waveHeight = isValidValue(mesh.properties.波高)
					? mesh.properties.波高
					: 0;
				const visibility = isValidValue(mesh.properties.視程)
					? mesh.properties.視程
					: 0;
				const validValues = [windSpeed, waveHeight, visibility].filter(
					(v) => v !== 0,
				);

				if (validValues.length > 0) {
					acc[meshDate].windSpeed += windSpeed;
					acc[meshDate].waveHeight += waveHeight;
					acc[meshDate].visibility += visibility;
					acc[meshDate].count += 1;
				}

				return acc;
			}, {});

		// Compute averages for each date
		return Object.values(filteredData).map((entry) => ({
			name: entry.name,
			windSpeed: entry.count
				? Number.parseFloat((entry.windSpeed / entry.count).toFixed(1))
				: 0,
			waveHeight: entry.count
				? Number.parseFloat((entry.waveHeight / entry.count).toFixed(1))
				: 0,
			visibility: entry.count
				? Number.parseFloat((entry.visibility / entry.count).toFixed(1))
				: 0,
		}));
	}, [filteredMeshes, startDate, endDate, selectedMeshIds]);
}
