export const UC16_DATA_CONFIGS = {
	UAV_FLIGHT_PLANS: {
		//事故発生無人航空機飛行計画
		url: "/api/uc16-data?type=UAV_FLIGHT_PLANS&format=geojson",
		type: "point",
	},
	SURROUNDING_AREAS: {
		//各種空域情報（ジオメトリデータ）（空港などの周辺空域）
		url: "/api/uc16-data?type=SURROUNDING_AREAS&format=geojson&geometry=geojson",
		type: "polygon",
	},
	YELLOW_ZONES: {
		//各種空域情報（ジオメトリデータ）（イエローゾーン）
		url: "/api/uc16-data?type=YELLOW_ZONES&format=geojson&geometry=geojson",
		type: "polygon",
	},
	RED_ZONES: {
		//各種空域情報（ジオメトリデータ）（レッドゾーン）
		url: "/api/uc16-data?type=RED_ZONES&format=geojson",
		type: "polygon",
	},
	TAKEOFF_LANDING_AREAS: {
		//各種空域情報（ジオメトリデータ）（有人機発着エリア）
		url: "/api/uc16-data?type=TAKEOFF_LANDING_AREAS&format=geojson",
		type: "polygon",
	},
	INHABITED_DISTRICT: {
		//国土数値情報 人口集中区域情報（DID）
		url: "/api/uc16-data?type=INHABITED_DISTRICT&format=geojson",
		type: "polygon",
	},
	ADMINISTRATIVE_BOUNDARIES: {
		//国土数値情報 行政区域
		url: "/api/uc16-data?type=ADMINISTRATIVE_BOUNDARIES&format=geojson",
		type: "polygon",
	},
} as const;

export type UC16DataType = keyof typeof UC16_DATA_CONFIGS;
