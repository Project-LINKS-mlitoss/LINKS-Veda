import { type TypedResponse, json } from "@remix-run/node";
import * as turf from "@turf/turf";
import {
	type AggregationModeChartParam,
	type AggregationModeMapParam,
	type AggregationModeMapResponse,
	type AggregationPrefectureChartParam,
	type AggregationPrefectureMapParam,
	type AggregationPrefectureMapResponse,
	type AggregationRow,
	type DefinitionValue,
	type DetailRow,
	type ModeArcProperties,
	type ModeBarChartParam,
	type ModePieChartParam,
	ModePieChartTypes,
	type ModePointGroup,
	OptimizationTypes,
	type PrefectureArcProperties,
	type PrefectureBarChartParam,
	PrefectureBarChartTypes,
	type PrefectureBarProperties,
	type PrefectureEfficiencyCondition,
	type PrefecturePieChartParam,
	PrefecturePieChartTypes,
	type PrefectureProperties,
	type PrefectureTable,
	type PrefectureTableDetail,
	type PrefecturesParams,
	type RouteTable,
	type RouteTableDetail,
	type SearchMultimodalRouteMapResponse,
	type SearchMultimodalRouteParams,
	type SearchMultimodalRouteProperties,
	type ShipWaypointInformation,
	type TrainWaypointInformation,
	TransportEfficiencyTypes,
	TransportationTypes,
	type UC13_05_内航船舶輸送統計調査,
	type UC13_06_自動車輸送統計調査,
	type UC13_07_府県相互間輸送トン数表,
	type UC13_08_JR貨物輸送実績調査,
	type UC13_11_都道府県間距離一覧表,
	UFN001AllPrefectures,
	UFN001AllProducts,
	UFN001AllTransportationModes,
	type UFN001DefinitionResponse,
	UFN001PrefectureAll,
	UFN001ProductAll,
	UFN001TransportationModeAll,
	type UFN002DefinitionResponse,
	UFN002TransportationModeAll,
	type UnitizedBarChartData,
	type UnitizedPieChartData,
	type ValueUnit,
	YEAR_AXIS,
} from "~/models/useCase13";
import type { UseCase13Repository } from "~/repositories/useCase13Repository";
import type { ApiResponse } from "~/repositories/utils";
import { serializeWaypoint } from "./utils";

const BAR_WIDTH = 4.8;
const BAR_HEIGHT = 6;
const BAR_OFFSET = 2;

export class UseCase13Service {
	private usecaseRepository: UseCase13Repository;

	constructor(usecaseRepository: UseCase13Repository) {
		this.usecaseRepository = usecaseRepository;
	}

	async getUFN001Definitions(): Promise<
		TypedResponse<ApiResponse<UFN001DefinitionResponse>>
	> {
		try {
			const records =
				await this.usecaseRepository.getUC13_07_府県相互間輸送トン数表();

			// const modePoints = await Promise.all([
			// 	this.usecaseRepository.getUC13_05_内航船舶輸送統計調査_起点終点(),
			// 	this.usecaseRepository.getUC13_06_自動車輸送統計調査_起点終点(),
			// 	this.usecaseRepository.getUC13_08_JR貨物輸送実績調査_起点終点(),
			// ]);
			const modePoints: ModePointGroup[] = [];

			const data = {
				prefecturesAnalysis: {
					targetYears: Array.from(
						new Map(records.map((r) => [r.年度, r.年度])).values(),
					).sort(),
					modes: [{ name: UFN001TransportationModeAll, isAll: true }].concat(
						Array.from(
							new Map(
								records
									.filter((r) => r.モード !== UFN001TransportationModeAll)
									.map((r) => [r.モード, { name: r.モード, isAll: false }]),
							).values(),
						).sort(),
					),
					products: [{ name: UFN001ProductAll, isAll: true }].concat(
						Array.from(
							new Map(
								records
									.filter((r) => r.品目 !== UFN001ProductAll)
									.map((r) => [r.品目, { name: r.品目, isAll: false }]),
							).values(),
						).sort(),
					),
					transportEfficiencyConditions: prefectureEfficiencyConditions,
				},
				modeAnalysis: {
					points: modePoints.map((v) => v),
					conditions: [],
				},
			};

			return json({
				status: true,
				data: data,
			});
		} catch (e) {
			return json({
				status: false,
				error: (e as Error).message,
			});
		}
	}

	async getUFN002Definitions(): Promise<
		TypedResponse<ApiResponse<UFN002DefinitionResponse>>
	> {
		try {
			const originNames = await this.usecaseRepository.getOriginName();
			const destinationNames =
				await this.usecaseRepository.getDestinationName();
			const modes = await this.usecaseRepository.getTransportationMode();

			const data = {
				originNames: originNames,
				destinationNames: destinationNames,
				optimization: Object.values(OptimizationTypes).map((v) => {
					return { name: v, isAll: false };
				}),
				modes: [{ name: UFN002TransportationModeAll, isAll: true }].concat(
					Array.from(
						new Map(modes.map((v) => [v, { name: v, isAll: false }])).values(),
					).sort(),
				),
			};

			return json({
				status: true,
				data: data,
			});
		} catch (e) {
			return json({
				status: false,
				error: (e as Error).message,
			});
		}
	}

	async getPrefectures(
		params: PrefecturesParams,
	): Promise<
		TypedResponse<
			ApiResponse<
				GeoJSON.FeatureCollection<GeoJSON.Polygon, PrefectureProperties>
			>
		>
	> {
		try {
			const names = params.names.some((name) => name === UFN001PrefectureAll)
				? []
				: params.names;
			const result = await this.usecaseRepository.getPrefectures(names);

			return json({
				status: true,
				data: result,
			});
		} catch (e) {
			return json({
				status: false,
				error: (e as Error).message,
			});
		}
	}

	private createPrefectureLines(
		basePoints: string[],
		endPoints: string[],
		points: GeoJSON.FeatureCollection<GeoJSON.Point, PrefectureProperties>,
	): GeoJSON.FeatureCollection<GeoJSON.LineString, PrefectureProperties> {
		const prefecturePointMap = new Map<string, GeoJSON.Position>();

		if (!points.features) {
			return turf.featureCollection([]);
		}

		for (const feature of points.features) {
			if (feature.properties?.name) {
				prefecturePointMap.set(
					feature.properties.name,
					feature.geometry.coordinates,
				);
			}
		}

		const lineFeatures: GeoJSON.Feature<
			GeoJSON.LineString,
			PrefectureProperties
		>[] = [];

		for (const basePoint of basePoints) {
			const baseCoordinates = prefecturePointMap.get(basePoint);
			if (!baseCoordinates) continue;

			for (const endPoint of endPoints) {
				if (basePoint === endPoint) continue;

				const endCoordinates = prefecturePointMap.get(endPoint);
				if (!endCoordinates) continue;

				const properties: PrefectureProperties = {
					name: `${basePoint}-${endPoint}`,
				};

				lineFeatures.push(
					this.createArcFeature(
						baseCoordinates,
						endCoordinates,
						60,
						properties,
					),
				);
			}
		}

		return turf.featureCollection(lineFeatures);
	}

	async aggregatePrefectureMap(
		params: AggregationPrefectureMapParam,
	): Promise<TypedResponse<ApiResponse<AggregationPrefectureMapResponse>>> {
		try {
			// どちらかが全国指定なら全ての都道府県を取得、そうでなければ指定された都道府県のみ取得
			const isBaseAll = params.basePoints.some(
				(name) => name === UFN001PrefectureAll,
			);
			const isEndAll = params.endPoints.some(
				(name) => name === UFN001PrefectureAll,
			);
			const isAllMode = params.modes.some(
				(name) => name === UFN001TransportationModeAll,
			);
			const isAllProduct = params.products.some(
				(name) => name === UFN001ProductAll,
			);
			const names =
				params.basePoints.some((name) => name === UFN001PrefectureAll) ||
				params.endPoints.some((name) => name === UFN001PrefectureAll)
					? []
					: Array.from(
							new Map(
								params.basePoints.concat(params.endPoints).map((v) => [v, v]),
							).values(),
						);
			const points = await this.usecaseRepository.getPrefecturePoints(names);
			if (!points.features) {
				throw new Error("Prefecture points does not exists");
			}

			const internalParams: AggregationPrefectureMapParam = {
				...params,
				basePoints: isBaseAll ? UFN001AllPrefectures : params.basePoints,
				endPoints: isEndAll ? UFN001AllPrefectures : params.endPoints,
				modes: isAllMode ? UFN001AllTransportationModes : params.modes,
				products: isAllProduct ? UFN001AllProducts : params.products,
			};

			const quantityRecords =
				await this.usecaseRepository.getUC13_07_府県相互間輸送トン数表();
			if (quantityRecords.length === 0) {
				throw new Error("quantityRecords does not exists");
			}

			const quantityRows = this.getFlowRows(internalParams, quantityRecords);
			const quantityAggregation = this.createAggregation(
				internalParams,
				quantityRows,
			);

			const distanceRecords =
				await this.usecaseRepository.getUC13_11_都道府県間距離一覧表();
			if (distanceRecords.length === 0) {
				throw new Error("distanceRecords does not exists");
			}
			const transportDistance = this.createTransportDistance(
				internalParams,
				distanceRecords,
			);

			const co2Records =
				await this.usecaseRepository.getUC13_12_都道府県間CO2排出量();
			if (co2Records.length === 0) {
				throw new Error("co2Records does not exists");
			}
			const co2Rows = this.getFlowRows(internalParams, co2Records);
			const co2Aggregation = this.createAggregation(internalParams, co2Rows);

			const detailRows = await this.getDetailRow(internalParams, true);
			const details = this.createAggregationDetail(internalParams, detailRows);

			const source = this.usecaseRepository.getPrefectureSource();

			const lines = this.createPrefectureLines(
				internalParams.basePoints,
				internalParams.endPoints,
				points,
			);

			const table = this.createPrefectureTable(
				quantityAggregation,
				transportDistance,
				co2Aggregation,
				details,
				internalParams,
			);

			return json({
				status: true,
				data: {
					source: source,
					table: table,
					bars: this.createBarFeatures(
						points.features,
						quantityAggregation,
						internalParams,
					),
					lines,
				},
			});
		} catch (e) {
			return json({
				status: false,
				error: (e as Error).message,
			});
		}
	}

