import { expect, test } from "vitest";

import {
	capitalizeFirstLetter,
	decodeUnicode,
	isUnicodeEncoded,
} from "./stringUtils";

test("capitalizeFirstLetter capitalizes the first letter of a string and converts the rest to lowercase", () => {
	expect(capitalizeFirstLetter("hello")).toBe("Hello");
	expect(capitalizeFirstLetter("wORLD")).toBe("World");
	expect(capitalizeFirstLetter("hElLo")).toBe("Hello");
	expect(capitalizeFirstLetter("")).toBe("");
	expect(capitalizeFirstLetter("a")).toBe("A");
	expect(capitalizeFirstLetter("capitalization")).toBe("Capitalization");
});

test("isUnicodeEncoded correctly identifies if a string is Unicode encoded", () => {
	expect(isUnicodeEncoded("\\u4e16\\u5e2f")).toBe(true);
	expect(isUnicodeEncoded("\\u4e16\\u5e2f\\u30b3")).toBe(true);
	expect(isUnicodeEncoded("hello")).toBe(false);
	expect(isUnicodeEncoded("")).toBe(false);
	expect(isUnicodeEncoded("\\uABCD")).toBe(true);
	expect(isUnicodeEncoded("normal string")).toBe(false);
});

test("decodeUnicode correctly decodes Unicode escape sequences", () => {
	expect(decodeUnicode("\\u4e16\\u5e2f")).toBe("世帯");
	expect(decodeUnicode("\\u30b3\\u30fc\\u30c9")).toBe("コード");
	expect(decodeUnicode("hello")).toBe("hello");
	expect(decodeUnicode("\\u0048\\u0065\\u006c\\u006c\\u006f")).toBe("Hello");
	expect(decodeUnicode("")).toBe("");
});
