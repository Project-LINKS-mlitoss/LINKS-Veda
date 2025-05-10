export const UC12_DATA_CONFIGS = {
	// MEMO: AGGREGATED_DATA is referenced from this file while geojson is referenced from api.us12-data.tsx. FIX ME LATER
	AGGREGATED_DATA: {
		// UC12_01_AggregatedData.csv
		url: "/api/uc12-data?type=AGGREGATED_DATA&format=csv",
		type: "table",
	},
	BUSINESS_PERFORMANCE_REPORT_DATA_1: {
		// UC12_02_BusinessPerformanceReportData_1
		url: "/api/uc12-data?type=BUSINESS_PERFORMANCE_REPORT_DATA_1&format=geojson",
		type: "geojson",
	},
	BUSINESS_PERFORMANCE_REPORT_DATA_2: {
		// UC12_02_BusinessPerformanceReportData_2
		url: "/api/uc12-data?type=BUSINESS_PERFORMANCE_REPORT_DATA_2&format=geojson",
		type: "geojson",
	},
	BUSINESS_PERFORMANCE_REPORT_DATA_3: {
		// UC12_02_BusinessPerformanceReportData_3
		url: "/api/uc12-data?type=BUSINESS_PERFORMANCE_REPORT_DATA_3&format=geojson",
		type: "geojson",
	},
	BUSINESS_PERFORMANCE_REPORT_DATA_4: {
		// UC12_02_BusinessPerformanceReportData_4
		url: "/api/uc12-data?type=BUSINESS_PERFORMANCE_REPORT_DATA_4&format=geojson",
		type: "geojson",
	},
	BUSINESS_PERFORMANCE_REPORT_DATA_5: {
		// UC12_02_BusinessPerformanceReportData_5
		url: "/api/uc12-data?type=BUSINESS_PERFORMANCE_REPORT_DATA_5&format=geojson",
		type: "geojson",
	},

	REGIONAL_TRANSPORT_BUREAU_POLYGON: {
		// UC12_03_RegionalTransportBureau_Polygon.geojson
		url: "/api/uc12-data?type=REGIONAL_TRANSPORT_BUREAU_POLYGON&format=geojson",
		type: "polygon",
	},

	BUSINESS_PERFORMANCE_REPORT_DATA_AGGREGATED_DATA: {
		// UC12_04_BusinessPerformanceReportData(AggregatedData)
		url: "/api/uc12-data?type=BUSINESS_PERFORMANCE_REPORT_DATA_AGGREGATED_DATA&format=geojson",
		type: "geojson",
	},
} as const;

export type UC12DataType = keyof typeof UC12_DATA_CONFIGS;
