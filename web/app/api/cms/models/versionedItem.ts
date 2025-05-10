/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { field } from "./field";
export type versionedItem = {
	id?: string;
	modelId?: string;
	fields?: Array<field>;
	createdAt?: string;
	updatedAt?: string;
	version?: string;
	parents?: Array<string>;
	refs?: Array<string>;
	referencedItems?: Array<versionedItem>;
	metadataFields?: Array<field>;
	isMetadata?: boolean;
};