	async aggregateModeMap(
		params: AggregationModeMapParam,
	): Promise<TypedResponse<ApiResponse<AggregationModeMapResponse>>> {
		try {
			let data: GeoJSON.FeatureCollection<
				GeoJSON.LineString,
				ModeArcProperties
			>[] = [];
			switch (params.mode) {
				case TransportationTypes.海運: {
					const records =
						await this.usecaseRepository.getUC13_05_内航船舶輸送統計調査();
					data = this.createMarineArcFeatures(records, params);
					break;
				}
				case TransportationTypes.自動車: {
					const records =
						await this.usecaseRepository.getUC13_06_自動車輸送統計調査();
					data = this.createCarArcFeatures(records, params);
					break;
				}
				case TransportationTypes.鉄道: {
					const records =
						await this.usecaseRepository.getUC13_08_JR貨物輸送実績調査();
					data = this.createTrainArcFeatures(records, params);
					break;
				}
				default:
					throw new Error(`Unknown mode: ${params.mode}`);
			}

			return json({
				status: true,
				data: {
					arcs: data,
				},
			});
		} catch (e) {
			return json({
				status: false,
				error: (e as Error).message,
			});
		}
	}

	async aggregatePrefectureChart(
		params: AggregationPrefectureChartParam,
	): Promise<
		TypedResponse<ApiResponse<UnitizedPieChartData | UnitizedBarChartData>>
	> {
		const records =
			await this.usecaseRepository.getUC13_07_府県相互間輸送トン数表();
		if (records.length === 0) {
			throw new Error("Records does not exists");
		}

		const isBaseAll = params.params.basePoints.some(
			(name) => name === UFN001PrefectureAll,
		);
		const isEndAll = params.params.endPoints.some(
			(name) => name === UFN001PrefectureAll,
		);
		const isAllMode = params.params.modes.some(
			(name) => name === UFN001TransportationModeAll,
		);
		const isAllProduct = params.params.products.some(
			(name) => name === UFN001ProductAll,
		);

		const internalParams: AggregationPrefectureMapParam = {
			...params.params,
			basePoints: isBaseAll ? UFN001AllPrefectures : params.params.basePoints,
			endPoints: isEndAll ? UFN001AllPrefectures : params.params.endPoints,
			modes: isAllMode ? UFN001AllTransportationModes : params.params.modes,
			products: isAllProduct ? UFN001AllProducts : params.params.products,
		};

		let data: UnitizedPieChartData | UnitizedBarChartData;
		switch (params.chartType) {
			case "pie":
				data = this.aggregatePrefecturePieChart(
					records,
					internalParams as PrefecturePieChartParam,
				);
				break;
			case "bar":
				data = await this.aggregatePrefectureBarChart(
					records,
					internalParams as PrefectureBarChartParam,
				);
				break;
			default:
				throw new Error(`Unknown chart type: ${params.chartType}`);
		}

		try {
			return json({
				status: true,
				data: data,
			});
		} catch (e) {
			return json({
				status: false,
				error: (e as Error).message,
			});
		}
	}

	async aggregateModeChart(
		params: AggregationModeChartParam,
	): Promise<
		TypedResponse<ApiResponse<UnitizedPieChartData | UnitizedBarChartData>>
	> {
		let data: UnitizedPieChartData | UnitizedBarChartData = {
			data: [],
			unit: "",
		};
		switch (params.chartType) {
			case "pie":
				data = this.aggregateModePieChart(params.params as ModePieChartParam);
				break;
			case "bar":
				data = await this.aggregateModeBarChart(
					params.params as ModeBarChartParam,
				);
				break;
			default:
				throw new Error(`Unknown chart type: ${params.chartType}`);
		}

		try {
			return json({
				status: true,
				data: data,
			});
		} catch (e) {
			return json({
				status: false,
				error: (e as Error).message,
			});
		}
	}

	aggregatePrefecturePieChart(
		records: UC13_07_府県相互間輸送トン数表[],
		internalParams: PrefecturePieChartParam,
	): UnitizedPieChartData {
		const flowRows = this.getFlowRows(internalParams, records);
		const aggregation = this.createAggregation(internalParams, flowRows);

		switch (internalParams.attribute) {
			case PrefecturePieChartTypes.品目区分:
				return this.createPieChartData4Product(aggregation, internalParams);
			case PrefecturePieChartTypes.モード: {
				return this.createPieChartData4Mode(aggregation, internalParams);
			}
			case PrefecturePieChartTypes["品目区分×モード"]: {
				return this.createPieChartData4ProductMode(aggregation, internalParams);
			}
			default:
				throw new Error(`Unknown pie chart type: ${internalParams.attribute}`);
		}
	}

	async aggregatePrefectureBarChart(
		records: UC13_07_府県相互間輸送トン数表[],
		internalParams: PrefectureBarChartParam,
	): Promise<UnitizedBarChartData> {
		const flowRows = this.getFlowRows(internalParams, records);
		const aggregation = this.createAggregation(
			internalParams,
			flowRows,
			internalParams.xAxis === "終点（都道府県別）",
		);

		switch (internalParams.attribute) {
			case PrefectureBarChartTypes.品目区分:
				return this.createBarChartData4Product(aggregation, internalParams);
			case PrefectureBarChartTypes.モード: {
				return this.createBarChartData4Mode(aggregation, internalParams);
			}
			case PrefectureBarChartTypes.平均_積載率: {
				const detailRows = await this.getDetailRow(internalParams);
				const details = this.createAggregationDetail(
					internalParams,
					detailRows,
				);
				return this.createBarChartData4LoadingRatio(details, internalParams);
			}
			default:
				throw new Error(`Unknown bar chart type: ${internalParams.attribute}`);
		}
	}

	aggregateModePieChart(
		internalParams: ModePieChartParam,
	): UnitizedPieChartData {
		switch (internalParams.attribute) {
			case ModePieChartTypes.輸送用途:
				return {
					data: [],
					unit: "",
				};
			default:
				throw new Error(`Unknown pie chart type: ${internalParams.attribute}`);
		}
	}

	async aggregateModeBarChart(
		internalParams: ModeBarChartParam,
	): Promise<UnitizedBarChartData> {
		return {
			data: [],
			unit: "",
		};
	}

	createPieChartData4Product(
		aggregation: Aggregation,
		internalParams: PrefecturePieChartParam,
	): UnitizedPieChartData {
		const data = new Map<string, number>();

		for (const yearKey of internalParams.years) {
			const year = aggregation.get(yearKey);
			if (!year) {
				continue;
			}
			for (const point of year.getPoints()) {
				for (const mode of point.modes()) {
					for (const product of mode.products()) {
						const key = product.getProduct();
						const value = product.getValue();
						const v = data.get(key) ?? 0;
						data.set(key, v + value);
					}
				}
			}
		}

		return {
			data: Array.from(this.toPercent(data).entries())
				.filter(([key, value]) => value > 0)
				.map(([key, value]) => ({
					name: key,
					value: value,
				}))
				.sort((a, b) => b.value - a.value),
			unit: "%",
		};
	}

	createPieChartData4Mode(
		aggregation: Aggregation,
		internalParams: PrefecturePieChartParam,
	): UnitizedPieChartData {
		const data = new Map<string, number>();

		let all = 0;
		for (const yearKey of internalParams.years) {
			const year = aggregation.get(yearKey);
			if (!year) {
				continue;
			}
			for (const point of year.getPoints()) {
				all += point.getTotal();
				for (const mode of point.modes()) {
					const key = mode.getName();
					const value = mode.getTotal();
					const d = data.get(key) ?? 0;
					data.set(key, d + value);
				}
			}
		}

		if (all === 0) {
			throw new Error("All is 0");
		}

		return {
			data: Array.from(data.entries())
				.filter(([key, value]) => value > 0)
				.map(([key, value]) => ({
					name: key,
					value: (value / all) * 100,
				}))
				.sort((a, b) => b.value - a.value),
			unit: "%",
		};
	}

