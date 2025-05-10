import type { BarChartData } from "~/components/molecules/Chart/BarChart/types";
import type { PieChartData } from "~/components/molecules/Chart/PieChart/types";

export type EndDateGt = "以降" | "以前";

export type PeriodUnitType = "1ヶ月" | "3ヶ月" | "1年";

export type SelectAreas = {
	cities?: string[];
	prefectures?: string[];
	prefectureCities?: Record<string, string[]>;
};

export type WarehouseFilterParam = {
	start?: Date;
	end?: Date | EndDateGt;
	companyNames?: string[];
	warehouseSelectAreas?: SelectAreas;
	officeConditions?: {
		names?: string[];
		selectAreas?: SelectAreas;
		productType?: string;
	};
	warehouseConditions?: {
		names?: string[];
		structures?: string[];
		//areas?: string[];
		warehouseTypes?: string[];
		// なんかの状況?: string[];
		// なんかの状況?: string[];
		equipments?: string[];
		inventoryItems?: string[];
		structureFrame?: string[];
		structureFireResistant?: string[];
		hasElevatorOrLift?: string[];
		refrigerantTypes?: string[];
		isHazardousStorage?: string[];
		storageTemperature?: string[];
	};
	jurisdictionBureaus?: string[];
};

export type WarehouseFilterChoices = {
	companyNames: string[];
	officeConditions: {
		names: string[];
		productTypes: string[];
	};
	warehouseConditions: {
		names: string[];
		structures: string[];
		//areas: string[];
		warehouseTypes: string[];
		// なんかの状況: string[];
		// なんかの状況: string[];
		equipments: string[];
		inventoryItems: string[];
		structureFrame: string[];
		structureFireResistant: string[];
		hasElevatorOrLift: string[];
		refrigerantTypes: string[];
		isHazardousStorage: string[];
		storageTemperature: string[];
	};

	jurisdictionBureaus: string[];
};

