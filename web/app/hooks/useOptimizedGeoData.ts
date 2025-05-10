import * as turf from "@turf/turf";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import { useCallback, useEffect, useState } from "react";
import type { ZoneConfig } from "~/commons/area.const";
import type { OptimizedGeoDataResult } from "~/types/geo.types";
import { useModelGeometries } from "./useModelGeometries";

const isValidGeoJSON = (data: unknown): data is FeatureCollection => {
	if (!data || typeof data !== "object") return false;
	const geoJSON = data as FeatureCollection;
	return (
		geoJSON.type === "FeatureCollection" && Array.isArray(geoJSON.features)
	);
};

export function useOptimizedGeoData(
	config: ZoneConfig | null,
): Omit<OptimizedGeoDataResult, "uc14Data"> {
	const [geoJsonData, setGeoJsonData] = useState<GeoJSON.GeoJsonObject | null>(
		null,
	);
	const [isLoading, setIsLoading] = useState(false);

	const { geometries } = useModelGeometries();

	const optimizeGeoJSON = useCallback(
		async (data: FeatureCollection, tolerance = 0.001) => {
			if (!isValidGeoJSON(data)) {
				console.warn("Invalid GeoJSON data received");
				return null;
			}

			try {
				const validFeatures = data.features.filter(
					(f: Feature<Geometry>) =>
						f?.geometry?.type &&
						"coordinates" in f.geometry &&
						f.geometry.coordinates,
				);

				if (validFeatures.length === 0) return data;

				return turf.simplify(
					{
						type: "FeatureCollection",
						features: validFeatures,
					},
					{
						tolerance,
						highQuality: false,
					},
				);
			} catch (error) {
				console.error("Error optimizing GeoJSON:", error);
				return null;
			}
		},
		[],
	);

	useEffect(() => {
		const fetchZoneData = async () => {
			if (!config) {
				setGeoJsonData(null);
				return;
			}

			try {
				setIsLoading(true);
				const zoneResponse = await fetch(config.file);
				const zoneData = await zoneResponse.json();
				const optimizedZoneData = await optimizeGeoJSON(zoneData);
				setGeoJsonData(optimizedZoneData);
			} catch (error) {
				console.error("Error fetching zone data:", error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchZoneData();
	}, [config, optimizeGeoJSON]);

	return {
		geoJsonData,
		geometries,
		isLoading,
		uc16Data: {
			geometries,
			geoJsonData,
		},
	};
}