	createPieChartData4ProductMode(
		aggregation: Aggregation,
		internalParams: PrefecturePieChartParam,
	): UnitizedPieChartData {
		const data = new Map<string, number>();

		let all = 0;
		for (const yearKey of internalParams.years) {
			const year = aggregation.get(yearKey);
			if (!year) {
				continue;
			}
			for (const point of year.getPoints()) {
				all += point.getTotal();
				for (const mode of point.modes()) {
					for (const product of mode.products()) {
						const key = `${mode.getName()}_${product.getProduct()}`;
						const value = product.getValue();
						const d = data.get(key) ?? 0;
						data.set(key, d + value);
					}
				}
			}
		}

		if (all === 0) {
			throw new Error("All is 0");
		}

		return {
			data: Array.from(data.entries())
				.filter(([key, value]) => value > 0)
				.map(([key, value]) => ({
					name: key,
					value: (value / all) * 100,
				}))
				.sort((a, b) => b.value - a.value),
			unit: "%",
		};
	}

	toPercent(map: Map<string, number>): Map<string, number> {
		const total = Array.from(map.values()).reduce((acc, cur) => acc + cur, 0);
		const result = new Map<string, number>();
		for (const [key, value] of map.entries()) {
			result.set(key, (value / total) * 100);
		}

		return result;
	}

	createBarChartData4Product(
		aggregation: Aggregation,
		internalParams: PrefectureBarChartParam,
	): UnitizedBarChartData {
		const results: UnitizedBarChartData = { data: [], unit: "t" };

		for (const yearKey of internalParams.years) {
			const year = aggregation.get(yearKey);
			if (!year) {
				continue;
			}

			if (internalParams.xAxis === YEAR_AXIS) {
				const combinedXAxis = new BarChartDataXAxis(yearKey.toString());

				for (const point of year.getPoints()) {
					for (const modeKey of internalParams.modes) {
						const mode = point.getMode(modeKey);
						for (const productKey of internalParams.products) {
							const value = mode?.getProduct(productKey)?.getValue() ?? 0;
							combinedXAxis.add(productKey, value);
						}
					}
				}

				if (combinedXAxis.getTotal() > 0) {
					results.data.push({
						name: String(yearKey),
						value: combinedXAxis.getTotal(),
						...Object.fromEntries(combinedXAxis),
					});
				}
			} else {
				const data = new Map<string, BarChartDataXAxis>();

				for (const point of year.getPoints()) {
					const key = point.getName();
					const xAxis = data.get(key) ?? new BarChartDataXAxis(key);
					data.set(key, xAxis);

					for (const modeKey of internalParams.modes) {
						const mode = point.getMode(modeKey);
						for (const productKey of internalParams.products) {
							const value = mode?.getProduct(productKey)?.getValue();
							xAxis.add(productKey, value ?? 0);
						}
					}
				}

				const pointData = Array.from(data.entries())
					.filter(([_, xAxis]) => xAxis.getTotal() > 0)
					.map(([key, xAxis]) => ({
						name: key,
						value: xAxis.getTotal(),
						...Object.fromEntries(xAxis),
					}));

				results.data.push(...pointData);
			}
		}

		return results;
	}

	createBarChartData4Mode(
		aggregation: Aggregation,
		internalParams: PrefectureBarChartParam,
	): UnitizedBarChartData {
		const results: UnitizedBarChartData = { data: [], unit: "t" };

		for (const yearKey of internalParams.years) {
			const year = aggregation.get(yearKey);
			if (!year) {
				continue;
			}

			if (internalParams.xAxis === YEAR_AXIS) {
				const combinedXAxis = new BarChartDataXAxis(yearKey.toString());

				for (const point of year.getPoints()) {
					for (const modeKey of internalParams.modes) {
						const mode = point.getMode(modeKey);
						for (const productKey of internalParams.products) {
							const value = mode?.getProduct(productKey)?.getValue() ?? 0;
							combinedXAxis.add(modeKey, value);
						}
					}
				}

				if (combinedXAxis.getTotal() > 0) {
					results.data.push({
						name: String(yearKey),
						value: combinedXAxis.getTotal(),
						...Object.fromEntries(combinedXAxis),
					});
				}
			} else {
				const data = new Map<string, BarChartDataXAxis>();

				for (const point of year.getPoints()) {
					const key = point.getName();
					const xAxis = data.get(key) ?? new BarChartDataXAxis(key);
					data.set(key, xAxis);

					for (const modeKey of internalParams.modes) {
						const mode = point.getMode(modeKey);
						for (const productKey of internalParams.products) {
							const value = mode?.getProduct(productKey)?.getValue() ?? 0;
							xAxis.add(modeKey, value);
						}
					}
				}

				const pointData = Array.from(data.entries())
					.filter(([_, xAxis]) => xAxis.getTotal() > 0)
					.map(([key, xAxis]) => ({
						name: key,
						value: xAxis.getTotal(),
						...Object.fromEntries(xAxis),
					}));

				results.data.push(...pointData);
			}
		}

		return results;
	}

	async createBarChartData4LoadingRatio(
		detailMap: Map<number, AggregationDetailYear>,
		internalParams: PrefectureBarChartParam,
	): Promise<UnitizedBarChartData> {
		const results: UnitizedBarChartData = { data: [], unit: "%" };

		for (const yearKey of internalParams.years) {
			const year = detailMap.get(yearKey);
			if (!year) {
				continue;
			}

			if (internalParams.xAxis === YEAR_AXIS) {
				const combinedXAxis = new BarChartDataXAxis(yearKey.toString());

				for (const point of year.getPoints()) {
					for (const modeKey of internalParams.modes) {
						const mode = point.getMode(modeKey);
						combinedXAxis.add(modeKey, mode ? mode.getLoadingRatio() : 0);
					}
				}

				if (combinedXAxis.getTotal() > 0) {
					results.data.push({
						name: String(yearKey),
						value: combinedXAxis.getTotal(),
						...Object.fromEntries(combinedXAxis),
					});
				}
			} else {
				const data = new Map<string, BarChartDataXAxis>();

				for (const point of year.getPoints()) {
					const key = point.getName();
					const xAxis = data.get(key) ?? new BarChartDataXAxis(key);
					data.set(key, xAxis);
					for (const modeKey of internalParams.modes) {
						const mode = point.getMode(modeKey);
						xAxis.add(modeKey, mode ? mode.getLoadingRatio() : 0);
					}
				}

				const pointData = Array.from(data.entries())
					.filter(([_, xAxis]) => xAxis.getTotal() > 0)
					.map(([key, xAxis]) => ({
						name: key,
						value: xAxis.getTotal(),
						...Object.fromEntries(xAxis),
					}));

				results.data.push(...pointData);
			}
		}

		return results;
	}

	async getIndexedWaypointInformation(
		params: SearchMultimodalRouteParams,
		featureCollection: GeoJSON.FeatureCollection<
			GeoJSON.LineString | GeoJSON.MultiLineString,
			SearchMultimodalRouteProperties
		>,
	) {
		const modes = params.modes;
		const modeMap = modes.reduce(
			(res, mode) => {
				const all = mode === UFN002TransportationModeAll;
				return {
					train: res.train || all || mode.includes("列車"),
					ship: res.ship || all || mode.includes("船"),
				};
			},
			{ train: false, ship: false },
		);
		const [trainStats, shipStats] = await Promise.all([
			modeMap.train
				? this.usecaseRepository.getUC13_08_JR貨物輸送実績調査()
				: undefined,
			modeMap.ship
				? this.usecaseRepository.getUC13_05_内航船舶輸送統計調査()
				: undefined,
		]);

		const generateIndex = (properties: SearchMultimodalRouteProperties) => {
			const p1 = properties.waypointName_1;
			const p2 = properties.waypointName_2;
			if (!p1 || !p2) {
				return;
			}
			const serializedP1 = serializeWaypoint(p1);
			const serializedP2 = serializeWaypoint(p2);
			return serializedP1 + serializedP2;
		};

		const trainWaypointsKeySet: Set<string> = new Set();
		const shipWaypointsKeySet: Set<string> = new Set();
		for (const feature of featureCollection.features) {
			const m2 = feature.properties.waypointMode_2;
			const idx = generateIndex(feature.properties);
			if (!idx) continue;
			if ("列車" === m2) {
				trainWaypointsKeySet.add(idx);
			}
			if ("船" === m2) {
				shipWaypointsKeySet.add(idx);
			}
		}

		const trainWaypointsKeyMap: Map<string, TrainWaypointInformation> =
			new Map();
		const shipWaypointsKeyMap: Map<string, ShipWaypointInformation> = new Map();

		if (trainStats) {
			for (const stat of trainStats) {
				const p1 = stat.発駅名;
				const p2 = stat.着駅名;
				const key = p1 + p2;
				if (!trainWaypointsKeySet.has(key)) {
					continue;
				}
				if (trainWaypointsKeyMap.has(key)) {
					continue;
				}

				trainWaypointsKeyMap.set(key, {
					type: "train",
					純平日一日あたり平均駅間輸送量: stat.純平日一日あたり平均駅間輸送量,
					発駅_積載率: stat.発駅_積載率 * 100,
					発駅_輸送力: stat.発駅_輸送力,
					発駅_発トン数_コンテナ: stat.発駅_発トン数_コンテナ,
					発駅_発トン数_車扱: stat.発駅_発トン数_車扱,
				});
			}
		}
		if (shipStats) {
			for (const stat of shipStats) {
				const p1 = stat.積地_港名;
				const p2 = stat.揚地_港名;
				const key = p1 + p2;
				if (!shipWaypointsKeySet.has(key)) {
					continue;
				}
				if (shipWaypointsKeyMap.has(key)) {
					continue;
				}
				shipWaypointsKeyMap.set(key, {
					type: "ship",
					サンプル数: stat.サンプル数,
					平均_総トン数: stat.平均_総トン数,
					平均_載貨重量トン数: stat.平均_載貨重量トン数,
					平均_積載率: stat.平均_積載率,
					平均_貨物の重量: stat.平均_貨物の重量,
				});
			}
		}

		return {
			indexedData: [
				trainStats ? trainWaypointsKeyMap : undefined,
				shipStats ? shipWaypointsKeyMap : undefined,
			],
			generateIndex,
		};
	}

