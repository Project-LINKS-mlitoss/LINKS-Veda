import type { BarChartData } from "~/components/molecules/Chart/BarChart/types";
import type { PieChartData } from "~/components/molecules/Chart/PieChart/types";
import type { ChartType } from "~/components/molecules/Chart/types";

export const TransportationTypes = {
	海運: "海運",
	自動車: "自動車",
	鉄道: "鉄道",
} as const;

export type TransportationType =
	(typeof TransportationTypes)[keyof typeof TransportationTypes];

export const isTransportationType = (
	type: string,
): type is TransportationType => {
	return Object.values(TransportationTypes).some((v) => v === type);
};

export type StringSelection = {
	name: string;
	isAll: boolean;
};

export type UFN001DefinitionResponse = {
	prefecturesAnalysis: {
		targetYears: number[];
		modes: StringSelection[];
		products: StringSelection[];
		transportEfficiencyConditions: PrefectureEfficiencyCondition[];
	};
	modeAnalysis: {
		points: ModePointGroup[];
		conditions: ModeCondition[];
	};
};

export type ModePointGroup = {
	mode: TransportationType;
	basePoints: string[];
	endPoints: string[];
};

export type PrefectureEfficiencyCondition = {
	mode: TransportationType;
	efficiencies: readonly EfficiencyDefinition[];
};

export type ModeCondition = {
	mode: TransportationType;
	efficiencies: readonly EfficiencyDefinition[];
	purposes: PurposesDefinition;
};

export type DefinitionValue = {
	id: number;
	name: string;
	greaterThanOrEqual?: number | null;
	lessThan?: number | null;
};

export type EfficiencyDefinition = {
	name: string;
	values: readonly DefinitionValue[];
};

export type PurposesDefinition = {
	name: string;
	values: readonly PurposeDefinition[];
};

export type PurposeDefinition = {
	name: string;
	children: readonly PurposeChildDefinition[];
};

export type PurposeChildDefinition = {
	name: string;
	values: readonly DefinitionValue[];
};

export type UFN002DefinitionResponse = {
	originNames: string[];
	destinationNames: string[];
	optimization: StringSelection[];
	modes: StringSelection[];
};

export type TransportEfficiencyType =
	(typeof TransportEfficiencyTypes)[keyof typeof TransportEfficiencyTypes];

export const isTransportEfficiencyType = (
	type: string,
): type is TransportEfficiencyType => {
	return Object.values(TransportEfficiencyTypes).some((v) => v === type);
};

export const TransportEfficiencyTypes = {
	平均_総トン数: "平均_総トン数",
	"平均_最大積載量（kg）": "平均_最大積載量（kg）",
	発駅_輸送力: "発駅_輸送力",
} as const;

export type PrefectureTransportEfficiencyCondtion = {
	name: TransportEfficiencyType;
	ids: number[];
};

export type PrefectureTransportEfficiencyParams = {
	type: TransportationType;
	condtion: PrefectureTransportEfficiencyCondtion;
};

export type AggregationPrefectureMapParam = {
	years: number[];
	basePoints: string[];
	endPoints: string[];
	modes: string[];
	products: string[];
	transportEfficiencies: PrefectureTransportEfficiencyParams[];
};

export type AggregationModeMapParam = {
	years: number[];
	mode: string;
	basePoint: string;
	endPoints: string[];
};

export type PrefectureTable = {
	起点: string;
	終点: string;
	品目区分: string;
	details: PrefectureTableDetail[];
};

export type PrefectureTableDetail = {
	年度: number;
	総貨物量: ValueUnit;
	輸送距離: ValueUnit;
	CO2排出量: Record<string, ValueUnit>;
	積載率: Record<string, ValueUnit>;
	分担率: Record<string, ValueUnit>;
	輸送能力: Record<string, ValueUnit>;
};

export type ValueUnit = {
	value: number;
	unit: string;
};

export type AggregationPrefectureMapResponse = {
	source: PrefectureSource;
	table: PrefectureTable[];
	bars: GeoJSON.FeatureCollection<GeoJSON.Polygon, PrefectureBarProperties>[];
	lines: GeoJSON.FeatureCollection<GeoJSON.LineString, PrefectureProperties>;
};

