// biome-ignore lint/suspicious/noExplicitAny: FIXME
export const parseConfigJson = (input: any): any => {
	return typeof input === "string" ? JSON.parse(input) : {};
};
