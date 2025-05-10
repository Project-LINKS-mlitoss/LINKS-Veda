export const generateRandomColors = (count: number) => {
	return Array.from(
		{ length: count },
		() => `#${Math.floor(Math.random() * 16777215).toString(16)}`,
	);
};