export type AggregationModeMapResponse = {
	arcs: GeoJSON.FeatureCollection<GeoJSON.LineString, ModeArcProperties>[];
};

export type AggregationPrefectureChartParam = {
	chartType: ChartType;
	params: PrefecturePieChartParam | PrefectureBarChartParam;
};

export type AggregationModeChartParam = {
	chartType: ChartType;
	params: ModePieChartParam | ModeBarChartParam;
};

export const isChartType = (type: string): type is ChartType => {
	return type === "pie" || type === "bar";
};

export const PrefecturePieChartTypes = {
	品目区分: "品目区分",
	モード: "モード",
	"品目区分×モード": "品目区分×モード",
} as const;

export type PrefecturePieChartType =
	(typeof PrefecturePieChartTypes)[keyof typeof PrefecturePieChartTypes];

export const isPrefecturePieChartType = (
	type: string,
): type is PrefecturePieChartType => {
	return Object.values(PrefecturePieChartTypes).some((v) => v === type);
};

export const PrefectureBarChartTypes = {
	品目区分: "品目区分",
	モード: "モード",
	平均_積載率: "平均_積載率",
} as const;

export type PrefectureBarChartType =
	(typeof PrefectureBarChartTypes)[keyof typeof PrefectureBarChartTypes];

export const isPrefectureBarChartType = (
	type: string,
): type is PrefectureBarChartType => {
	return Object.values(PrefectureBarChartTypes).some((v) => v === type);
};

export const ModePieChartTypes = {
	輸送用途: "輸送用途",
} as const;

export type ModePieChartType =
	(typeof ModePieChartTypes)[keyof typeof ModePieChartTypes];

export const isModePieChartType = (type: string): type is ModePieChartType => {
	return Object.values(ModePieChartTypes).some((v) => v === type);
};

// export const ModeBarChartTypes = {} as const;

// export type ModeBarChartType =
//   (typeof ModeBarChartTypes)[keyof typeof ModeBarChartTypes];

// export const isModeBarChartType = (type: string): type is ModeBarChartType => {
//   return Object.values(ModeBarChartTypes).some((v) => v === type);
// };

export type PrefecturePieChartParam = {
	attribute: PrefecturePieChartType;
} & AggregationPrefectureMapParam;

export type XAxisType = "起点" | "終点（都道府県別）" | "年度";
export const YEAR_AXIS: XAxisType = "年度";

export type PrefectureBarChartParam = {
	xAxis: XAxisType;
	yAxis: "輸送量";
	attribute: PrefectureBarChartType;
} & AggregationPrefectureMapParam;

export type ModePieChartParam = {
	years: number[];
	basePoint: string;
	endPoints: string[];
	modes: string[];
	products: string[];
	attribute: ModePieChartType;
};

export type ModeBarChartParam = {
	years: number[];
	basePoint: string;
	endPoints: string[];
	modes: string[];
	//attribute: ModeBarChartType;
};

export type AggregationRow = {
	year: number;
	basePoint: string;
	endPoint: string;
	mode: string;
	product: string;
	value: number;
};

export type DetailRow = {
	year: number;
	basePoint: string;
	endPoint: string;
	mode: string;
	capacity: number;
	actual: number;
	ratio: number;
};

export type PrefectureProperties = {
	name: string;
};

export type PrefectureBarProperties = {
	年度: number;
	都道府県: string;
	モード: string;
	自動車?: number;
	海運?: number;
	鉄道?: number;
};

export type PrefectureArcProperties = {
	起点: string;
	終点: string;
	年度: number;
	貨物量: number;
	積載率?: string;
	// {モード}分担率: string
} & Record<string, string | number>;

export type ModeArcProperties = {
	起点: string;
	終点: string;
	年度: number;
};

export type PrefecturesParams = {
	names: string[];
};

export type PrefecturePointsParams = {
	names: string[];
};

