import { Prisma } from "@prisma/client";
import * as turf from "@turf/turf";
import Papa, { type ParseResult } from "papaparse";
import {
	type ModePointGroup,
	type PrefectureProperties,
	type PrefectureSource,
	type SearchMultimodalRouteParams,
	type SearchMultimodalRouteProperties,
	type UC13_05_内航船舶輸送統計調査,
	type UC13_06_自動車輸送統計調査,
	type UC13_07_府県相互間輸送トン数表,
	type UC13_08_JR貨物輸送実績調査,
	type UC13_11_都道府県間距離一覧表,
	type UC13_12_都道府県間CO2排出量,
	UFN001AllPrefectures,
	UFN002TransportationModeAll,
} from "~/models/useCase13";
import { prisma } from "~/prisma";

const UC13_05_URL =
	"";
const UC13_06_URL =
	"";
const UC13_07_URL =
	"";
const UC13_08_URL =
	"";
const UC13_11_URL =
	"";
const UC13_12_URL =
	"";

const getSource = (url: string): string => {
	const result = url.match(/.+UC13_(\d+)_(?<name>.+)\.(.+)/);
	return result?.groups?.name ?? "不明";
};

const PrefectureSources: PrefectureSource = {
	総貨物量: getSource(UC13_07_URL),
	輸送距離: getSource(UC13_11_URL),
	CO2排出量: {
		自動車: getSource(UC13_12_URL),
		海運: getSource(UC13_12_URL),
		鉄道: getSource(UC13_12_URL),
	},
	積載率: {
		自動車: getSource(UC13_06_URL),
		海運: getSource(UC13_05_URL),
		鉄道: getSource(UC13_08_URL),
	},
	分担率: {
		自動車: getSource(UC13_07_URL),
		海運: getSource(UC13_07_URL),
		鉄道: getSource(UC13_07_URL),
	},
	輸送能力: {
		自動車: getSource(UC13_06_URL),
		海運: getSource(UC13_05_URL),
		鉄道: getSource(UC13_08_URL),
	},
} as const;

export class UseCase13Repository {
	async getUC13_05_内航船舶輸送統計調査(): Promise<
		UC13_05_内航船舶輸送統計調査[]
	> {
		const results = await this.parseCsv<UC13_05_内航船舶輸送統計調査>(
			UC13_05_URL,
		);

		return results;
	}

	async getUC13_06_自動車輸送統計調査(): Promise<UC13_06_自動車輸送統計調査[]> {
		const results = await this.parseCsv<UC13_06_自動車輸送統計調査>(
			UC13_06_URL,
		);

		return results;
	}

	async getUC13_07_府県相互間輸送トン数表(): Promise<
		UC13_07_府県相互間輸送トン数表[]
	> {
		const results = await this.parseCsv<UC13_07_府県相互間輸送トン数表>(
			UC13_07_URL,
		);

		return results;
	}

	async getUC13_11_都道府県間距離一覧表(): Promise<
		UC13_11_都道府県間距離一覧表[]
	> {
		const results = await this.parseCsv<UC13_11_都道府県間距離一覧表>(
			UC13_11_URL,
		);

		return results;
	}

	async getUC13_12_都道府県間CO2排出量(): Promise<
		UC13_12_都道府県間CO2排出量[]
	> {
		const results = await this.parseCsv<UC13_12_都道府県間CO2排出量>(
			UC13_12_URL,
		);

		return results;
	}

	async getUC13_08_JR貨物輸送実績調査(): Promise<UC13_08_JR貨物輸送実績調査[]> {
		const results = await this.parseCsv<UC13_08_JR貨物輸送実績調査>(
			UC13_08_URL,
		);

		return results;
	}

	async getUC13_05_内航船舶輸送統計調査_起点終点(): Promise<ModePointGroup> {
		const results = await this.parseCsv<UC13_05_内航船舶輸送統計調査>(
			UC13_05_URL,
		);

		return {
			mode: "海運",
			basePoints: Array.from(
				new Map(results.map((r) => [r.積地_港名, r.積地_港名])).values(),
			).sort(),
			endPoints: Array.from(
				new Map(results.map((r) => [r.揚地_港名, r.揚地_港名])).values(),
			).sort(),
		};
	}

