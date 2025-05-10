import { ReactHTML } from "react";
import type { ChartsFormType } from "../ChartsViewer/types";
import type { ChartType } from "../types";

export interface IncidentOption {
	name: string;
	value: number;
}

export interface CityData {
	name: string;
	incident: IncidentOption[];
}

export interface FilterFormData {
	title: string;
	type: ChartType;
	xAxis: string;
	yAxis?: string[] | number[];
}

export type FieldType = string | number;

export interface FiltersProps {
	fields: FieldType[];
	initialValues?: ChartsFormType | null;
	isEditing: boolean;
	onSubmit: (values: ChartsFormType) => void;
	onOverwrite: (values: ChartsFormType) => void;
	onDelete: () => void;
	handleBack?: () => void;
}

export interface SearchPanelProps {
	title: string;
	children: React.ReactNode;
	onClick?: () => void;
}
