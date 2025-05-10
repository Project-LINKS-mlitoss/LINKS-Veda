import type { Feature, GeoJsonProperties, Geometry } from "geojson";
import { useCallback, useEffect, useState } from "react";
import type { BarClickData } from "~/components/molecules/Chart/BarChart/types";
import type {
	FieldObjects,
	FilterSubmitValues,
} from "~/components/pages/Visualizations/UC14/UFN001v2/types";

export const useSeaAreaData = (
	graphData,
	seaAreas: Feature<Geometry, GeoJsonProperties>[],
	formData: FilterSubmitValues,
	seaAreaName: string,
) => {
	const [seaAreaData, setSeaAreaData] = useState<
		Feature<Geometry, GeoJsonProperties>[]
	>([]);
	const [formDataState, setFormDataState] = useState<FilterSubmitValues | null>(
		null,
	);
	const [selectedSeaArea, setSelectedSeaArea] = useState<string | null>(
		seaAreaName ?? null,
	);
	const [fieldObjects, setFieldObjects] = useState<FieldObjects | undefined>(
		undefined,
	);
	const [filteredFieldObjects, setFilteredFieldObjects] = useState<
		FieldObjects | undefined
	>(undefined);
	const [isLoading, setIsLoading] = useState(false);

	const setFields = useCallback(() => {
		const tableObjects = graphData?.map((feature, index: number) => ({
			id: `unknown-id-${index}`,
			fields: Object.entries(feature.properties || {}).map(([key, value]) => ({
				id: key,
				key,
				type:
					typeof value === "number"
						? "number"
						: typeof value === "string"
							? "string"
							: "unknown",
				value: value || "N/A",
			})),
		}));
		setFieldObjects(tableObjects);
		return tableObjects;
	}, [graphData]);

	useEffect(() => {
		if (graphData) {
			const tableObjects = setFields();
			if (formData) setFormDataState(formData);
			if (seaAreas?.length && seaAreas[0]?.properties?.name) {
				setSeaAreaData(seaAreas);
				setSelectedSeaArea(seaAreaName ?? seaAreas[0].properties.name);
			}
		}
	}, [graphData, formData, seaAreas, seaAreaName, setFields]);

	const handleBarClick = (data: BarClickData) => {
		setIsLoading(true);
		const clickedName = data.payload?.name;

		if (!clickedName) {
			console.error("Bar click missing name property");
			setIsLoading(false);
			return;
		}

		setSelectedSeaArea(clickedName);
		const filtered = barSeaFilter(clickedName);
		setFilteredFieldObjects(filtered);
		setIsLoading(false);
	};
	const barSeaFilter = useCallback(
		(clickedName: string, tableObjects?: FieldObjects) => {
			// Filter the fieldObjects based on the clicked area
			const filtered = tableObjects
				? tableObjects
				: fieldObjects?.filter((fieldObj) => {
						const areaField = fieldObj.fields.find(
							(field) =>
								field.key.includes("name") || field.key.includes("海域"),
						);
						if (!areaField) return false;
						return (
							String(areaField.value).replace(/^\ufeff/, "") === clickedName
						);
					});

			return filtered;
		},
		[fieldObjects],
	);

	return {
		seaAreaData,
		formDataState,
		selectedSeaArea,
		fieldObjects,
		filteredFieldObjects,
		isLoading,
		handleBarClick,
	};
};
