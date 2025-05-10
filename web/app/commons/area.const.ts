export type ZoneConfig = {
	id: string;
	file: string;
	style: {
		color: string;
		weight: number;
		fillOpacity: number;
		opacity: number;
	};
};

export const TOKYO_COORDINATES: [number, number] = [35.6762, 139.7503];

export const JAPAN_BOUNDS: [[number, number], [number, number]] = [
	[20.0, 122.0],
	[45.0, 154.0],
];

export const MAP_LAYERS = {
	standard: {
		url: "https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png",
		name: "標準地図",
		isDark: false,
	},
	pale: {
		url: "https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png",
		name: "淡色地図",
		isDark: false,
	},
	reference: {
		url: "https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
		name: "参照地図",
		isDark: true,
	},
} as const;

// FIXME replace with data from CMS
export const ZONE_CONFIGS: Record<string, ZoneConfig> = {
	red: {
		id: "red-zone",
		file: "/mock/red-zone.geojson",
		style: {
			color: "#FF0000",
			weight: 2,
			fillOpacity: 0.2,
			opacity: 1,
		},
	},
	yellow: {
		id: "yellow-zone",
		file: "/mock/yellow-zone.geojson",
		style: {
			color: "#FFD700",
			weight: 2,
			fillOpacity: 0.2,
			opacity: 1,
		},
	},
	airport: {
		id: "airport",
		file: "/mock/airport.geojson",
		style: {
			color: "#4169E1",
			weight: 2,
			fillOpacity: 0.2,
			opacity: 1,
		},
	},
	populated: {
		id: "populated",
		file: "/mock/populated.geojson",
		style: {
			color: "#32CD32",
			weight: 2,
			fillOpacity: 0.2,
			opacity: 1,
		},
	},
} as const;
