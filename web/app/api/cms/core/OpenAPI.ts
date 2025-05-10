/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiRequestOptions } from "./ApiRequestOptions";

type Resolver<T> = (options: ApiRequestOptions) => Promise<T>;
type Headers = Record<string, string>;

const ACCESS_TOKEN = process.env.VITE_ACCESS_TOKEN;
const CMS_API_URL = process.env.VITE_CMS_API_URL;

export type OpenAPIConfig = {
	BASE: string;
	VERSION: string;
	WITH_CREDENTIALS: boolean;
	CREDENTIALS: "include" | "omit" | "same-origin";
	TOKEN?: string | Resolver<string> | undefined;
	USERNAME?: string | Resolver<string> | undefined;
	PASSWORD?: string | Resolver<string> | undefined;
	HEADERS?: Headers | Resolver<Headers> | undefined;
	ENCODE_PATH?: ((path: string) => string) | undefined;
};

export const OpenAPI: OpenAPIConfig = {
	BASE: `${CMS_API_URL}`,
	VERSION: "1.0.0",
	WITH_CREDENTIALS: false,
	CREDENTIALS: "include",
	TOKEN: ACCESS_TOKEN,
	USERNAME: undefined,
	PASSWORD: undefined,
	HEADERS: undefined,
	ENCODE_PATH: undefined,
};
