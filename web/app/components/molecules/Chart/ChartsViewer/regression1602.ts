import type { Feature, GeoJsonProperties, Geometry } from "geojson";
import { regressionYaxis } from "~/components/pages/Visualizations/UC16/UFN002/Filters/statics";

// TODO: Optimize this function and re-organize
export const regressionYX3 = (
	regressionData:
		| {
				regressionY: string;
				regressionX1: string;
				regressionX2: string;
				regressionX3: string;
		  }
		| undefined,
	filteredFlightData: Feature<Geometry, GeoJsonProperties>[] | undefined,
) => {
	const regressionGraphs = {
		graph1: [] as Record<string, number>[],
		graph2: [] as Record<string, number>[],
		graph3: [] as Record<string, number>[],
	};

	if (!regressionData || !filteredFlightData) {
		return regressionGraphs;
	}

	const accidentCountMap: Record<number, number> = {};
	const locationMap: Record<string, number> = {}; // Define outside loop
	let locationIndex = 1; // Start index at 1

	for (let i = 0; i < filteredFlightData.length; i++) {
		const flight = filteredFlightData[i];

		if (flight.properties) {
			let xValue1 = flight.properties[regressionData.regressionX1];
			let xValue2 = flight.properties[regressionData.regressionX2];
			let xValue3 = flight.properties[regressionData.regressionX3];

			// if x axis is 機体認証(⼀種) or 機体認証(二種) assign boolean

			if (regressionData.regressionX1 === "機体認証(⼀種)") {
				xValue1 = xValue1 ? 1 : 0;
			}
			if (regressionData.regressionX2 === "機体認証(⼀種)") {
				xValue2 = xValue2 ? 1 : 0;
			}
			if (regressionData.regressionX3 === "機体認証(⼀種)") {
				xValue3 = xValue3 ? 1 : 0;
			}

			if (regressionData.regressionX1 === "機体認証(二種)") {
				xValue1 = xValue1 ? 1 : 0;
			}

			if (regressionData.regressionX2 === "機体認証(二種)") {
				xValue2 = xValue2 ? 1 : 0;
			}

			if (regressionData.regressionX3 === "機体認証(二種)") {
				xValue3 = xValue3 ? 1 : 0;
			}

			if (regressionData.regressionX1 === "改造の有無") {
				xValue1 = xValue1 ? 1 : 0;
			}

			if (regressionData.regressionX2 === "改造の有無") {
				xValue2 = xValue2 ? 1 : 0;
			}

			if (regressionData.regressionX3 === "改造の有無") {
				xValue3 = xValue3 ? 1 : 0;
			}

			if (
				regressionData.regressionY ===
				regressionYaxis.find((res) => res.value === "事故件数（全件）")?.value
			) {
				if (xValue1) {
					// Ensure accident count is initialized before incrementing
					if (
						!accidentCountMap[xValue1] &&
						typeof accidentCountMap[xValue1] !== "number"
					) {
						accidentCountMap[xValue1] = 0;
					}
					accidentCountMap[xValue1]++;

					regressionGraphs.graph1.push({
						[regressionData.regressionX1]: xValue1,
						[regressionData.regressionY]: accidentCountMap[xValue1],
					});
				}
				if (xValue2) {
					// Ensure accident count is initialized before incrementing
					if (
						!accidentCountMap[xValue2] &&
						typeof accidentCountMap[xValue2] !== "number"
					) {
						accidentCountMap[xValue2] = 0;
					}
					accidentCountMap[xValue2]++;

					regressionGraphs.graph2.push({
						[regressionData.regressionX2]: xValue2,
						[regressionData.regressionY]: accidentCountMap[xValue2],
					});
				}
				if (xValue3) {
					// Ensure accident count is initialized before incrementing
					if (
						!accidentCountMap[xValue3] &&
						typeof accidentCountMap[xValue3] !== "number"
					) {
						accidentCountMap[xValue3] = 0;
					}
					accidentCountMap[xValue3]++;

					regressionGraphs.graph3.push({
						[regressionData.regressionX3]: xValue3,
						[regressionData.regressionY]: accidentCountMap[xValue3],
					});
				}
			} else if (
				regressionData.regressionY ===
				regressionYaxis.find((res) => res.value === "事故件数（人の死傷あり）")
					?.value
			) {
				const casualties = flight.properties.人の死傷; // Checking the "Casualties/Injuries" field

				const casualtyBool = casualties && casualties !== "なし" ? 1 : 0;

				if (regressionData.regressionX1) {
					regressionGraphs.graph1.push({
						[regressionData.regressionX1]: xValue1,
						[regressionData.regressionY]: casualtyBool,
					});
				}
				if (regressionData.regressionX2) {
					regressionGraphs.graph2.push({
						[regressionData.regressionX2]: xValue2,
						[regressionData.regressionY]: casualtyBool,
					});
				}
				if (regressionData.regressionX3) {
					regressionGraphs.graph3.push({
						[regressionData.regressionX3]: xValue3,
						[regressionData.regressionY]: casualtyBool,
					});
				}
			} else if (
				regressionData.regressionY ===
				regressionYaxis.find((res) => res.value === "事故件数（分類別）")?.value
			) {
				const category = flight.properties.カテゴリ || 0;
				if (regressionData.regressionX1) {
					regressionGraphs.graph1.push({
						[regressionData.regressionX1]: xValue1,
						[regressionData.regressionY]: category,
					});
				}
				if (regressionData.regressionX2) {
					regressionGraphs.graph2.push({
						[regressionData.regressionX2]: xValue2,
						[regressionData.regressionY]: category,
					});
				}
				if (regressionData.regressionX3) {
					regressionGraphs.graph3.push({
						[regressionData.regressionX3]: xValue3,
						[regressionData.regressionY]: category,
					});
				}
			} else if (
				regressionData.regressionY ===
				regressionYaxis.find((res) => res.value === "事故件数（行政区域別）")
					?.value
			) {
				const location = flight.properties.発生場所;

				if (location) {
					// Assign unique number to each location if not already assigned
					if (!(location in locationMap)) {
						locationMap[location] = locationIndex++;
					}

					const locationId = locationMap[location]; // Get numeric representation

					if (regressionData.regressionX1) {
						regressionGraphs.graph1.push({
							[regressionData.regressionX1]: xValue1,
							[regressionData.regressionY]: locationId,
							details: {
								location,
							},
						});
					}
					if (regressionData.regressionX2) {
						regressionGraphs.graph2.push({
							[regressionData.regressionX2]: xValue2,
							[regressionData.regressionY]: locationId,
							details: {
								location,
							},
						});
					}
					if (regressionData.regressionX3) {
						regressionGraphs.graph3.push({
							[regressionData.regressionX3]: xValue3,
							[regressionData.regressionY]: locationId,
							details: {
								location,
							},
						});
					}
				}
			} else if (
				regressionData.regressionY ===
				regressionYaxis.find(
					(res) => res.value === "事故件数（分類別・行政区域別）",
				)?.value
			) {
				const location = flight.properties.発生場所;
				const category = flight.properties.カテゴリ || 0;
				const combinedKey = `location - ${location};; category - ${category}`;

				if (location) {
					// Assign unique number to each location if not already assigned
					if (!(combinedKey in locationMap)) {
						locationMap[combinedKey] = locationIndex++;
					}

					const locationId = locationMap[combinedKey]; // Get numeric representation

					if (regressionData.regressionX1) {
						regressionGraphs.graph1.push({
							[regressionData.regressionX1]: xValue1,
							[regressionData.regressionY]: locationId,
							details: {
								data: combinedKey,
							},
						});
					}
					if (regressionData.regressionX2) {
						regressionGraphs.graph2.push({
							[regressionData.regressionX2]: xValue2,
							[regressionData.regressionY]: locationId,
							details: {
								data: combinedKey,
							},
						});
					}
					if (regressionData.regressionX3) {
						regressionGraphs.graph3.push({
							[regressionData.regressionX3]: xValue3,
							[regressionData.regressionY]: locationId,
							details: {
								data: combinedKey,
							},
						});
					}
				}
			} else {
				if (flight.properties[regressionData.regressionY] && xValue1) {
					regressionGraphs.graph1.push({
						[regressionData.regressionX1]: xValue1,
						[regressionData.regressionY]:
							flight.properties[regressionData.regressionY],
					});
				}
				if (flight.properties[regressionData.regressionY] && xValue2) {
					regressionGraphs.graph2.push({
						[regressionData.regressionX2]: xValue2,
						[regressionData.regressionY]:
							flight.properties[regressionData.regressionY],
					});
				}
				if (flight.properties[regressionData.regressionY] && xValue3) {
					regressionGraphs.graph3.push({
						[regressionData.regressionX3]: xValue3,
						[regressionData.regressionY]:
							flight.properties[regressionData.regressionY],
					});
				}
			}
		}
	}

	regressionGraphs.graph1 = regressionGraphs.graph1.sort(
		(a: { [x: string]: number }, b: { [x: string]: number }) =>
			a[regressionData.regressionX1] - b[regressionData.regressionX1],
	);
	regressionGraphs.graph2 = regressionGraphs.graph2.sort(
		(a: { [x: string]: number }, b: { [x: string]: number }) =>
			a[regressionData.regressionX2] - b[regressionData.regressionX2],
	);
	regressionGraphs.graph3 = regressionGraphs.graph3.sort(
		(a: { [x: string]: number }, b: { [x: string]: number }) =>
			a[regressionData.regressionX3] - b[regressionData.regressionX3],
	);

	// console.log("regressionGraphs", regressionGraphs);

	return regressionGraphs;
};
