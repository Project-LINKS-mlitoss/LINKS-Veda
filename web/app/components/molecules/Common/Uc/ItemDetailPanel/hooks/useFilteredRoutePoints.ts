import { useCallback, useEffect, useState } from "react";
import { UC14GeojsonLFiles } from "~/components/pages/Visualizations/UC14/UFN001v2/_mock";
import { loadJSONL } from "../../GeojsonLUtils/loadJSONL";
import type { ExtendedSeaAccidentFeature, ShipItem } from "../types";

export const useFilteredRoutePoints = (
	shipName: string,
	currentItem?: ExtendedSeaAccidentFeature,
) => {
	const [filteredRoutePoints, setFilteredRoutePoints] = useState<ShipItem[]>(
		[],
	);

	const fetchAndFilterShipData = useCallback(async () => {
		if (!currentItem || !shipName) return;

		const results: ShipItem[] = [];
		await loadJSONL(UC14GeojsonLFiles?.pointData, (item: ShipItem) => {
			if (item.properties?.船名 === shipName) {
				results.push(item);
			}
		});

		setFilteredRoutePoints(results);
	}, [currentItem, shipName]);

	useEffect(() => {
		if (currentItem) {
			fetchAndFilterShipData();
		} else {
			setFilteredRoutePoints([]); // クリア
		}
	}, [currentItem, fetchAndFilterShipData]);

	return filteredRoutePoints;
};