export type SearchMultimodalRouteParams = {
	originName: string;
	destinationName: string;
	quantity: number;
	modes: string[];
};

export type WaypointInformation =
	| TrainWaypointInformation
	| ShipWaypointInformation;

export type TrainWaypointInformation = {
	type: "train";
	純平日一日あたり平均駅間輸送量?: number;
	発駅_積載率?: number;
	発駅_輸送力?: number;
	発駅_発トン数_コンテナ?: number;
	発駅_発トン数_車扱?: number;
};

export type ShipWaypointInformation = {
	type: "ship";
	サンプル数: number;
	平均_総トン数: number;
	平均_載貨重量トン数: number;
	平均_積載率: number;
	平均_貨物の重量: number;
};

export const OptimizationTypes = {
	総時間: "総時間",
	総距離: "総距離",
	総排出CO2: "総排出CO2",
} as const;

export type OptimizationType =
	(typeof OptimizationTypes)[keyof typeof OptimizationTypes];

export const isOptimizationType = (type: string): type is OptimizationType => {
	return Object.values(OptimizationTypes).some((v) => v === type);
};

export type RouteTable = {
	No: number;
	交通モード: string;
	総所要時間: number;
	総距離: number;
	総CO2発生量: number;
	details: RouteTableDetail[];
	waypointInformation?: WaypointInformation;
};

export type RouteTableDetail = {
	originName: string;
	destinationName: string;
	交通モード: string;
	所要時間: ValueUnit;
	距離: ValueUnit;
	CO2発生量: ValueUnit;
};

export type SearchMultimodalRouteMapResponse = {
	table: RouteTable[];
	routes: GeoJSON.FeatureCollection<
		GeoJSON.LineString | GeoJSON.MultiLineString,
		SearchMultimodalRouteProperties
	>;
};

export type SearchMultimodalRouteProperties = {
	originName: string;
	originLon: number;
	originLat: number;
	destinationName: string;
	destinationLon: number;
	destinationLat: number;
	transportationMode: string;
	minimum_timeFlag: number;
	minimumDistanceFlag: number;
	totalTime: number;
	totalDistance: number;
	totalCO2: number;
	waypointName_1: string | null;
	waypointMode_1: string | null;
	waypointLat_1: number | null;
	waypointLon_1: number | null;
	waypointTime_1: number | null;
	waypointDistance_1: number | null;
	waypointCO2_1: number | null;
	waypointName_2: string | null;
	waypointMode_2: string | null;
	waypointLat_2: number | null;
	waypointLon_2: number | null;
	waypointTime_2: number | null;
	waypointDistance_2: number | null;
	waypointCO2_2: number | null;
	waypointName_3: string | null;
	waypointMode_3: string | null;
	waypointLat_3: number | null;
	waypointLon_3: number | null;
	waypointTime_3: number | null;
	waypointDistance_3: number | null;
	waypointCO2_3: number | null;
	waypointName_4: string | null;
	waypointMode_4: string | null;
	waypointLat_4: number | null;
	waypointLon_4: number | null;
	waypointTime_4: number | null;
	waypointDistance_4: number | null;
	waypointCO2_4: number | null;
	waypointName_5: string | null;
	waypointMode_5: string | null;
	waypointLat_5: number | null;
	waypointLon_5: number | null;
	waypointTime_5: number | null;
	waypointDistance_5: number | null;
	waypointCO2_5: number | null;
};