export type GeoJSONWarehouseProperties = {
	id: number;

	倉庫ID: string;
	倉庫の名称: string;
	倉庫の所在地: string;
	営業所ID: string;
	営業所の名称: string;
	営業所の所在地: string;
	事業者ID: string;
	事業者の氏名又は名称: string;
	代表者名: string;
	倉庫の種類: string;
	保管物品の種類: string;
	主要構造: string;
	主要構造_骨組: string;
	主要構造_耐火性の有無: string;
	建築年月日又は建築完了予定年月日: Date;
	土地及び倉庫に係る使用権原の状況_土地: string;
	土地及び倉庫に係る使用権原の状況_建物: string;
	合計_面積: number;
	"1階の規模_面積": number;
	"2階の規模_面積": number;
	"3階の規模_面積": number;
	"4階の規模_面積": number;
	"5階の規模_面積": number;
	"6階の規模_面積": number;
	附属設備_消防設備: string;
	附属設備_防犯設備: string;
	附属設備_防そ設備: string;
	附属設備_遮熱装置: string;
	附属設備_その他の設備: string;
	その他: string;
	エレベーター又は垂直搬送機の有無: string;
	危険物貯蔵所への該当: string;
	構造の詳細_基礎_柱下: string;
	構造の詳細_基礎_壁下: string;
	構造の詳細_骨組み_小屋組み: string;
	構造の詳細_骨組み_軸組み: string;
	構造の詳細_骨組み_床組み: string;
	構造の詳細_壁_外壁: string;
	構造の詳細_壁_間仕切り壁: string;
	構造の詳細_壁_防火壁: string;
	構造の詳細_屋根: string;
	構造の詳細_天井: string;
	構造の詳細_床: string;
	構造の詳細_窓_側窓: string;
	構造の詳細_窓_天窓: string;
	構造の詳細_出入口_外壁にある出入口: string;
	構造の詳細_出入口_間仕切り壁にある出入口: string;
	構造の詳細_出入口_防火壁にある出入口: string;
	冷却方式: string;
	蒸発方式: string;
	"冷凍能力（KW）": string;
	使用する冷媒の種類: string;
	圧縮機_型式: string;
	"圧縮機_電動機（キロワット）": string;
	圧縮機_台数: string;
	"冷蔵室の規模_面積（m^2）": string;
	"冷蔵室の規模_高さ（m）": string;
	"冷蔵室の規模_容積（m^3）": string;
	"収容能力（トン）": string;
	"保管温度（℃）": string;
	"総熱損失（W）": string;
	"配管の冷却面積（m^2）_天井": string;
	"配管の冷却面積（m^2）_壁": string;
	"防熱装置の材料の種類、熱伝導率及び厚さ_天井": string;
	"防熱装置の材料の種類、熱伝導率及び厚さ_床": string;
	"防熱装置の材料の種類、熱伝導率及び厚さ_外壁": string;
	"防熱装置の材料の種類、熱伝導率及び厚さ_間仕切り壁": string;
	"電灯（KW）": string;
	"電動送風機（KW）": string;
	資本金又は出資の総額: string;
	発券区分: string;
	管理番号: string;
	登録番号: string;
	営業所番号: string;
	倉庫番号: string;
	設置登録番号: string;
	設置登録年月日: string;
	区画番号: string;
	区画名称: string;
	倉庫所在地_行政区域コード: string;
	倉庫所在地_都道府県名: string;
	倉庫所在地_支庁・振興局名: string;
	倉庫所在地_郡・政令都市名: string;
	倉庫所在地_市区町村名: string;
	倉庫所在地_緯度: number;
	倉庫所在地_経度: number;
	営業所所在地_行政区域コード: string;
	営業所所在地_都道府県名: string;
	営業所所在地_支庁・振興局名: string;
	営業所所在地_郡・政令都市名: string;
	営業所所在地_市区町村名: string;
	営業所所在地_緯度: number;
	営業所所在地_経度: number;
	事業者所在地_行政区域コード: string;
	事業者所在地_都道府県名: string;
	事業者所在地_支庁・振興局名: string;
	事業者所在地_郡・政令都市名: string;
	事業者所在地_市区町村名: string;
	事業者所在地_緯度: number;
	事業者所在地_経度: number;
	倉庫管轄局: string;
	倉庫管轄支局: string;
	倉庫都道府県: string;
	営業所管轄局: string;
	営業所管轄支局: string;
	営業所都道府県: string;
	主たる営業所: string;
	主たる営業所の管轄局: string;

	productTypes?: string[];
	resultReports?: ResultReport[];
};

export type ResultReport = {} & UC19_02_倉庫業実績報告書;

export type TargetType =
	| "前期末保管残高_数量"
	| "当期中入庫高_数量"
	| "当期中出庫高_数量"
	| "当期末保管残高_数量"
	| "当期末保管残高_金額";