	async searchMultimodalRoute(
		params: SearchMultimodalRouteParams,
	): Promise<TypedResponse<ApiResponse<SearchMultimodalRouteMapResponse>>> {
		try {
			const result = await this.usecaseRepository.searchMultimodalRoute(params);

			const uniqueFeatureSet = new Set();
			const uniqueFeatures = [];
			for (const feature of result.features) {
				const properties = feature.properties;

				const key = [
					properties.originName,
					properties.destinationName,
					properties.transportationMode,
					properties.totalTime.toFixed(2),
				].join("");
				if (uniqueFeatureSet.has(key)) {
					continue;
				}
				uniqueFeatureSet.add(key);

				properties.waypointCO2_1 = this.calculateCO2(
					properties.waypointMode_1,
					properties.waypointDistance_1,
					params.quantity,
				);
				properties.waypointCO2_2 = this.calculateCO2(
					properties.waypointMode_2,
					properties.waypointDistance_2,
					params.quantity,
				);
				properties.waypointCO2_3 = this.calculateCO2(
					properties.waypointMode_3,
					properties.waypointDistance_3,
					params.quantity,
				);
				properties.waypointCO2_4 = this.calculateCO2(
					properties.waypointMode_4,
					properties.waypointDistance_4,
					params.quantity,
				);
				properties.waypointCO2_5 = this.calculateCO2(
					properties.waypointMode_5,
					properties.waypointDistance_5,
					params.quantity,
				);
				// 経路全体のCO2排出量
				properties.totalCO2 =
					properties.waypointCO2_1 ||
					properties.waypointCO2_2 ||
					properties.waypointCO2_3 ||
					properties.waypointCO2_4 ||
					properties.waypointCO2_5
						? (properties.waypointCO2_1 ?? 0) +
							(properties.waypointCO2_2 ?? 0) +
							(properties.waypointCO2_3 ?? 0) +
							(properties.waypointCO2_4 ?? 0) +
							(properties.waypointCO2_5 ?? 0)
						: this.calculateCO2(
								properties.transportationMode,
								properties.totalDistance,
								params.quantity,
							) ?? 0;

				uniqueFeatures.push(feature);
			}

			result.features = uniqueFeatures;

			const {
				indexedData: [trainWaypointsKeyMap, shipWaypointsKeyMap],
				generateIndex,
			} = await this.getIndexedWaypointInformation(params, result);

			const table: RouteTable[] = [];
			for (let i = 0; i < result.features.length; i++) {
				const feature = result.features[i];
				const routeTable: RouteTable = {
					No: i + 1,
					交通モード: feature.properties.transportationMode,
					総所要時間: feature.properties.totalTime,
					総距離: feature.properties.totalDistance,
					総CO2発生量: feature.properties.totalCO2,
					details: [],
				};

				const idxForWaypointInformation = generateIndex(feature.properties);
				if (idxForWaypointInformation) {
					const m2 = feature.properties.waypointMode_2;
					if (trainWaypointsKeyMap && "列車" === m2) {
						routeTable.waypointInformation = trainWaypointsKeyMap.get(
							idxForWaypointInformation,
						);
					}
					if (shipWaypointsKeyMap && "船" === m2) {
						routeTable.waypointInformation = shipWaypointsKeyMap.get(
							idxForWaypointInformation,
						);
					}
				}

				table.push(routeTable);

				let nextOriginName = feature.properties.originName;
				for (let ii = 1; ii <= 5; ii++) {
					const properties = feature.properties;
					if (!properties) {
						continue;
					}
					const propertyMap = new Map(Object.entries(properties));
					if (!propertyMap) {
						continue;
					}
					const destinationName = propertyMap.get(`waypointName_${ii}`) ?? "";
					if (destinationName === "") {
						break;
					}
					const mode = propertyMap.get(`waypointMode_${ii}`)?.toString() ?? "";
					const detail: RouteTableDetail = {
						originName: nextOriginName,
						destinationName: destinationName.toString(),
						交通モード: mode,
						所要時間: {
							value: propertyMap.get(`waypointTime_${ii}`)
								? Number(propertyMap.get(`waypointTime_${ii}`))
								: 0,
							unit: mode.includes("トラック") ? "分" : "時間",
						},
						距離: {
							value: propertyMap.get(`waypointDistance_${ii}`)
								? Number(propertyMap.get(`waypointDistance_${ii}`))
								: 0,
							unit: "km",
						},
						CO2発生量: {
							value: propertyMap.get(`waypointCO2_${ii}`)
								? Number(propertyMap.get(`waypointCO2_${ii}`))
								: 0,
							unit: "kg",
						},
					};
					routeTable.details.push(detail);
					nextOriginName = destinationName.toString();
				}

				if (routeTable.details.length === 0) {
					const mode = feature.properties.transportationMode;
					const detail: RouteTableDetail = {
						originName: feature.properties.originName,
						destinationName: feature.properties.destinationName,
						交通モード: mode,
						所要時間: {
							value: feature.properties.totalTime,
							unit: mode.includes("トラック") ? "分" : "時間",
						},
						距離: {
							value: feature.properties.totalDistance,
							unit: "km",
						},
						CO2発生量: {
							value: feature.properties.totalCO2,
							unit: "kg",
						},
					};
					routeTable.details.push(detail);
				}
			}

			return json({
				status: true,
				data: {
					table: table,
					routes: result,
				},
			});
		} catch (e) {
			return json({
				status: false,
				error: (e as Error).message,
			});
		}
	}

	private calculateCO2(
		mode: string | null | undefined,
		distance: number | null | undefined,
		quantity: number,
	): number | null {
		if (!mode || !distance) {
			return null;
		}

		let unit = 0;
		// 単位あたりのCO2排出量（g-CO2/トン・km）
		// https://www.mlit.go.jp/sogoseisaku/environment/sosei_environment_tk_000007.html
		switch (mode) {
			case "トラック":
			case "トラックのみ":
				unit = 208;
				break;
			case "列車":
				unit = 23;
				break;
			case "船":
				unit = 10;
				break;
			default:
				throw new Error(`Unknown mode: ${mode}`);
		}
		return (quantity * unit * distance) / 1000;
	}

	private getFlowRows(
		internalParams: AggregationPrefectureMapParam,
		data: UC13_07_府県相互間輸送トン数表[],
	): AggregationRow[] {
		const filteredMap = data
			.filter(
				(d) =>
					internalParams.years.includes(d.年度) &&
					internalParams.basePoints.includes(d.発) &&
					internalParams.modes.includes(d.モード) &&
					internalParams.products.includes(d.品目),
			)
			.map((d) => new Map(Object.entries(d)));

		const rows: AggregationRow[] = [];
		for (const d of filteredMap) {
			for (const endPoint of internalParams.endPoints) {
				rows.push({
					year: Number(d.get("年度")) ?? 0,
					basePoint: d.get("発")?.toString() ?? "",
					endPoint: endPoint,
					mode: d.get("モード")?.toString() ?? "",
					product: d.get("品目")?.toString() ?? "",
					value: !Number.isNaN(d.get(`${endPoint}_着`))
						? Number(d.get(`${endPoint}_着`))
						: 0,
				});
			}
		}

		return rows;
	}

	private createAggregation(
		internalParams: AggregationPrefectureMapParam,
		rows: AggregationRow[],
		defaultIsEndPoint?: boolean,
	): Aggregation {
		// 指定が多い方を地図に表示する (どちらも1つのときはTo側を表示)
		const isEndPoint =
			defaultIsEndPoint ?? internalParams.basePoints.length === 1;
		const aggregation = new Aggregation();
		for (const row of rows) {
			const yearKey = row.year;
			let year = aggregation.get(yearKey);
			if (!year) {
				year = new AggregationYear(yearKey);
				aggregation.set(yearKey, year);
			}

			const pointKey = isEndPoint ? row.endPoint : row.basePoint;
			let point = year.get(pointKey);
			if (!point) {
				point = new AggregationPoint(pointKey);
				year.set(pointKey, point);
			}

			let mode = point.get(row.mode);
			if (!mode) {
				mode = new AggregationMode(row.mode);
				point.set(row.mode, mode);
			}

			let product = mode.get(row.product);
			if (!product) {
				product = new AggregationProduct(row.product);
				mode.set(row.product, product);
			}

			product.add(row.value);
		}

		return aggregation;
	}