export type UC13_05_内航船舶輸送統計調査 = {
	年度: number;
	積地_港名: string;
	積地_都道府県名: string;
	揚地_港名: string;
	揚地_都道府県名: string;
	サンプル数: number;
	平均_総トン数: number;
	平均_載貨重量トン数: number;
	用途_自動車専用船_サンプル数: number;
	用途_自動車専用船_総トン数: number;
	用途_自動車専用船_載貨重量トン数: number;
	用途_セメント専用船_サンプル数: number;
	用途_セメント専用船_総トン数: number;
	用途_セメント専用船_載貨重量トン数: number;
	用途_石灰石専用船_サンプル数: number;
	用途_石灰石専用船_総トン数: number;
	用途_石灰石専用船_載貨重量トン数: number;
	用途_石炭石専用船_サンプル数: number;
	用途_石炭石専用船_総トン数: number;
	用途_石炭石専用船_載貨重量トン数: number;
	用途_コンテナ専用船_サンプル数: number;
	用途_コンテナ専用船_総トン数: number;
	用途_コンテナ専用船_載貨重量トン数: number;
	用途_RORO船_サンプル数: number;
	用途_RORO船_総トン数: number;
	用途_RORO船_載貨重量トン数: number;
	用途_その他の貨物船_サンプル数: number;
	用途_その他の貨物船_総トン数: number;
	用途_その他の貨物船_載貨重量トン数: number;
	用途_油送船_サンプル数: number;
	用途_油送船_総トン数: number;
	用途_油送船_載貨重量トン数: number;
	用途_プッシャーバージ又は台船_サンプル数: number;
	用途_プッシャーバージ又は台船_総トン数: number;
	用途_プッシャーバージ又は台船_載貨重量トン数: number;
	平均_積載率: number;
	平均_貨物の重量: number;
	平均_輸送距離: number;
	積地_緯度: number;
	積地_経度: number;
	揚地_緯度: number;
	揚地_経度: number;
};

export type UC13_06_自動車輸送統計調査 = {
	都道府県コード_発地: number;
	都道府県名_発地: string;
	都道府県コード_着地: number;
	都道府県名_着地: string;
	調査年: number;
	サンプル数: number;
	"平均_最大積載量（kg）": number;
	用途別_台数_特定荷主専属: number;
	用途別_台数_積合せ貨物: number;
	用途別_台数_一般貨物: number;
	用途別_台数_集配: number;
	用途別_台数_その他: number;
	平均_休車日数: number;
	平均_調査期間中の走行距離: number;
	平均_輸送回数: number;
	平均_輸送当たり積載率: number;
	平均_輸送当たり重量: number;
	発地_都道府県_緯度: number;
	発地_都道府県_経度: number;
	着地_都道府県_緯度: number;
	着地_都道府県_経度: number;
};

export type UC13_07_府県相互間輸送トン数表 = {
	年度: number;
	モード: string;
	品目: string;
	発: string;
	北海道_着: number;
	青森_着: number;
	岩手_着: number;
	宮城_着: number;
	福島_着: number;
	秋田_着: number;
	山形_着: number;
	茨城_着: number;
	栃木_着: number;
	群馬_着: number;
	埼玉_着: number;
	千葉_着: number;
	東京_着: number;
	神奈川_着: number;
	新潟_着: number;
	富山_着: number;
	石川_着: number;
	福井_着: number;
	山梨_着: number;
	長野_着: number;
	静岡_着: number;
	岐阜_着: number;
	愛知_着: number;
	三重_着: number;
	滋賀_着: number;
	京都_着: number;
	奈良_着: number;
	和歌山: number;
	大阪_着: number;
	兵庫_着: number;
	鳥取_着: number;
	島根_着: number;
	岡山_着: number;
	広島_着: number;
	山口_着: number;
	香川_着: number;
	愛媛_着: number;
	徳島_着: number;
	高知_着: number;
	福岡_着: number;
	佐賀_着: number;
	長崎_着: number;
	熊本_着: number;
	大分_着: number;
	宮崎_着: number;
	鹿児島_着: number;
	沖縄_着: number;
};

export type UC13_11_都道府県間距離一覧表 = {
	発: string;
	着: string;
	距離: number;
};

