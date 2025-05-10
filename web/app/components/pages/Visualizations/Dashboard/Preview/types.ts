import type { Dayjs } from "dayjs";
import type { ChartType } from "~/components/molecules/Chart/types";
import type { Item } from "~/models/items";

export interface ChartsFormType {
	dateFrom: Dayjs;
	dateTo: Dayjs;
	selectArea: string | undefined;
	district: string[] | undefined;
	variousRegions: string | undefined;
	details: string | undefined;
	id: string;
	title: string;
	type: ChartType;
	xAxis: keyof Item;
	yAxis: keyof Item;
	isSelected: boolean;
	createdAt: number;
	mapping?: { value: string; key: string }[];
	prefecture?: string[];
	city?: string[];
	data?: Item[];
	stackKeys?: string[];
	graphFor: "事故分析" | "飛行計画分析";
}