	private async getDetailRow(
		internalParams: AggregationPrefectureMapParam,
		enableEfficiency = false,
	): Promise<DetailRow[]> {
		const isAll = internalParams.endPoints.some(
			(name) => name === UFN001PrefectureAll,
		);
		let rows: DetailRow[] = [];
		if (internalParams.modes.some((m) => m === TransportationTypes.海運)) {
			const records =
				await this.usecaseRepository.getUC13_05_内航船舶輸送統計調査();
			if (records.length === 0) {
				throw new Error("Marine records does not exists");
			}
			rows = rows.concat(
				this.getMarineDetail(
					records.filter(
						(d) =>
							internalParams.years.includes(d.年度) &&
							internalParams.basePoints.includes(d.積地_都道府県名) &&
							internalParams.endPoints.includes(d.揚地_都道府県名),
					),
					enableEfficiency ? internalParams : undefined,
				),
			);
		}
		if (internalParams.modes.some((m) => m === TransportationTypes.自動車)) {
			const records =
				await this.usecaseRepository.getUC13_06_自動車輸送統計調査();
			if (records.length === 0) {
				throw new Error("Car records does not exists");
			}
			rows = rows.concat(
				this.getCarDetail(
					records.filter(
						(d) =>
							internalParams.years.includes(d.調査年) &&
							internalParams.basePoints.includes(d.都道府県名_発地) &&
							internalParams.endPoints.includes(d.都道府県名_着地),
					),
					enableEfficiency ? internalParams : undefined,
				),
			);
		}
		if (internalParams.modes.some((m) => m === TransportationTypes.鉄道)) {
			const records =
				await this.usecaseRepository.getUC13_08_JR貨物輸送実績調査();
			if (records.length === 0) {
				throw new Error("Train records does not exists");
			}
			rows = rows.concat(
				this.getTrainDetail(
					records.filter(
						(d) =>
							internalParams.years.includes(d.年度) &&
							internalParams.basePoints.includes(d.発駅_都道府県名) &&
							internalParams.endPoints.includes(d.着駅_都道府県名),
					),
					enableEfficiency ? internalParams : undefined,
				),
			);
		}

		return rows;
	}

	private getMarineDetail(
		filteredRecords: UC13_05_内航船舶輸送統計調査[],
		internalParams: AggregationPrefectureMapParam | undefined,
	): DetailRow[] {
		const definitions: DefinitionValue[] = [];
		const efficienc = internalParams?.transportEfficiencies.find(
			(c) => c.type === TransportationTypes.海運,
		);
		if (efficienc) {
			const condtionMap = prefectureMarineEfficiencyConditions.find(
				(c) => c.name === efficienc.condtion.name,
			);
			for (const id of efficienc.condtion.ids) {
				const def = condtionMap?.values.get(id);
				if (def) {
					definitions.push(def);
				}
			}
		}

		const rows: DetailRow[] = [];
		for (const d of filteredRecords) {
			if (!isFitCondition(definitions, d.平均_総トン数)) {
				continue;
			}
			rows.push({
				year: d.年度,
				basePoint: d.積地_都道府県名,
				endPoint: d.揚地_都道府県名,
				mode: TransportationTypes.海運,
				capacity: d.平均_総トン数 * d.サンプル数,
				actual: d.平均_総トン数 * d.平均_積載率 * d.サンプル数,
				ratio: d.平均_積載率,
			});
		}

		return rows;
	}

	private getCarDetail(
		filteredRecords: UC13_06_自動車輸送統計調査[],
		internalParams: AggregationPrefectureMapParam | undefined,
	): DetailRow[] {
		const definitions: DefinitionValue[] = [];
		const efficienc = internalParams?.transportEfficiencies.find(
			(c) => c.type === TransportationTypes.自動車,
		);
		if (efficienc) {
			const condtionMap = prefectureMarineEfficiencyConditions.find(
				(c) => c.name === efficienc.condtion.name,
			);
			for (const id of efficienc.condtion.ids) {
				const def = condtionMap?.values.get(id);
				if (def) {
					definitions.push(def);
				}
			}
		}

		const rows: DetailRow[] = [];
		for (const d of filteredRecords) {
			if (!isFitCondition(definitions, d["平均_最大積載量（kg）"])) {
				continue;
			}
			rows.push({
				year: d.調査年,
				basePoint: d.都道府県名_発地,
				endPoint: d.都道府県名_着地,
				mode: TransportationTypes.自動車,
				capacity: d["平均_最大積載量（kg）"] * d.サンプル数,
				actual:
					d["平均_最大積載量（kg）"] * d.平均_輸送当たり積載率 * d.サンプル数,
				ratio: d.平均_輸送当たり積載率,
			});
		}

		return rows;
	}

	private getTrainDetail(
		filteredRecords: UC13_08_JR貨物輸送実績調査[],
		internalParams: AggregationPrefectureMapParam | undefined,
	): DetailRow[] {
		const definitions: DefinitionValue[] = [];
		const efficienc = internalParams?.transportEfficiencies.find(
			(c) => c.type === TransportationTypes.鉄道,
		);
		if (efficienc) {
			const condtionMap = prefectureMarineEfficiencyConditions.find(
				(c) => c.name === efficienc.condtion.name,
			);
			for (const id of efficienc.condtion.ids) {
				const def = condtionMap?.values.get(id);
				if (def) {
					definitions.push(def);
				}
			}
		}

		const rows: DetailRow[] = [];
		for (const d of filteredRecords) {
			if (!isFitCondition(definitions, d.発駅_輸送力)) {
				continue;
			}
			rows.push({
				year: d.年度,
				basePoint: d.発駅_都道府県名,
				endPoint: d.着駅_都道府県名,
				mode: TransportationTypes.鉄道,
				capacity: d.発駅_輸送力,
				actual: d.発駅_積載個数,
				ratio: d.発駅_積載率 * 100,
			});
		}

		return rows;
	}

	private createTransportDistance(
		internalParams: AggregationPrefectureMapParam,
		records: UC13_11_都道府県間距離一覧表[],
	): TransportDistance {
		// 指定が多い方を地図に表示する (どちらも1つのときはTo側を表示)
		const isEndPoint = internalParams.basePoints.length === 1;
		const transportDistance: TransportDistance = new TransportDistance();
		for (const d of records) {
			if (
				internalParams.basePoints.includes(d.発) &&
				internalParams.endPoints.includes(d.着)
			) {
				transportDistance.add(isEndPoint ? d.着 : d.発, d.距離);
			}
		}

		return transportDistance;
	}

	private createAggregationDetail(
		internalParams: AggregationPrefectureMapParam,
		rows: DetailRow[],
	): Map<number, AggregationDetailYear> {
		// 指定が多い方を地図に表示する (どちらも1つのときはTo側を表示)
		const isEndPoint = internalParams.basePoints.length === 1;
		const map = new Map<number, AggregationDetailYear>();
		for (const row of rows) {
			const modeKey = row.mode;
			const capacity = row.capacity;
			const actual = row.actual;
			const ratio = row.ratio;

			let year = map.get(row.year);
			if (!year) {
				year = new AggregationDetailYear(row.year);
				map.set(row.year, year);
			}

			const pointKey = isEndPoint ? row.endPoint : row.basePoint;
			let point = year.get(pointKey);
			if (!point) {
				point = new AggregationDetailPoint(pointKey);
				year.set(pointKey, point);
			}

			let mode = point.get(modeKey);
			if (!mode) {
				mode = new AggregationDetailMode(row.mode);
				point.set(row.mode, mode);
			}

			mode.add(capacity ?? 0, actual ?? 0, ratio ?? 0);
		}

		return map;
	}

