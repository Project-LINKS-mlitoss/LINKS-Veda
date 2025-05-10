// MEMO: If there is a TYPE that needs to be added, add it.
export interface AggregatedDataRow {
	typeOfBusiness?: string;
	cityName?: string;
	companyName?: string;
	businessEntityId?: number;
	transportBureauClassification?: string;
	category?: string;
	businessOverviewCommercialVehicles?: number;
	businessOverviewNumberOfEmployees?: number;
	loadedKilometers?: number;
	emptyKilometers?: number;
	totalKilometersTraveled?: number;
	numberOfVehiclesAtEndOfPeriod?: number;
	totalVehiclesNationwide?: number;
	totalActiveVehiclesNationwide?: number;
	source?: number;
	[key: string]: string | number | undefined;
}

export interface BusinessPerformanceReportRow {
	operatorNumber?: string;
	industryClassification?: string;
	transportBureauName?: string;
	prefecture?: string;
	operatorName?: string;
	commercialVehicles?: number;
	numberOfEmployees?: number;
	numberOfDrivers?: number;
	businessDescription1?: string;
	businessDescription2?: string;
	businessDescription3?: string;
	hokkaidoTotalAvailableVehicles?: number;
	hokkaidoTotalActiveVehicles?: number;
	hokkaidoTotalKilometers?: number;
	hokkaidoLoadedKilometers?: number;
	hokkaidoActualTransportVolume?: number;
	hokkaidoConsignedTransportVolume?: number;
	hokkaidoOperatingRevenue?: number;
	tohokuTotalAvailableVehicles?: number;
	tohokuTotalActiveVehicles?: number;
	source?: string;
	n03_001?: string;
	n03_002?: string;
	n03_003?: string;
	n03_004?: string;
	n03_007?: number;
	geometry?: unknown;
	[key: string]: string | number | undefined | unknown;
}