export type UC13_12_都道府県間CO2排出量 = {
	年度: number;
	モード: string;
	品目: string;
	発: string;
	北海道_着: number;
	青森_着: number;
	岩手_着: number;
	宮城_着: number;
	福島_着: number;
	秋田_着: number;
	山形_着: number;
	茨城_着: number;
	栃木_着: number;
	群馬_着: number;
	埼玉_着: number;
	千葉_着: number;
	東京_着: number;
	神奈川_着: number;
	新潟_着: number;
	富山_着: number;
	石川_着: number;
	福井_着: number;
	山梨_着: number;
	長野_着: number;
	静岡_着: number;
	岐阜_着: number;
	愛知_着: number;
	三重_着: number;
	滋賀_着: number;
	京都_着: number;
	奈良_着: number;
	和歌山: number;
	大阪_着: number;
	兵庫_着: number;
	鳥取_着: number;
	島根_着: number;
	岡山_着: number;
	広島_着: number;
	山口_着: number;
	香川_着: number;
	愛媛_着: number;
	徳島_着: number;
	高知_着: number;
	福岡_着: number;
	佐賀_着: number;
	長崎_着: number;
	熊本_着: number;
	大分_着: number;
	宮崎_着: number;
	鹿児島_着: number;
	沖縄_着: number;
};

export type UC13_08_JR貨物輸送実績調査 = {
	年度: number;
	発駅コード: string;
	発駅名: string;
	発駅_都道府県名: string;
	発駅_都道府県コード: string;
	着駅コード: string;
	着駅名: string;
	着駅_都道府県名: string;
	着駅_都道府県コード: string;
	発駅_輸送力: number;
	発駅_積載個数: number;
	発駅_積載率: number;
	着駅_輸送力: number;
	着駅_積載個数: number;
	着駅_積載率: number;
	発駅_発トン数_コンテナ: number;
	発駅_発トン数_車扱: number;
	発駅_発トン数_総計: number;
	着駅_着トン数_コンテナ: number;
	着駅_着トン数_車扱: number;
	着駅_着トン数_総計: number;
	純平日一日あたり平均駅間輸送量: number;
	発駅_緯度: number;
	発駅_経度: number;
	着駅_緯度: number;
	着駅_経度: number;
	発駅_都道府県_緯度: number;
	発駅_都道府県_経度: number;
	着駅_都道府県_緯度: number;
	着駅_都道府県_経度: number;
};

export const UFN001PrefectureAll: string = "全国" as const;
export const UFN001TransportationModeAll: string = "全機関" as const;
export const UFN001ProductAll: string = "全貨物" as const;
export const UFN002TransportationModeAll: string = "すべてのモード" as const;

export const UFN001AllPrefectures: string[] = [
	"北海道",
	"青森県",
	"岩手県",
	"宮城県",
	"福島県",
	"秋田県",
	"山形県",
	"茨城県",
	"栃木県",
	"群馬県",
	"埼玉県",
	"千葉県",
	"東京都",
	"神奈川県",
	"新潟県",
	"富山県",
	"石川県",
	"福井県",
	"山梨県",
	"長野県",
	"静岡県",
	"岐阜県",
	"愛知県",
	"三重県",
	"滋賀県",
	"京都府",
	"奈良県",
	"和歌山県",
	"大阪府",
	"兵庫県",
	"鳥取県",
	"島根県",
	"岡山県",
	"広島県",
	"山口県",
	"香川県",
	"愛媛県",
	"徳島県",
	"高知県",
	"福岡県",
	"佐賀県",
	"長崎県",
	"熊本県",
	"大分県",
	"宮崎県",
	"鹿児島県",
	"沖縄県",
] as const;

export const UFN001AllTransportationModes: string[] = [
	"自動車",
	"海運",
	"鉄道",
] as const;

export const UFN001AllProducts: string[] = [
	"その他",
	"化学工業品",
	"金属・機械工業品",
	"軽工業品",
	"鉱産品",
	"雑工業品",
	"特殊品",
	"農産品",
	"農林水産",
] as const;

export type PrefectureSource = {
	総貨物量: string;
	輸送距離: string;
	CO2排出量: PrefectureSourceMode;
	積載率: PrefectureSourceMode;
	分担率: PrefectureSourceMode;
	輸送能力: PrefectureSourceMode;
};

export type PrefectureSourceMode = {
	自動車: string;
	海運: string;
	鉄道: string;
};

export type UnitizedPieChartData = {
	unit: string;
	data: PieChartData[];
};

export type UnitizedBarChartData = {
	unit: string;
	data: BarChartData[];
};