	private createPrefectureTable(
		quantityAggregation: Aggregation,
		transportDistance: TransportDistance,
		co2Aggregation: Aggregation,
		detailMap: Map<number, AggregationDetailYear>,
		internalParams: AggregationPrefectureMapParam,
	): PrefectureTable[] {
		const isEndPoint = internalParams.basePoints.length === 1;
		const prefectureTableMap: Map<string, PrefectureTable> = new Map();
		const capacityUnitMap = new Map<string, string>([
			[TransportationTypes.海運, "t"],
			[TransportationTypes.鉄道, "t"],
			[TransportationTypes.自動車, "kg"],
		]);

		for (const basePoint of internalParams.basePoints) {
			for (const endPoint of internalParams.endPoints) {
				for (const product of internalParams.products) {
					prefectureTableMap.set(`${basePoint}_${endPoint}_${product}`, {
						起点: basePoint,
						終点: endPoint,
						品目区分: product,
						details: [],
					});
				}
			}
		}

		for (const yearKey of internalParams.years) {
			const year = quantityAggregation.get(yearKey);
			const co2Year = co2Aggregation.get(yearKey);
			const detailYear = detailMap.get(yearKey);
			if (!year) {
				continue;
			}

			for (const point of year.getPoints()) {
				const detailPoint = detailYear?.get(point.getName());
				const co2Point = co2Year?.get(point.getName());

				const loadingRatioMap = new Map<string, ValueUnit>();
				const capacityMap = new Map<string, ValueUnit>();
				for (const modeKey of internalParams.modes) {
					loadingRatioMap.set(modeKey, {
						value: detailPoint?.getModeLoadingRatio(modeKey) ?? 0,
						unit: "%",
					});

					capacityMap.set(modeKey, {
						value: detailPoint?.getModeCapacity(modeKey) ?? 0,
						unit: capacityUnitMap.get(modeKey) ?? "",
					});
				}

				const totalMap = new Map<string, ValueUnit>();
				for (const productKey of internalParams.products) {
					totalMap.set(productKey, {
						value: point.getProductTotal(productKey) ?? 0,
						unit: "t",
					});
				}

				for (const productKey of internalParams.products) {
					const total = totalMap.get(productKey)?.value ?? 0;
					const co2Map = new Map<string, ValueUnit>();
					const sharingRatioMap = new Map<string, ValueUnit>();
					for (const modeKey of internalParams.modes) {
						co2Map.set(modeKey, {
							value: co2Point?.getModeProductTotal(modeKey, productKey) ?? 0,
							unit: "kg",
						});
						sharingRatioMap.set(modeKey, {
							value:
								point?.getModeProductSharingRatio(modeKey, productKey, total) ??
								0,
							unit: "%",
						});
					}

					const yearData: PrefectureTableDetail = {
						年度: yearKey,
						総貨物量: {
							value: total,
							unit: "t",
						},
						輸送距離: {
							value: transportDistance.getDistance(point.getName()),
							unit: "km",
						},
						CO2排出量: Object.fromEntries(co2Map),
						積載率: Object.fromEntries(loadingRatioMap),
						分担率: Object.fromEntries(sharingRatioMap),
						輸送能力: Object.fromEntries(capacityMap),
					};

					const basePoint = isEndPoint
						? internalParams.basePoints[0]
						: point.getName();
					const endPoint = isEndPoint
						? point.getName()
						: internalParams.endPoints[0];
					const prefectureTable = prefectureTableMap.get(
						`${basePoint}_${endPoint}_${productKey}`,
					);
					prefectureTable?.details.push(yearData);
				}
			}
		}

		return Array.from(prefectureTableMap.values());
	}

	private createBarFeatures(
		features: GeoJSON.Feature<GeoJSON.Point, PrefectureProperties>[],
		aggregation: Aggregation,
		internalParams: AggregationPrefectureMapParam,
	): GeoJSON.FeatureCollection<GeoJSON.Polygon, PrefectureBarProperties>[] {
		const featuresArray: Array<
			Array<GeoJSON.Feature<GeoJSON.Polygon, PrefectureBarProperties>>
		> = [];
		for (let i = 0; i < internalParams.years.length; i++) {
			featuresArray.push([]);
		}

		const isOdd = internalParams.years.length % 2 === 1;
		const featureMap = new Map(features.map((f) => [f.properties?.name, f]));

		for (let i = 0; i < internalParams.years.length; i++) {
			const yearKey = internalParams.years[i];
			const year = aggregation.get(yearKey);
			if (!year) {
				continue;
			}

			for (const point of year.getPoints()) {
				const endfeature = featureMap.get(point.getName());
				if (!endfeature) {
					continue;
				}
				const total = point.getTotal();
				if (total === 0) {
					continue;
				}
				const modeTotalMap = new Map<string, number>();
				for (const mode of internalParams.modes) {
					const modeTotal = point.getModeProductsTotal(
						mode,
						internalParams.products,
					);
					modeTotalMap.set(mode, modeTotal);
				}
				this.createBarFeature(
					turf.destination(
						endfeature.geometry,
						this.getFactor(isOdd, internalParams.years.length, i),
						90,
						{
							units: "kilometers",
						},
					),
					yearKey,
					point.getName(),
					modeTotalMap,
					internalParams,
				).map((f) => featuresArray[i].push(f));
			}
		}

		return featuresArray.map((features) =>
			turf.featureCollection<GeoJSON.Polygon, PrefectureBarProperties>(
				features,
			),
		);
	}

	private getFactor(isOdd: boolean, length: number, index: number) {
		const oneOriginIndex = index + 1;
		const origination = Math.ceil(length / 2);
		if (isOdd) {
			return (BAR_WIDTH + BAR_OFFSET) * (oneOriginIndex - origination);
		}
		return (
			BAR_WIDTH / 2 +
			BAR_OFFSET / 2 +
			(BAR_WIDTH + BAR_OFFSET) * (index - origination)
		);
	}

	private createBarFeature(
		origin: GeoJSON.Feature<GeoJSON.Point>,
		year: number,
		prefecture: string,
		modeTotalMap: Map<string, number>,
		internalParams: AggregationPrefectureMapParam,
	): Array<GeoJSON.Feature<GeoJSON.Polygon, PrefectureBarProperties>> {
		const polygons: Array<
			GeoJSON.Feature<GeoJSON.Polygon, PrefectureBarProperties>
		> = [];

		const modeValues = new Map<string, number>();
		for (const mode of internalParams.modes) {
			const value = modeTotalMap.get(mode);
			modeValues.set(mode, value ?? 0);
		}

		const width = BAR_WIDTH / 2;
		let subTotal = 0;
		for (const mode of internalParams.modes) {
			const value = modeTotalMap.get(mode);
			if (!value) {
				continue;
			}
			const subOrigin = turf.destination(origin, subTotal, 0, {
				units: "kilometers",
			});
			const distance = Math.log10(value) * BAR_HEIGHT;
			const lb = turf.destination(subOrigin, width, 270, {
				units: "kilometers",
			});
			const rb = turf.destination(subOrigin, width, 90, {
				units: "kilometers",
			});
			const rt = turf.destination(rb, distance, 0, { units: "kilometers" });
			const lt = turf.destination(lb, distance, 0, { units: "kilometers" });
			const coordinates = [
				[
					lb.geometry.coordinates,
					rb.geometry.coordinates,
					rt.geometry.coordinates,
					lt.geometry.coordinates,
					lb.geometry.coordinates,
				],
			];
			const polygon = turf.polygon(coordinates, {
				年度: year,
				都道府県: prefecture,
				モード: mode,
				...Object.fromEntries(modeValues),
			});

			polygons.push(polygon);
			subTotal += distance;
		}

		return polygons;
	}

	// private createArcFeatures(
	// 	features: GeoJSON.Feature<GeoJSON.Point, PrefectureProperties>[],
	// 	aggregation: Aggregation,
	// 	aggregationAll: Aggregation,
	// 	detailMap: Map<number, AggregationDetailYear>,
	// 	params: AggregationPrefectureMapParam,
	// ): GeoJSON.FeatureCollection<GeoJSON.LineString, PrefectureArcProperties>[] {
	// 	const featuresArray: Array<
	// 		Array<GeoJSON.Feature<GeoJSON.LineString, PrefectureArcProperties>>
	// 	> = [];
	// 	for (let i = 0; i < params.years.length; i++) {
	// 		featuresArray.push([]);
	// 	}

	// 	let angle = 7;
	// 	const step = 3;
	// 	const featureMap = new Map(features.map((f) => [f.properties?.name, f]));
	// 	for (let i = 0; i < params.years.length; i++) {
	// 		angle += step;
	// 		const yearKey = params.years[i];
	// 		const year = aggregation.get(yearKey);
	// 		const yearAll = aggregationAll.get(yearKey);
	// 		if (!year || !yearAll) {
	// 			continue;
	// 		}

	// 		const yearDetail = detailMap.get(yearKey);
	// 		for (const point of year.getPoints()) {
	// 			const baseFeature = featureMap.get(point.getBasePoint());
	// 			const basePointAll = yearAll.get(basePoint.getBasePoint());
	// 			if (!baseFeature || !basePointAll) {
	// 				continue;
	// 			}

	// 			const basePointDetail = yearDetail?.get(basePoint.getBasePoint());
	// 			for (const endPoint of basePoint.endPoints()) {
	// 				const endFeature = featureMap.get(endPoint.getEndPoint());
	// 				const endPointAll = basePointAll.get(endPoint.getEndPoint());
	// 				if (!endFeature || !endPointAll) {
	// 					continue;
	// 				}

	// 				const all = endPointAll.getTotal();
	// 				const endPointDetail = basePointDetail?.get(endPoint.getEndPoint());

	// 				const shareRatiomap = new Map<string, string>();
	// 				let amount = 0;
	// 				for (const mode of endPoint.modes()) {
	// 					const ratio = mode.getSharingRatio(all);
	// 					if (ratio) {
	// 						shareRatiomap.set(
	// 							`${mode.getMode()}分担率`,
	// 							`${(ratio * 100).toFixed(2)}%`,
	// 						);
	// 					}
	// 					amount += mode.getTotal();
	// 				}
	// 				if (amount === 0) {
	// 					continue;
	// 				}

	// 				const properties: PrefectureArcProperties = {
	// 					起点: baseFeature.properties?.name,
	// 					終点: endFeature.properties?.name,
	// 					年度: yearKey,
	// 					貨物量: amount,
	// 					積載率: endPointDetail
	// 						? `${endPointDetail?.getLoadingRatio().toFixed(2)}%`
	// 						: "",
	// 				};

	// 				const feature = this.createArcFeature(
	// 					baseFeature.geometry?.coordinates as number[],
	// 					endFeature.geometry?.coordinates as number[],
	// 					angle,
	// 					{
	// 						...properties,
	// 						...Object.fromEntries(shareRatiomap),
	// 					},
	// 				) as GeoJSON.Feature<GeoJSON.LineString, PrefectureArcProperties>;