export type UC19_01_倉庫業登録申請書 = {
	事業者の所在地: string;
	事業者所在地_緯度: number;
	事業者所在地_経度: number;
	事業者の氏名又は名称: string;
	事業者ID: string;
	代表者名: string;
	営業所の名称: string;
	営業所ID: string;
	営業所の所在地: string;
	資本金又は出資の総額_資本金又は出資の別: string;
	資本金又は出資の総額_総額: string;
	倉庫の名称: string;
	倉庫ID: string;
	倉庫の所在地: string;
	倉庫所在地_緯度: number;
	倉庫所在地_経度: number;
	倉庫の種類: string;
	保管物品の種類: string;
	主要構造: string;
	"倉庫の種別及び保管物品の種類（詳細）": string;
	建築年月日又は建築完了予定年月日: string;
	土地及び倉庫に係る使用権原の状況_土地: string;
	土地及び倉庫に係る使用権原の状況_建物: string;

	"1階の規模_面積": number;
	"2階の規模_面積": number;
	"3階の規模_面積": number;
	"4階の規模_面積": number;
	"5階の規模_面積": number;
	"6階の規模_面積": number;

	合計_面積: number;
	構造の詳細_基礎_柱下: string;
	構造の詳細_基礎_壁下: string;
	構造の詳細_骨組み_小屋組み: string;
	構造の詳細_骨組み_軸組み: string;
	構造の詳細_骨組み_床組み: string;
	構造の詳細_壁_外壁: string;
	構造の詳細_壁_間仕切り壁: string;
	構造の詳細_壁_防火壁: string;
	構造の詳細_屋根: string;
	構造の詳細_天井: string;
	構造の詳細_床: string;
	構造の詳細_窓_側窓: string;
	構造の詳細_窓_天窓: string;
	構造の詳細_出入口_外壁にある出入口: string;
	構造の詳細_出入口_間仕切り壁にある出入口: string;
	構造の詳細_出入口_防火壁にある出入口: string;
	附属設備_消防設備: string;
	附属設備_防犯設備: string;
	附属設備_防そ設備: string;
	附属設備_遮熱装置: string;
	附属設備_その他の設備: string;
	その他: string;

	管理番号: string;
	営業所管轄局: string;
	営業所管轄支局: string;
	営業所都道府県: string;
	発券区分: string;
	登録番号: string;
	氏名又は名称: string;
	資本金又は出資の総額: string;
	主たる営業所: string;
	主たる営業所の管轄局: string;
	営業所番号: string;
	営業所名称: string;
	営業所住所: string;
	倉庫番号: string;
	倉庫名称: string;
	倉庫所在地: string;
	設置登録番号: string;
	設置登録年月日: string;
	倉庫管轄局: string;
	倉庫管轄支局: string;
	倉庫都道府県: string;
	区画番号: string;
	区画名称: string;
	事業者所在地_都道府県名: string;
	事業者所在地_支庁・振興局名: string;
	事業者所在地_郡・政令都市名: string;
	事業者所在地_市区町村名: string;
	倉庫所在地_行政区域コード: string;
	倉庫所在地_都道府県名: string;
	倉庫所在地_支庁・振興局名: string;
	倉庫所在地_郡・政令都市名: string;
	倉庫所在地_市区町村名: string;
};

export type UC19_02_倉庫業実績報告書 = {
	事業者名称: string;
	事業者ID: string;
	営業所名称: string;
	営業所ID: string;
	営業所の住所: string;
	年期_年度: number;
	年期_四半期: number;
	品目名: string;
	前期末保管残高_数量: number;
	当期中入庫高_数量: number;
	当期中出庫高_数量: number;
	当期末保管残高_数量: number;
	当期末保管残高_金額: number;
};

export type PieChartCategory =
	| "倉庫の種類"
	| "倉庫管轄局"
	| "倉庫面積"
	| "倉庫の構造"
	| "附属設備"
	| "冷蔵設備"
	| "品目"
	| "前期末保管残高_数量"
	| "当期中入庫高_数量"
	| "当期中出庫高_数量"
	| "当期末保管残高_数量"
	| "当期末保管残高_金額"
	| "倉庫登録件数";

export type BarChartXAxis = "行政区域";

export type BarChartYAxis =
	| "入出庫高"
	| "保管残高"
	| "倉庫面積"
	| "倉庫面積当たり保管残高"
	| "在貨面積"
	| "在貨面積当たり保管残高";

export type UnitizedPieChartData = {
	unit: string;
	data: PieChartData[];
};

export type UnitizedBarChartData = {
	unit: string;
	data: BarChartData[];
};

export class Aggregations {
	private targetLabelsMap: Map<TargetType, Set<string>>;
	private values: Map<string, number>;
	private productTypeSet: Set<string>;

	constructor() {
		this.targetLabelsMap = new Map<TargetType, Set<string>>();
		this.targetLabelsMap.set("前期末保管残高_数量", new Set());
		this.targetLabelsMap.set("当期中入庫高_数量", new Set());
		this.targetLabelsMap.set("当期中出庫高_数量", new Set());
		this.targetLabelsMap.set("当期末保管残高_数量", new Set());
		this.targetLabelsMap.set("当期末保管残高_金額", new Set());
		this.values = new Map<string, number>();
		this.productTypeSet = new Set<string>();
	}

	add(target: TargetType, label: string, value: number) {
		this.targetLabelsMap.get(target)?.add(label);
		this.values.set(label, (this.values.get(label) ?? 0) + (value ?? 0));
	}

