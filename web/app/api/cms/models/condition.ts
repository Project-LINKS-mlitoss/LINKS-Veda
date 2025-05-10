/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { fieldSelector } from "./fieldSelector";
export type condition = {
	and?: Array<condition>;
	or?: Array<condition>;
	basic?: {
		fieldId?: fieldSelector;
		operator?: "equals" | "notEquals";
		value?: any;
	};
	nullable?: {
		fieldId?: fieldSelector;
		operator?: "empty" | "notEmpty";
	};
	multiple?: {
		fieldId: fieldSelector;
		operator:
			| "includesAny"
			| "notIncludesAny"
			| "includesAll"
			| "notIncludesAll";
		value: Array<any>;
	};
	bool?: {
		fieldId: fieldSelector;
		operator: "equals" | "notEquals";
		value: boolean;
	};
	string?: {
		fieldId: fieldSelector;
		operator:
			| "contains"
			| "notContains"
			| "startsWith"
			| "endsWith"
			| "notStartsWith"
			| "notEndsWith";
		value: string;
	};
	number?: {
		fieldId: fieldSelector;
		operator:
			| "greaterThan"
			| "lessThan"
			| "greaterThanOrEqualTo"
			| "lessThanOrEqualTo";
		value: number;
	};
	time?: {
		fieldId: fieldSelector;
		operator:
			| "before"
			| "after"
			| "beforeOrOn"
			| "afterOrOn"
			| "ofThisWeek"
			| "ofThisMonth"
			| "ofThisYear";
		value: string;
	};
};