	// 				const features = featuresArray[i];
	// 				features.push(feature);
	// 			}
	// 		}
	// 	}

	// 	return featuresArray.map((features) =>
	// 		turf.featureCollection<GeoJSON.LineString, PrefectureArcProperties>(
	// 			features,
	// 		),
	// 	);
	// }

	private createMarineArcFeatures(
		records: UC13_05_内航船舶輸送統計調査[],
		params: AggregationModeMapParam,
	): GeoJSON.FeatureCollection<GeoJSON.LineString, ModeArcProperties>[] {
		const filtered = records.filter(
			(d) =>
				d.積地_港名 === params.basePoint &&
				params.endPoints.includes(d.揚地_港名) &&
				params.years.includes(d.年度),
		);

		const featuresArray: Array<
			Array<GeoJSON.Feature<GeoJSON.LineString, ModeArcProperties>>
		> = [];
		for (let i = 0; i < params.years.length; i++) {
			featuresArray.push([]);
		}

		const angle = 10;
		for (const d of filtered) {
			const properties: ModeArcProperties = {
				起点: d.積地_港名,
				終点: d.揚地_港名,
				年度: d.年度,
			};

			const i = params.years.indexOf(d.年度);
			if (i === -1) {
				continue;
			}

			const feature = this.createArcFeature(
				[d.積地_経度, d.積地_緯度],
				[d.揚地_経度, d.揚地_緯度],
				angle,
				properties,
			) as GeoJSON.Feature<GeoJSON.LineString, ModeArcProperties>;

			const features = featuresArray[i];
			features.push(feature);
		}

		return featuresArray.map((features) =>
			turf.featureCollection<GeoJSON.LineString, ModeArcProperties>(features),
		);
	}

	private createCarArcFeatures(
		records: UC13_06_自動車輸送統計調査[],
		params: AggregationModeMapParam,
	): GeoJSON.FeatureCollection<GeoJSON.LineString, ModeArcProperties>[] {
		const filtered = records.filter(
			(d) =>
				d.都道府県名_発地 === params.basePoint &&
				params.endPoints.includes(d.都道府県名_着地) &&
				params.years.includes(d.調査年),
		);

		const featuresArray: Array<
			Array<GeoJSON.Feature<GeoJSON.LineString, ModeArcProperties>>
		> = [];
		for (let i = 0; i < params.years.length; i++) {
			featuresArray.push([]);
		}

		const angle = 10;
		for (const d of filtered) {
			const properties: ModeArcProperties = {
				起点: d.都道府県名_発地,
				終点: d.都道府県名_着地,
				年度: d.調査年,
			};

			const i = params.years.indexOf(d.調査年);
			if (i === -1) {
				continue;
			}

			const feature = this.createArcFeature(
				[d.発地_都道府県_経度, d.発地_都道府県_緯度],
				[d.着地_都道府県_経度, d.着地_都道府県_緯度],
				angle,
				properties,
			) as GeoJSON.Feature<GeoJSON.LineString, ModeArcProperties>;

			const features = featuresArray[i];
			features.push(feature);
		}

		return featuresArray.map((features) =>
			turf.featureCollection<GeoJSON.LineString, ModeArcProperties>(features),
		);
	}

	private createTrainArcFeatures(
		records: UC13_08_JR貨物輸送実績調査[],
		params: AggregationModeMapParam,
	): GeoJSON.FeatureCollection<GeoJSON.LineString, ModeArcProperties>[] {
		const filtered = records.filter(
			(d) =>
				d.発駅名 === params.basePoint &&
				params.endPoints.includes(d.着駅名) &&
				params.years.includes(d.年度),
		);

		const featuresArray: Array<
			Array<GeoJSON.Feature<GeoJSON.LineString, ModeArcProperties>>
		> = [];
		for (let i = 0; i < params.years.length; i++) {
			featuresArray.push([]);
		}

		const angle = 10;
		for (const d of filtered) {
			const properties: ModeArcProperties = {
				起点: d.発駅名,
				終点: d.着駅名,
				年度: d.年度,
			};

			const i = params.years.indexOf(d.年度);
			if (i === -1) {
				continue;
			}

			const feature = this.createArcFeature(
				[d.発駅_都道府県_経度, d.発駅_都道府県_緯度],
				[d.着駅_都道府県_経度, d.着駅_都道府県_緯度],
				angle,
				properties,
			) as GeoJSON.Feature<GeoJSON.LineString, ModeArcProperties>;

			const features = featuresArray[i];
			features.push(feature);
		}

		return featuresArray.map((features) =>
			turf.featureCollection<GeoJSON.LineString, ModeArcProperties>(features),
		);
	}

	private createArcFeature<
		P extends
			| PrefectureArcProperties
			| ModeArcProperties
			| PrefectureProperties,
	>(
		start: number[],
		end: number[],
		angle: number,
		properties: P,
	): GeoJSON.Feature<GeoJSON.LineString, P> {
		// Calculate coordinates of arc
		// Generate Bezier curve at 40% from start point
		const a = start[0] - (start[0] - end[0]) * 0.4;
		const b = start[1] - (start[1] - end[1]) * 0.4;
		const c = end[0];
		const d = end[1];

		// Calculate the direction in which the curve protrudes
		const degrees =
			Math.abs((Math.atan2(d - b, c - a) * 180) / Math.PI) <= 90
				? -angle
				: angle;

		// Calculate the protruding position of the curve
		const x =
			(a - c) * Math.cos((degrees * Math.PI) / 180) -
			(b - d) * Math.sin((degrees * Math.PI) / 180) +
			c;
		const y =
			(a - c) * Math.sin((degrees * Math.PI) / 180) +
			(b - d) * Math.cos((degrees * Math.PI) / 180) +
			d;

		// Create bezier spline
		const line = turf.lineString([start, [x, y], end]);
		return turf.bezierSpline<P>(line, {
			properties: properties,
		});
	}

	async listDataDownloadLinks() {
		return this.usecaseRepository.listData();
	}
}

class Aggregation extends Map<number, AggregationYear> {
	years(): AggregationYear[] {
		const results: AggregationYear[] = [];
		for (const key of Array.from(this.keys()).sort()) {
			const result = this.get(key);
			if (result) {
				results.push(result);
			}
		}
		return results;
	}

	getMax(): number {
		return Math.max(...Array.from(this.values()).map((v) => v.getMax()));
	}

	getMinWithoutZero(): number | undefined {
		let min = undefined;
		for (const year of this.years()) {
			const v = year.getMinWithoutZero();
			if (v) {
				if (min === undefined) {
					min = v;
				} else {
					min = Math.min(min, v);
				}
			}
		}
		return min;
	}
}

class AggregationYear extends Map<string, AggregationPoint> {
	private year: number;

	constructor(year: number) {
		super();
		this.year = year;
	}

	getYear(): number {
		return this.year;
	}

	getPoints(): AggregationPoint[] {
		const results: AggregationPoint[] = [];
		for (const key of Array.from(this.keys()).sort()) {
			const result = this.get(key);
			if (result) {
				results.push(result);
			}
		}
		return results;
	}

	firstPoint(): AggregationPoint {
		return this.getPoints()[0];
	}

	getMax(): number {
		return Math.max(...Array.from(this.values()).map((v) => v.getMax()));
	}

	getMinWithoutZero(): number | undefined {
		let min = undefined;
		for (const basePoint of this.getPoints()) {
			const v = basePoint.getMinWithoutZero();
			if (v) {
				if (min === undefined) {
					min = v;
				} else {
					min = Math.min(min, v);
				}
			}
		}
		return min;
	}
}

class AggregationPoint extends Map<string, AggregationMode> {
	private name: string;

	constructor(name: string) {
		super();
		this.name = name;
	}

	getName(): string {
		return this.name;
	}

	modes(): AggregationMode[] {
		const results: AggregationMode[] = [];
		for (const key of Array.from(this.keys()).sort()) {
			const result = this.get(key);
			if (result) {
				results.push(result);
			}
		}
		return results;
	}

	getMode(name: string): AggregationMode | undefined {
		return this.get(name);
	}

	getMax(): number {
		return Math.max(...Array.from(this.values()).map((v) => v.getMax()));
	}

	getMinWithoutZero(): number | undefined {
		let min = undefined;
		for (const mode of this.modes()) {
			const v = mode.getMinWithoutZero();
			if (v) {
				if (min === undefined) {
					min = v;
				} else {
					min = Math.min(min, v);
				}
			}
		}
		return min;
	}

	getTotal(): number {
		return this.modes().reduce((acc, cur) => acc + cur.getTotal(), 0);
	}

	getProductTotal(product: string): number {
		return this.modes().reduce(
			(acc, cur) => acc + cur.getProductValue(product),
			0,
		);
	}

	getModeProductTotal(mode: string, product: string): number {
		const m = this.get(mode);
		return m ? m.getProductValue(product) : 0;
	}

	getModeProductsTotal(mode: string, products: string[]): number {
		const m = this.get(mode);
		return m ? m.getProductsTotal(products) : 0;
	}

	getModeProductSharingRatio(
		mode: string,
		product: string,
		all: number,
	): number | undefined {
		if (all === 0) {
			return undefined;
		}
		const p = this.getModeProductTotal(mode, product);
		return p ? (p / all) * 100 : undefined;
	}
}

