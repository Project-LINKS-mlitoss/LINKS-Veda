/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LineString } from "./LineString";
import type { MultiLineString } from "./MultiLineString";
import type { MultiPoint } from "./MultiPoint";
import type { MultiPolygon } from "./MultiPolygon";
import type { Point } from "./Point";
import type { Polygon } from "./Polygon";
export type Geometry = {
	type?:
		| "Point"
		| "MultiPoint"
		| "LineString"
		| "MultiLineString"
		| "Polygon"
		| "MultiPolygon"
		| "GeometryCollection";
	coordinates?:
		| Point
		| MultiPoint
		| LineString
		| MultiLineString
		| Polygon
		| MultiPolygon;
	geometries?: Array<Geometry>;
};