	get(target: TargetType): Map<string, number> {
		const result = new Map<string, number>();

		const labelSet = this.targetLabelsMap.get(target);
		if (!labelSet) {
			return result;
		}

		for (const label of labelSet) {
			const value = this.values.get(label);
			result.set(label, value ?? 0);
		}

		return result;
	}
}

export class PieChartAggregator {
	private properties: GeoJSONWarehouseProperties[];
	private category: PieChartCategory;
	private values: Map<string, number>;

	constructor(
		properties: GeoJSONWarehouseProperties[],
		category: PieChartCategory,
	) {
		this.properties = properties;
		this.category = category;
		this.values = new Map<string, number>();
	}

	aggregate() {
		switch (this.category) {
			case "倉庫の種類":
			case "倉庫管轄局":
			case "倉庫の構造":
			case "附属設備":
			case "冷蔵設備":
			case "品目":
			case "倉庫登録件数":
				this.count();
				break;
			case "倉庫面積":
			case "前期末保管残高_数量":
			case "当期中入庫高_数量":
			case "当期中出庫高_数量":
			case "当期末保管残高_数量":
			case "当期末保管残高_金額":
				this.countRange();
				break;
			default:
				throw new Error(`Invalid category: ${this.category}`);
		}
	}

	getData(): UnitizedPieChartData {
		const data: PieChartData[] = [];
		this.values.forEach((value, key) => {
			// 円グラフのときは0以下の値は除外する
			if (value <= 0) return;
			data.push({
				name: key,
				value: value,
			});
		});
		data.sort((a, b) => b.value - a.value);

		return {
			unit: this.getUnit(),
			data: data,
		};
	}

	private count() {
		const keyMap = {
			倉庫の種類: (p: GeoJSONWarehouseProperties) => p.倉庫の種類,
			倉庫管轄局: (p: GeoJSONWarehouseProperties) => p.倉庫管轄局,
			倉庫の構造: (p: GeoJSONWarehouseProperties) => p.主要構造,
			附属設備: (p: GeoJSONWarehouseProperties) => p.附属設備_その他の設備,
			冷蔵設備: (p: GeoJSONWarehouseProperties) => p.冷却方式,
			品目: (p: GeoJSONWarehouseProperties) => p.保管物品の種類,
			倉庫登録件数: (p: GeoJSONWarehouseProperties) => p.倉庫ID,
		};
		const isKey = (key: PieChartCategory): key is keyof typeof keyMap =>
			Object.hasOwn(keyMap, key);

		if (!isKey(this.category)) {
			throw new Error(`Invalid key: ${this.category}`);
		}

		for (const property of this.properties) {
			const value = keyMap[this.category](property);
			if (value) {
				this.values.set(value, (this.values.get(value) ?? 0) + 1);
			}
		}
	}

