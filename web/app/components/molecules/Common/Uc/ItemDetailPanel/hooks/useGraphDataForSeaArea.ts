import { useEffect, useState } from "react";
import type { FilterSubmitValues } from "~/components/pages/Visualizations/UC14/UFN001v2/types";
import type { MeshItem, MeshProperties } from "../types";

export const useGraphDataForSeaArea = (
	seaAreaName: string | null,
	formDataState: FilterSubmitValues | null,
	meshData?: MeshItem[],
) => {
	const [averageValues, setAverageValues] = useState({
		averageWindSpeed: 0,
		averageWaveHeight: 0,
		averageVisibility: 0,
	});

	useEffect(() => {
		if (!seaAreaName || !meshData) return;

		const isValidValue = (value: number): value is number => {
			return (
				typeof value === "number" &&
				!Number.isNaN(value) &&
				value
					.toString()
					.split("")
					.filter((char) => char === "9").length <= 2
			);
		};
		const validData =
			meshData?.filter(
				(obj) =>
					obj.properties?.name === seaAreaName &&
					["風速", "波高", "視程"].every((param) => {
						const properties = obj.properties as MeshProperties;
						return (
							typeof properties[param as keyof MeshProperties] === "number"
						);
					}),
			) || [];

		if (!validData?.length) {
			setAverageValues({
				averageWindSpeed: 0,
				averageWaveHeight: 0,
				averageVisibility: 0,
			});
			return;
		}

		const sum = validData.reduce(
			(acc, obj) => {
				const windSpeed = isValidValue(obj.properties.風速)
					? obj.properties.風速
					: 0;
				const waveHeight = isValidValue(obj.properties.波高)
					? obj.properties.波高
					: 0;
				const visibility = isValidValue(obj.properties.視程)
					? obj.properties.視程
					: 0;
				return {
					windSpeed: acc.windSpeed + windSpeed,
					waveHeight: acc.waveHeight + waveHeight,
					visibility: acc.visibility + visibility,
				};
			},
			{ windSpeed: 0, waveHeight: 0, visibility: 0 },
		);

		setAverageValues({
			averageWindSpeed: Number.parseFloat(
				(sum.windSpeed / validData.length).toFixed(2),
			),
			averageWaveHeight: Number.parseFloat(
				(sum.waveHeight / validData.length).toFixed(2),
			),
			averageVisibility: Number.parseFloat(
				(sum.visibility / validData.length).toFixed(2),
			),
		});
	}, [seaAreaName, meshData]);

	return { averageValues };
};