	async getUC13_06_自動車輸送統計調査_起点終点(): Promise<ModePointGroup> {
		const results = await this.parseCsv<UC13_06_自動車輸送統計調査>(
			UC13_06_URL,
		);

		return {
			mode: "自動車",
			basePoints: UFN001AllPrefectures,
			endPoints: UFN001AllPrefectures,
		};
	}

	async getUC13_08_JR貨物輸送実績調査_起点終点(): Promise<ModePointGroup> {
		const results = await this.parseCsv<UC13_08_JR貨物輸送実績調査>(
			UC13_08_URL,
		);

		return {
			mode: "鉄道",
			basePoints: Array.from(
				new Map(results.map((r) => [r.発駅名, r.発駅名])).values(),
			).sort(),
			endPoints: Array.from(
				new Map(results.map((r) => [r.着駅名, r.着駅名])).values(),
			).sort(),
		};
	}

	async getTransportationMode(): Promise<string[]> {
		const rows = await prisma.useCase13RouteSearchLogisticsBases.findMany({
			select: {
				transportationMode: true,
			},
			distinct: ["transportationMode"],
			orderBy: {
				transportationMode: "asc",
			},
		});

		return rows.map((r) => r.transportationMode);
	}

	async getOriginName(): Promise<string[]> {
		const rows = await prisma.useCase13RouteSearchLogisticsBases.findMany({
			select: {
				originName: true,
			},
			distinct: ["originName"],
			orderBy: {
				originName: "asc",
			},
		});

		return rows.map((r) => r.originName);
	}

	async getDestinationName(): Promise<string[]> {
		const rows = await prisma.useCase13RouteSearchLogisticsBases.findMany({
			select: {
				destinationName: true,
			},
			distinct: ["destinationName"],
			orderBy: {
				destinationName: "asc",
			},
		});

		return rows.map((r) => r.destinationName);
	}

	async getPrefectures(
		names: string[],
	): Promise<GeoJSON.FeatureCollection<GeoJSON.Polygon, PrefectureProperties>> {
		const isAll = names.length === 0;
		const rows: {
			feature: GeoJSON.Feature<GeoJSON.Polygon, PrefectureProperties>;
		}[] = await prisma.$queryRaw`
	  WITH t AS(
          SELECT ST_AsGeoJSON(geom) AS geometry, JSON_OBJECT(
		    'name', name
		) AS properties FROM usecase13_prefectures
		${isAll ? Prisma.empty : Prisma.sql([" WHERE "])} ${
			isAll
				? Prisma.empty
				: Prisma.join(
						names.map((name) => Prisma.sql([`name = '${name}'`])),
						" OR ",
					)
		})
	  SELECT JSON_OBJECT('type', 'Feature', 'geometry', geometry, 'properties', properties) AS feature FROM t;`;

		return {
			type: "FeatureCollection",
			features: rows.map((r) => r.feature),
		};
	}

	async getPrefecturePoints(
		names: string[],
	): Promise<GeoJSON.FeatureCollection<GeoJSON.Point, PrefectureProperties>> {
		const isAll = names.length === 0;
		const rows: {
			feature: GeoJSON.Feature<GeoJSON.Point, PrefectureProperties>;
		}[] = await prisma.$queryRaw`
	  WITH t AS(
          SELECT ST_AsGeoJSON(geom) AS geometry, JSON_OBJECT(
		    'name', name
		) AS properties FROM usecase13_prefecture_points
		${isAll ? Prisma.empty : Prisma.sql([" WHERE "])} ${
			isAll
				? Prisma.empty
				: Prisma.join(
						names.map((name) => Prisma.sql([`name = '${name}'`])),
						" OR ",
					)
		})
	  SELECT JSON_OBJECT('type', 'Feature', 'geometry', geometry, 'properties', properties) AS feature FROM t;`;

		return turf.featureCollection<GeoJSON.Point, PrefectureProperties>(
			rows.map((r) => r.feature),
		);
	}