	private countRange() {
		const keyMap = {
			倉庫面積: (p: GeoJSONWarehouseProperties) => [p.合計_面積],
			前期末保管残高_数量: (p: GeoJSONWarehouseProperties) =>
				p.resultReports
					? Array.from(p.resultReports.map((r) => r.前期末保管残高_数量))
					: [],
			当期中入庫高_数量: (p: GeoJSONWarehouseProperties) =>
				p.resultReports
					? Array.from(p.resultReports.map((r) => r.当期中入庫高_数量))
					: [],
			当期中出庫高_数量: (p: GeoJSONWarehouseProperties) =>
				p.resultReports
					? Array.from(p.resultReports.map((r) => r.当期中出庫高_数量))
					: [],
			当期末保管残高_数量: (p: GeoJSONWarehouseProperties) =>
				p.resultReports
					? Array.from(p.resultReports.map((r) => r.当期末保管残高_数量))
					: [],
			当期末保管残高_金額: (p: GeoJSONWarehouseProperties) =>
				p.resultReports
					? Array.from(p.resultReports.map((r) => r.当期末保管残高_金額))
					: [],
		};

		const rangeMap = {
			倉庫面積: () => [
				[undefined, 50],
				[50, 100],
				[100, 500],
				[500, 1000],
				[1000, 5000],
				[5000, undefined],
			],
			前期末保管残高_数量: () => [
				[undefined, 100],
				[100, 500],
				[500, 1000],
				[1000, 5000],
				[5000, 10000],
				[10000, 50000],
				[50000, 100000],
				[100000, undefined],
			],
			当期中入庫高_数量: () => [
				[undefined, 100],
				[100, 500],
				[500, 1000],
				[1000, 5000],
				[5000, 10000],
				[10000, 50000],
				[50000, 100000],
				[100000, undefined],
			],
			当期中出庫高_数量: () => [
				[undefined, 100],
				[100, 500],
				[500, 1000],
				[1000, 5000],
				[5000, 10000],
				[10000, 50000],
				[50000, 100000],
				[100000, undefined],
			],
			当期末保管残高_数量: () => [
				[undefined, 100],
				[100, 500],
				[500, 1000],
				[1000, 5000],
				[5000, 10000],
				[10000, 50000],
				[50000, 100000],
				[100000, undefined],
			],
			当期末保管残高_金額: () => [
				[undefined, 100],
				[100, 500],
				[500, 1000],
				[1000, 5000],
				[5000, 10000],
				[10000, 50000],
				[50000, 100000],
				[100000, undefined],
			],
		};

		const isKey = (key: PieChartCategory): key is keyof typeof keyMap =>
			Object.hasOwn(keyMap, key);

		if (!isKey(this.category)) {
			throw new Error(`Invalid key: ${this.category}`);
		}

		const range = rangeMap[this.category]();
		for (const property of this.properties) {
			const value = Array.from(keyMap[this.category](property)).reduce(
				(sum, val) => sum + val,
				0,
			);

			// 円グラフのときは0以下の値は除外する
			if (value === 0) continue;

			for (const [min, max] of range) {
				if (
					(min === undefined || value >= min) &&
					(max === undefined || value < max)
				) {
					const label = this.getLabel([min, max]);
					this.values.set(label, (this.values.get(label) ?? 0) + 1);
					break;
				}
			}
		}
	}

	private getLabel(range: [number | undefined, number | undefined]) {
		const [min, max] = range;
		if (min === undefined && max !== undefined) {
			return `${max}未満`;
		}
		if (min !== undefined && max === undefined) {
			return `${min}以上`;
		}
		return `${min}以上~${max}未満`;
	}

	private getUnit() {
		switch (this.category) {
			case "倉庫の種類":
			case "倉庫管轄局":
			case "倉庫の構造":
			case "附属設備":
			case "冷蔵設備":
			case "品目":
			case "倉庫登録件数":
			case "倉庫面積":
			case "前期末保管残高_数量":
			case "当期中入庫高_数量":
			case "当期中出庫高_数量":
			case "当期末保管残高_数量":
			case "当期末保管残高_金額":
				return "件";
			default:
				throw new Error(`Invalid category: ${this.category}`);
		}
	}
}

export class BarChartAggregator {
	private properties: GeoJSONWarehouseProperties[];
	private xAxis: BarChartXAxis;
	private yAxis: BarChartYAxis;
	private values: Map<string, BarChartData>;

	constructor(
		properties: GeoJSONWarehouseProperties[],
		xAxis: BarChartXAxis,
		yAxis: BarChartYAxis,
	) {
		this.properties = properties;
		this.xAxis = xAxis;
		this.yAxis = yAxis;
		this.values = new Map<string, BarChartData>();
	}

	aggregate() {
		if (this.xAxis !== "行政区域") {
			throw new Error(`Invalid xAxis: ${this.xAxis}`);
		}
		switch (this.yAxis) {
			case "入出庫高":
			case "保管残高":
				this.aggregateReport();
				break;
			case "倉庫面積":
				this.aggregateSimple();
				break;
			case "倉庫面積当たり保管残高":
				this.aggregateBalancePerArea();
				break;
			case "在貨面積当たり保管残高":
				this.aggregateBalancePerAreaUsed();
				break;
			default:
				throw new Error(`Invalid yAxis: ${this.yAxis}`);
		}
	}

