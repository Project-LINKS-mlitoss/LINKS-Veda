import { useMemo } from "react";
import type { AverageValues, MeshItem } from "../types";

export const useAverageValues = (
	filteredMeshes?: MeshItem[],
): AverageValues => {
	return useMemo(() => {
		if (!filteredMeshes || filteredMeshes.length === 0) {
			return {
				averageWindSpeed: 0,
				averageWaveHeight: 0,
				averageVisibility: 0,
			};
		}

		// Helper function to count '9's
		const countNines = (value: number | string): number => {
			return value
				.toString()
				.split("")
				.filter((char) => char === "9").length;
		};

		const validMesh = filteredMeshes.filter((feature) => {
			const { 風速, 波高, 視程 } = feature.properties;
			return (
				countNines(風速) <= 3 && countNines(波高) <= 3 && countNines(視程) <= 3
			);
		});

		if (validMesh.length === 0) {
			return {
				averageWindSpeed: 0,
				averageWaveHeight: 0,
				averageVisibility: 0,
			};
		}

		const total = validMesh.reduce(
			(acc, feature) => {
				acc.windSpeed += Number(feature.properties.風速) || 0;
				acc.waveHeight += Number(feature.properties.波高) || 0;
				acc.visibility += Number(feature.properties.視程) || 0;
				return acc;
			},
			{ windSpeed: 0, waveHeight: 0, visibility: 0 },
		);

		const count = validMesh.length;
		return {
			averageWindSpeed: Number((total.windSpeed / count).toFixed(2)),
			averageWaveHeight: Number((total.waveHeight / count).toFixed(2)),
			averageVisibility: Number((total.visibility / count).toFixed(2)),
		};
	}, [filteredMeshes]);
};