	async searchMultimodalRoute(
		params: SearchMultimodalRouteParams,
	): Promise<
		GeoJSON.FeatureCollection<
			GeoJSON.LineString | GeoJSON.MultiLineString,
			SearchMultimodalRouteProperties
		>
	> {
		const isAllMode = params.modes.some(
			(mode) => mode === UFN002TransportationModeAll,
		);

		const rows: {
			feature: GeoJSON.Feature<
				GeoJSON.LineString | GeoJSON.MultiLineString,
				SearchMultimodalRouteProperties
			>;
		}[] = await prisma.$queryRaw`
      WITH t AS(
        SELECT ST_AsGeoJSON(geom) AS geometry, JSON_OBJECT(
		  'originName', origin_name,
		  'originLon', origin_lon,
		  'originLat', origin_lat,
		  'destinationName', destination_name,
		  'destinationLon', destination_lon,
		  'destinationLat', destination_lat,
		  'transportationMode', transportation_mode,
		  'minimum_timeFlag', minimum_time_flag,
		  'minimumDistanceFlag', minimum_distance_flag,
		  'totalTime', total_time,
		  'totalDistance', total_distance / 1000,
		  'waypointName_1', waypoint_name_1,
		  'waypointMode_1', waypoint_mode_1,
		  'waypointLat_1', waypoint_lat_1,
		  'waypointLon_1', waypoint_lon_1,
		  'waypointTime_1', waypoint_time_1,
		  'waypointDistance_1', waypoint_distance_1 / 1000,
		  'waypointName_2', waypoint_name_2,
		  'waypointMode_2', waypoint_mode_2,
		  'waypointLat_2', waypoint_lat_2,
		  'waypointLon_2', waypoint_lon_2,
		  'waypointTime_2', waypoint_time_2,
		  'waypointDistance_2', waypoint_distance_2 / 1000,
		  'waypointName_3', waypoint_name_3,
		  'waypointMode_3', waypoint_mode_3,
		  'waypointLat_3', waypoint_lat_3,
		  'waypointLon_3', waypoint_lon_3,
		  'waypointTime_3', waypoint_time_3,
		  'waypointDistance_3', waypoint_distance_3 / 1000,
		  'waypointName_4', waypoint_name_4,
		  'waypointMode_4', waypoint_mode_4,
		  'waypointLat_4', waypoint_lat_4,
		  'waypointLon_4', waypoint_lon_4,
		  'waypointTime_4', waypoint_time_4,
		  'waypointDistance_4', waypoint_distance_4 / 1000,
		  'waypointName_5', waypoint_name_5,
		  'waypointMode_5', waypoint_mode_5,
		  'waypointLat_5', waypoint_lat_5,
		  'waypointLon_5', waypoint_lon_5,
		  'waypointTime_5', waypoint_time_5,
		  'waypointDistance_5', waypoint_distance_5 / 1000
		) AS properties,
		total_time FROM usecase13_route_search_logistics_bases
		WHERE origin_name = ${params.originName} AND destination_name = ${
			params.destinationName
		}${isAllMode ? Prisma.empty : Prisma.sql([" AND "])} ${
			isAllMode
				? Prisma.empty
				: Prisma.join(
						params.modes.map((mode) =>
							Prisma.sql([`transportation_mode = '${mode}'`]),
						),
						" OR ",
					)
		})
      SELECT JSON_OBJECT('type', 'Feature', 'geometry', geometry, 'properties', properties) AS feature FROM t
	  ORDER by total_time ASC;`;

		return turf.featureCollection<
			GeoJSON.LineString | GeoJSON.MultiLineString,
			SearchMultimodalRouteProperties
		>(rows.map((r) => r.feature));
	}

	getPrefectureSource(): PrefectureSource {
		return PrefectureSources;
	}

	private async parseCsv<T>(url: string): Promise<T[]> {
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`Failed to fetch CSV: ${response.statusText}`);
		}

		const text = await response.text();

		return new Promise((resolve, reject) => {
			Papa.parse(text, {
				header: true,
				dynamicTyping: true,
				skipEmptyLines: true,
				complete: (results: ParseResult<T>) => {
					if (results.errors.length > 0) {
						console.error("CSV Parsing Errors:", results.errors);
					}
					resolve(results.data);
				},
				error: (error: Error | Papa.ParseError) => {
					reject(error);
				},
			});
		});
	}
	listData(): string[] {
		return [
			UC13_05_URL,
			UC13_06_URL,
			UC13_07_URL,
			UC13_08_URL,
			UC13_11_URL,
			UC13_12_URL,
		];
	}
}