	aggregateSimple() {
		const keyMap = {
			倉庫面積: (p: GeoJSONWarehouseProperties) => p.合計_面積,
			//在貨面積: (p: GeoJSONWarehouseProperties) => p.在貨面積,
		};

		const isKey = (key: BarChartYAxis): key is keyof typeof keyMap =>
			Object.hasOwn(keyMap, key);

		if (!isKey(this.yAxis)) {
			throw new Error(`Invalid yAxis: ${this.yAxis}`);
		}

		for (const property of this.properties) {
			const key = property.倉庫所在地_市区町村名;
			if (!this.values.has(key)) {
				this.values.set(key, { name: key, value: 0 });
			}
			const value = keyMap[this.yAxis](property) ?? 0;
			const data = this.values.get(key) as BarChartData;
			data.value += value;
		}
	}

	aggregateReport() {
		const keyMap = {
			入出庫高: (r: ResultReport) => r.当期中入庫高_数量 + r.当期中出庫高_数量,
			保管残高: (r: ResultReport) => r.当期末保管残高_金額,
		};

		const isKey = (key: BarChartYAxis): key is keyof typeof keyMap =>
			Object.hasOwn(keyMap, key);

		if (!isKey(this.yAxis)) {
			throw new Error(`Invalid yAxis: ${this.yAxis}`);
		}

		const entries: Map<string, Map<string, number>> = new Map();
		for (const property of this.properties) {
			if (!property.resultReports) {
				continue;
			}
			const key = property.倉庫所在地_市区町村名;
			if (!entries.has(key)) {
				entries.set(key, new Map<string, number>());
			}

			const breakdownEntries: Map<string, number> = entries.get(key) as Map<
				string,
				number
			>;
			for (const report of property.resultReports) {
				const value = keyMap[this.yAxis](report) ?? 0;
				breakdownEntries.set(
					report.品目名,
					(breakdownEntries.get(report.品目名) ?? 0) + value,
				);
			}
		}

		for (const [key, breakdownEntries] of entries) {
			const value = Array.from(breakdownEntries.values()).reduce(
				(acc, val) => acc + val,
				0,
			);
			this.values.set(key, {
				name: key,
				value: value,
				...Object.fromEntries(breakdownEntries),
			});
		}
	}

	aggregateBalancePerArea() {
		const keyMap = {
			倉庫面積当たり保管残高: (r: ResultReport) =>
				r.当期中入庫高_数量 + r.当期中出庫高_数量,
			在貨面積当たり保管残高: (r: ResultReport) =>
				r.当期中入庫高_数量 + r.当期中出庫高_数量,
		};

		const isKey = (key: BarChartYAxis): key is keyof typeof keyMap =>
			Object.hasOwn(keyMap, key);

		if (!isKey(this.yAxis)) {
			throw new Error(`Invalid yAxis: ${this.yAxis}`);
		}
	}

	aggregateBalancePerAreaUsed() {
		const keyMap = {
			倉庫面積当たり保管残高: (r: ResultReport) =>
				r.当期中入庫高_数量 + r.当期中出庫高_数量,
			在貨面積当たり保管残高: (r: ResultReport) =>
				r.当期中入庫高_数量 + r.当期中出庫高_数量,
		};

		const isKey = (key: BarChartYAxis): key is keyof typeof keyMap =>
			Object.hasOwn(keyMap, key);

		if (!isKey(this.yAxis)) {
			throw new Error(`Invalid yAxis: ${this.yAxis}`);
		}
	}

	getData(): UnitizedBarChartData {
		const data: BarChartData[] = Array.from(this.values.values());
		return {
			unit: this.getUnit(),
			data: data,
		};
	}

	private getUnit() {
		switch (this.yAxis) {
			case "入出庫高":
			case "保管残高":
			case "倉庫面積":
			case "倉庫面積当たり保管残高":
			case "在貨面積":
			case "在貨面積当たり保管残高":
				return "単位不明";
			default:
				throw new Error(`Invalid yAxis: ${this.yAxis}`);
		}
	}
}
