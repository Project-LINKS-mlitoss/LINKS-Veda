import * as turf from "@turf/turf";
import type {
	Feature,
	FeatureCollection,
	GeoJsonProperties,
	Geometry,
} from "geojson";
import { useEffect, useState } from "react";
import { CONTENT_FIELD_TYPE } from "~/commons/core.const";
import type { ItemField } from "~/models/items";
import { optimizeGeometries } from "~/utils/geometryOptimizer";

export function useModelGeometries() {
	const [geometries, setGeometries] = useState<FeatureCollection | null>(null);

	useEffect(() => {
		const fetchGeometries = async () => {
			const getStoredModelId = () => {
				try {
					const storedDataSet = localStorage.getItem("currentSelectedModel");
					return storedDataSet ? JSON.parse(storedDataSet) : null;
				} catch (error) {
					console.error("Error parsing stored data:", error);
					return null;
				}
			};

			const currentModel = getStoredModelId();
			if (!currentModel?.id) return;

			try {
				const [itemsResponse, modelResponse] = await Promise.all([
					fetch(`/items?modelId=${currentModel.id}`),
					fetch(`/model/${currentModel.id}`),
				]);

				const [modelItemsData, modelData] = await Promise.all([
					itemsResponse.json(),
					modelResponse.json(),
				]);

				if (!itemsResponse.ok) return;

				const newFeatures: GeoJSON.Feature[] = [];

				for (const item of modelItemsData?.data.items || []) {
					const properties: GeoJsonProperties = {};

					for (const field of modelData.data.schema.fields || []) {
						const fieldData = item?.fields?.find(
							(f: ItemField) => f?.id === field?.id,
						);

						if (fieldData?.type === CONTENT_FIELD_TYPE.GEO) {
							const geometry = JSON.parse(fieldData?.value) as GeoJSON.Geometry;
							if (geometry) {
								newFeatures.push({
									type: "Feature",
									properties,
									geometry,
								});
							}
						} else if (fieldData) {
							properties[field?.key] = fieldData?.value;
						}
					}
				}

				// Create initial feature collection
				const featureCollection = turf.featureCollection(
					newFeatures.filter((f: Feature<Geometry, GeoJsonProperties>) => {
						if (!f.geometry) return false;
						return [
							"Point",
							"MultiPoint",
							"LineString",
							"MultiLineString",
							"Polygon",
							"MultiPolygon",
						].includes(f.geometry.type);
					}),
				);

				// Optimize the geometries with custom options
				const optimizedGeometries = optimizeGeometries(featureCollection, {
					tolerance: 0.0001, // More precise than default
					highQuality: true, // Better quality for important features
					removeDuplicates: true,
					simplifyShapes: true,
				});

				setGeometries(optimizedGeometries);
			} catch (error) {
				console.error("Error fetching geometries:", error);
			}
		};

		fetchGeometries();
	}, []);

	return { geometries };
}