class AggregationMode extends Map<string, AggregationProduct> {
	private name: string;

	constructor(name: string) {
		super();
		this.name = name;
	}

	getName(): string {
		return this.name;
	}

	products(): AggregationProduct[] {
		const results: AggregationProduct[] = [];
		for (const key of Array.from(this.keys()).sort()) {
			const result = this.get(key);
			if (result) {
				results.push(result);
			}
		}
		return results;
	}

	getProduct(name: string): AggregationProduct | undefined {
		return this.get(name);
	}

	getMax(): number {
		return Math.max(...Array.from(this.values()).map((v) => v.getValue()));
	}

	getMinWithoutZero(): number | undefined {
		let min = undefined;
		for (const product of this.values()) {
			const v = product.getValue();
			if (v === 0) {
				continue;
			}
			if (v) {
				if (min === undefined) {
					min = v;
				} else {
					min = Math.min(min, v);
				}
			}
		}
		return min;
	}

	getTotal(): number {
		return Array.from(this.values()).reduce(
			(acc, cur) => acc + cur.getValue(),
			0,
		);
	}

	getProductValue(product: string): number {
		const p = this.get(product);
		return p ? p.getValue() : 0;
	}

	getProductsTotal(products: string[]): number {
		return this.products()
			.filter((p) => products.includes(p.getProduct()))
			.reduce((acc, cur) => acc + cur.getValue(), 0);
	}
}

class AggregationProduct {
	private product: string;
	private value = 0;

	constructor(product: string) {
		this.product = product;
	}

	getProduct(): string {
		return this.product;
	}

	getValue(): number {
		return this.value;
	}

	add(value: number) {
		this.value += value;
	}
}

class AggregationDetailYear extends Map<string, AggregationDetailPoint> {
	private year: number;

	constructor(year: number) {
		super();
		this.year = year;
	}

	getYear(): number {
		return this.year;
	}

	getPoints(): AggregationDetailPoint[] {
		const results: AggregationDetailPoint[] = [];
		for (const key of Array.from(this.keys()).sort()) {
			const result = this.get(key);
			if (result) {
				results.push(result);
			}
		}
		return results;
	}
}

class AggregationDetailPoint extends Map<string, AggregationDetailMode> {
	private name: string;

	constructor(name: string) {
		super();
		this.name = name;
	}

	getName(): string {
		return this.name;
	}

	modes(): AggregationDetailMode[] {
		const results: AggregationDetailMode[] = [];
		for (const key of Array.from(this.keys()).sort()) {
			const result = this.get(key);
			if (result) {
				results.push(result);
			}
		}
		return results;
	}

	getMode(name: string): AggregationDetailMode | undefined {
		return this.get(name);
	}

	getTotalCapacity(): number {
		return this.modes().reduce((acc, cur) => acc + cur.getCapacity(), 0);
	}

	getTotalActual(): number {
		return this.modes().reduce((acc, cur) => acc + cur.getActual(), 0);
	}

	getCalculatedLoadingRatio(): number {
		let totalCapacity = 0;
		let totalActual = 0;
		for (const mode of this.modes()) {
			totalCapacity += mode.getCapacity();
			totalActual += mode.getActual();
		}

		return totalCapacity !== 0 ? totalActual / totalCapacity : 0;
	}

	getModeCapacity(mode: string): number {
		const m = this.get(mode);
		if (!m) {
			return 0;
		}
		const capacity = m.getCapacity();
		return !Number.isNaN(capacity) ? capacity : 0;
	}

	getModeLoadingRatio(mode: string): number {
		const m = this.get(mode);
		return m ? m.getLoadingRatio() : 0;
	}

	getModeCalculatedLoadingRatio(mode: string): number {
		const m = this.get(mode);
		return m ? m.getCalculatedLoadingRatio() : 0;
	}
}

class AggregationDetailMode {
	private mode: string;
	private capacity: number;
	private actual: number;
	private loadingRatioList: number[] = [];

	constructor(mode: string) {
		this.mode = mode;
		this.capacity = 0;
		this.actual = 0;
	}

	getMode(): string {
		return this.mode;
	}

	add(capacity: number, actual: number, loadingRatio: number) {
		this.capacity += capacity;
		this.actual += actual;
		this.loadingRatioList.push(loadingRatio);
	}

	getCapacity(): number {
		return this.capacity;
	}

	getActual(): number {
		return this.actual;
	}

	getLoadingRatio(): number {
		return this.loadingRatioList.length > 0
			? this.loadingRatioList.reduce((acc, cur) => acc + cur, 0) /
					this.loadingRatioList.length
			: 0;
	}

	getCalculatedLoadingRatio(): number {
		return this.capacity > 0 ? this.actual / this.capacity : 0;
	}
}

class TransportDistance {
	private pointMap: Map<string, TransportDistancePoint>;

	constructor() {
		this.pointMap = new Map();
	}

	add(point: string, distance: number) {
		let pointMap = this.pointMap.get(point);
		if (!pointMap) {
			pointMap = new TransportDistancePoint(point);
			this.pointMap.set(point, pointMap);
		}

		pointMap.set(point, distance);
	}

	getDistance(point: string): number {
		const pointMap = this.pointMap.get(point);
		return pointMap ? pointMap.get(point) ?? 0 : 0;
	}
}

class TransportDistancePoint extends Map<string, number> {
	private name: string;

	constructor(name: string) {
		super();
		this.name = name;
	}
}

class BarChartDataXAxis extends Map<string, number> {
	private name: string;

	constructor(name: string) {
		super();
		this.name = name;
	}

	getName(): string {
		return this.name;
	}

	add(key: string, value: number) {
		const v = this.get(key) ?? 0;
		this.set(key, v + value);
	}

	getTotal(): number {
		return Array.from(this.values()).reduce((acc, cur) => acc + cur, 0);
	}
}

function createDefinition(
	id: number,
	unit: string,
	greaterThanOrEqual: number | null,
	lessThan: number | null,
): DefinitionValue {
	const start = greaterThanOrEqual ? `${greaterThanOrEqual}${unit}以上` : "";
	const end = lessThan ? `${lessThan}${unit}未満` : "";
	const name = `${start}${start && end ? "~" : ""}${end}`;
	return {
		id: id,
		name: name,
		greaterThanOrEqual: greaterThanOrEqual,
		lessThan: lessThan,
	};
}

function isFitCondition(
	definitions: DefinitionValue[],
	value: number,
): boolean {
	if (definitions.length === 0) {
		return true;
	}
	for (const definition of definitions) {
		if (
			(!definition.greaterThanOrEqual ||
				value >= definition.greaterThanOrEqual) &&
			(!definition.lessThan || value < definition.lessThan)
		) {
			return true;
		}
	}
	return false;
}

// 都道府県分析
const prefectureMarineEfficiencyConditions = [
	{
		name: TransportEfficiencyTypes.平均_総トン数,
		values: new Map(
			[
				createDefinition(1, "トン", null, 100),
				createDefinition(2, "トン", 100, 500),
				createDefinition(3, "トン", 500, 1000),
				createDefinition(4, "トン", 1000, 5000),
				createDefinition(5, "トン", 5000, 10000),
				createDefinition(6, "トン", 10000, null),
			].map((v) => [v.id, v]),
		),
	},
];

const prefectureCarEfficiencyConditions = [
	{
		name: TransportEfficiencyTypes["平均_最大積載量（kg）"],
		values: new Map(
			[
				createDefinition(1, "kg", null, 1000),
				createDefinition(2, "kg", 1000, 2000),
				createDefinition(3, "kg", 2000, 3000),
				createDefinition(4, "kg", 3000, 5000),
				createDefinition(5, "kg", 5000, 10000),
				createDefinition(6, "kg", 10000, null),
			].map((v) => [v.id, v]),
		),
	},
];

const prefectureTrainEfficiencyConditions = [
	{
		name: TransportEfficiencyTypes.発駅_輸送力,
		values: new Map(
			[
				createDefinition(1, "トン", null, 100),
				createDefinition(2, "トン", 100, 500),
				createDefinition(3, "トン", 500, 1000),
				createDefinition(4, "トン", 1000, 5000),
				createDefinition(5, "トン", 5000, 10000),
				createDefinition(6, "トン", 10000, null),
			].map((v) => [v.id, v]),
		),
	},
];

const prefectureEfficiencyConditions: PrefectureEfficiencyCondition[] = [
	{
		mode: TransportationTypes.海運,
		efficiencies: prefectureMarineEfficiencyConditions.map((d) => ({
			name: d.name,
			values: Array.from(d.values.values()).map((v) => ({
				id: v.id,
				name: v.name,
			})),
		})),
	},
	{
		mode: TransportationTypes.自動車,
		efficiencies: prefectureCarEfficiencyConditions.map((d) => ({
			name: d.name,
			values: Array.from(d.values.values()).map((v) => ({
				id: v.id,
				name: v.name,
			})),
		})),
	},
	{
		mode: TransportationTypes.鉄道,
		efficiencies: prefectureTrainEfficiencyConditions.map((d) => ({
			name: d.name,
			values: Array.from(d.values.values()).map((v) => ({
				id: v.id,
				name: v.name,
			})),
		})),
	},
];
