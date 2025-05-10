/**
 * Adds seed data to your db
 *
 * @link https://www.prisma.io/docs/guides/database/seed-database
 */
import { PrismaClient } from "@prisma/client";
import { seedAccountManagement } from "./seeds/accountManagementSeed.mjs";

const prisma = new PrismaClient();

async function main() {
	await truncateUseCase13();
	await insertUseCase13();
	await seedAccountManagement();
	console.log("Seeding process completed!");
}

const fetchJson = async (url: string) => {
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`Failed to fetch json: ${response.statusText}`);
	}
	return response.json();
};

const nullOrString = (value: string | null) => {
	return value ? `'${value}'` : "NULL";
};

const truncateUseCase13 = async () => {
	await prisma.$queryRaw`TRUNCATE TABLE usecase13_prefectures;`;
	await prisma.$queryRaw`TRUNCATE TABLE usecase13_prefecture_points;`;
	await prisma.$queryRaw`TRUNCATE TABLE usecase13_route_search_logistics_bases;`;
};

const insertUseCase13 = async () => {
	const prefectures = await fetchJson(
		"https://assets.cms.dev.links-veda.mlit.go.jp/assets/a9/79e6a7-d2ad-4933-a57b-2c63f7e77d72/UC13_09_都道府県ポリゴンデータ.geojson",
	);

	for (const feature of prefectures.features) {
		const properties = feature.properties;
		await prisma.$queryRawUnsafe(`
    		INSERT INTO usecase13_prefectures (geom, name) VALUES
    		(
    			ST_GeomFromGeoJSON('${JSON.stringify(feature.geometry)}'),
    			'${properties.N03_001}'
    		);`);
	}

	const prefecturePoints = await fetchJson(
		"https://assets.cms.dev.links-veda.mlit.go.jp/assets/2f/cbe264-3a30-4ba2-85c2-f8c366cc3533/UC13_08_都道府県代表地点データ.geojson",
	);

	for (const feature of prefecturePoints.features) {
		const properties = feature.properties;
		await prisma.$queryRawUnsafe(`
    		INSERT INTO usecase13_prefecture_points (geom, name) VALUES
    		(
    			ST_GeomFromGeoJSON('${JSON.stringify(feature.geometry)}'),
    			'${properties.都道府県名}'
    		);`);
	}

	const routeSearchLogisticsBases = await fetchJson(
		"https://assets.cms.dev.links-veda.mlit.go.jp/assets/bd/8db192-b398-490f-847e-0f784e18a110/UC13_04_経路検索結果_物流拠点間.geojson",
	);
	for (const feature of routeSearchLogisticsBases.features) {
		const properties = feature.properties;
		await prisma.$queryRawUnsafe(`
    		INSERT INTO usecase13_route_search_logistics_bases (geom, origin_name, origin_lon, origin_lat, destination_name, destination_lon, destination_lat, transportation_mode, minimum_time_flag, minimum_distance_flag, total_time, total_distance, waypoint_name_1, waypoint_mode_1, waypoint_lat_1, waypoint_lon_1, waypoint_time_1, waypoint_distance_1, waypoint_name_2, waypoint_mode_2, waypoint_lat_2, waypoint_lon_2, waypoint_time_2, waypoint_distance_2, waypoint_name_3, waypoint_mode_3, waypoint_lat_3, waypoint_lon_3, waypoint_time_3, waypoint_distance_3, waypoint_name_4, waypoint_mode_4, waypoint_lat_4, waypoint_lon_4, waypoint_time_4, waypoint_distance_4, waypoint_name_5, waypoint_mode_5, waypoint_lat_5, waypoint_lon_5, waypoint_time_5, waypoint_distance_5) VALUES
    		(
    			ST_GeomFromGeoJSON('${JSON.stringify(feature.geometry)}'),
    			'${properties.Origin_name}',
    			${properties.Origin_lon},
    			${properties.Origin_lat},
    			'${properties.Destination_name}',
    			${properties.Destination_lon},
    			${properties.Destination_lat},
    			'${properties.Transportation_Mode}',
    			${properties.Minimum_Time_Flag},
    			${properties.Minimum_Distance_Flag},
    			${properties.Total_Time},
    			${properties.Total_Distance},
				${nullOrString(properties.Waypoint_name_1)},
				${nullOrString(properties.Waypoint_mode_1)},
				${properties.Waypoint_lat_1},
    			${properties.Waypoint_lon_1},
				${properties.Waypoint_time_1},
    			${properties.Waypoint_distance_1},
				${nullOrString(properties.Waypoint_name_2)},
				${nullOrString(properties.Waypoint_mode_2)},
				${properties.Waypoint_lat_2},
    			${properties.Waypoint_lon_2},
				${properties.Waypoint_time_2},
    			${properties.Waypoint_distance_2},
				${nullOrString(properties.Waypoint_name_3)},
				${nullOrString(properties.Waypoint_mode_3)},
				${properties.Waypoint_lat_3},
    			${properties.Waypoint_lon_3},
				${properties.Waypoint_time_3},
    			${properties.Waypoint_distance_3},
				${nullOrString(properties.Waypoint_name_4)},
				${nullOrString(properties.Waypoint_mode_4)},
				${properties.Waypoint_lat_4},
    			${properties.Waypoint_lon_4},
				${properties.Waypoint_time_4},
    			${properties.Waypoint_distance_4},
				${nullOrString(properties.Waypoint_name_5)},
				${nullOrString(properties.Waypoint_mode_5)},
				${properties.Waypoint_lat_5},
    			${properties.Waypoint_lon_5},
				${properties.Waypoint_time_5},
    			${properties.Waypoint_distance_5}
    		);`);
	}
};

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
