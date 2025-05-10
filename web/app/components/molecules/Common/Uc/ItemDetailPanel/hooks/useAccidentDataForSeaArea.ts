import { useEffect, useState } from "react";
import type { AccidentFeature } from "~/components/pages/Visualizations/types";

export const useAccidentDataForSeaArea = (
	accidentReports,
	seaAreaName,
	formDataState,
	selectedAccidentType,
) => {
	const [filteredAccidents, setFilteredAccidents] = useState<AccidentFeature[]>(
		[],
	);

	useEffect(() => {
		if (!accidentReports || !seaAreaName || !formDataState) return;

		const fromDate = formDataState.dateFromSectionMesh?.startOf("day").toDate();
		const toDate = formDataState.dateToSectionMesh?.endOf("day").toDate();

		const filtered = accidentReports.filter((report) => {
			const dateKey = Object.keys(report.properties).find(
				(key) => key.replace(/^\ufeff/, "") === "発生日時",
			);
			const rawDate = dateKey ? report.properties[dateKey] : null;
			const cleanDateStr = rawDate ? rawDate.replace(/^\ufeff/, "") : "";
			const reportDate = new Date(cleanDateStr);

			const matchesSeaArea = Array.isArray(report.properties.name)
				? report.properties.name.includes(seaAreaName)
				: report.properties.name === seaAreaName;
			const withinDateRange =
				(!fromDate || reportDate >= fromDate) &&
				(!toDate || reportDate <= toDate);
			const matchesAccidentType =
				selectedAccidentType && selectedAccidentType !== "全て"
					? report?.properties?.事故分類_1 === selectedAccidentType
					: true;

			return matchesSeaArea && withinDateRange && matchesAccidentType;
		});

		setFilteredAccidents(filtered);
	}, [accidentReports, seaAreaName, formDataState, selectedAccidentType]);

	return { filteredAccidents };
};
