import config from "app/components/pages/Visualizations/UC16/UFN002/mock.json";

export const generatePastelColor = (index: number, total: number) => {
	const hue = (index / total) * 360; // 色相を均等に分配
	return `hsl(${hue}, 80%, 80%)`; // 80% の彩度 & 80% の明度でパステルカラーに
};

export const transformPieChartData = <
	T extends { fields: Array<{ key: string; value: string }> },
>(
	data: T[],
	fieldKey: string,
	uc16PieChart?: boolean,
): { name: string; value: number; color: string }[] => {
	if (!fieldKey) return [];

	const groupedData: Record<string, number> = {};

	for (const item of data) {
		if (uc16PieChart) {
			const fieldArray = item.fields.filter((f) => f.key.includes(fieldKey));
			for (const item of fieldArray) {
				groupedData[item.key] = (groupedData[item.value] || 0) + 1;
			}
		} else {
			const field = item.fields.find((f) => f.key === fieldKey);
			if (!field?.value) continue;

			groupedData[field.value] = (groupedData[field.value] || 0) + 1;
		}
	}
	const maxValue = Math.max(...Object.values(groupedData));
	const keys = Object.keys(groupedData);

	return Object.entries(groupedData).map(([name, value], index) => {
		const color = generatePastelColor(index, keys.length);
		return { name, value, color };
	});
};

export const transformStackedBarData = <
	T extends { fields: Array<{ key: string; value: string }> },
>(
	data: T[],
	groupByKey: string,
	stackKey: string,
	uc16?: boolean,
): Record<string, unknown>[] => {
	// biome-ignore lint/suspicious/noExplicitAny: FIXME
	const groupedData: Record<string, { [key: string]: any; count: number }> = {};

	// Group the data and calculate the sum and count
	for (const item of data) {
		const groupField = item.fields.find((f) =>
			uc16 ? f.key.includes(groupByKey) : f.key === groupByKey,
		);
		const field = item.fields.find((f) =>
			uc16 ? f.key.includes(stackKey) : f.key === stackKey,
		);

		if (!groupField || !groupField?.value || !field || !field.value) continue;

		const group = groupField.value;
		if (!groupedData[group]) {
			groupedData[group] = { [groupByKey]: group, [stackKey]: 0, count: 0 };
		}

		if (field?.value) {
			const numericValue = Number.isNaN(Number(field.value))
				? 0
				: Number(field.value);

			groupedData[group][stackKey] += numericValue;
			groupedData[group].count += 1;
		}
	}

	// Replace the value of `stackKey` with the average
	for (const group of Object.values(groupedData)) {
		if (group.count > 0) {
			group[stackKey] = group[stackKey] / group.count; // Replace total with avg
		}
	}

	// Filter out groups where the average is 0
	const filteredData = Object.values(groupedData).filter(
		(group) => group[stackKey] !== 0,
	);

	const { mapping } = createMapping(filteredData, groupByKey);
	const totalCategories = Object.keys(mapping).length;

	return filteredData.map((item) => ({
		...item,
		color: generatePastelColor(mapping[item[groupByKey]], totalCategories),
	}));
};

// biome-ignore lint/suspicious/noExplicitAny: FIXME
const createMapping = <T extends Record<string, any>>(
	data: T[],
	key: string,
) => {
	const uniqueValues = [...new Set(data.map((item) => item[key]))].filter(
		(value) => value !== undefined,
	);

	const mapping = uniqueValues.reduce(
		(acc, value, index) => {
			acc[value] = index + 1; // 1-based index to avoid 0 issue
			return acc;
		},
		{} as Record<string, number>,
	);

	const reverseMapping = Object.entries(mapping).reduce(
		(acc, [key, value]) => {
			acc[value] = key;
			return acc;
		},
		{} as Record<number, string>,
	);

	return { mapping, reverseMapping };
};

// export const transformLineChartData = <
// 	T extends { fields: Array<{ key: string; value: string }> },
// >(
// 	data: T[],
// ): Array<{ name: string; value: number }> => {
// 	return data
// 		.map((item) => {
// 			const dateField = item.fields.find((f) => f.key === "発生日時");
// 			const countField = item.fields.find((f) => f.key === "事故件数");

// 			console.log(data, dateField, countField)
// 			return {
// 				name: dateField?.value || item.fields[0].key,
// 				value: Number(countField?.value || 0),
// 			};
// 		})
// 		.sort((a, b) => {
// 			return new Date(a.name).getTime() - new Date(b.name).getTime();
// 		});
// };

// biome-ignore lint/suspicious/noExplicitAny: FIXME
export const transformLineChartData = <T extends Record<string, any>>(
	data: T[],
): Array<{ name: string; value: number }> => {
	return data
		.map((item) => ({
			name: item.fields[0].value, // fields の 0 番目の value を name に
			value: Number(item.fields[1].value), // fields の 1 番目の value を数値として value に
		}))
		.sort((a, b) => {
			return new Date(a.name).getTime() - new Date(b.name).getTime();
		});
};
// TODO: verify this function before merge. not tested yet with real data
export const transformScatterPlotData = <
	T extends { fields: Array<{ key: string; value: string }> },
>(
	data: T[],
	xKey: string,
	yKey: string,
): Record<string, unknown>[] => {
	let transformedData: Record<string, { [key: string]: number }>[] = [];

	for (const item of data) {
		const xField = item.fields.find((f) => f.key === xKey);
		const yField = item.fields.find((f) => f.key === yKey);

		if (!xField || !xField.value || !yField || !yField.value) continue;

		const xValue = Number(xField.value) || 0;
		const yValue = Number(yField.value) || 0;
		if (Number.isNaN(xValue) || Number.isNaN(yValue)) continue;

		transformedData.push({
			[xKey]: xValue,
			[yKey]: yValue,
		} as unknown as Record<string, { [key: string]: number }>);
	}
	transformedData = transformedData.sort(
		(a, b) => (a[xKey] as unknown as number) - (b[xKey] as unknown as number),
	);
	return transformedData;
};

export const uc16PieChartTransformedData = (
	data: GeoJSON.GeoJsonProperties[],
	fieldKey: string,
): { name: string; value: number; color: string }[] => {
	const transformedData: { [name: string]: number } = {};

	for (const item of data) {
		if (!item) continue;
		const keys = Object.keys(item);
		const filteredKeys = keys
			.filter(
				(k) =>
					fieldKey &&
					[
						fieldKey,
						...(config.graphOptions.find((gop) => gop.value === fieldKey)
							?.otherKeys || []),
					].find((d) => k.includes(d)),
			)
			.filter((k) => !k.endsWith("_y"));
		if (!filteredKeys.length) continue;

		for (const k of filteredKeys) {
			const valueData = ((item?.[k || ""] || "") as unknown as string)
				?.toString()
				?.toLowerCase();

			if (
				valueData !== undefined &&
				valueData !== null &&
				valueData !== "" &&
				valueData !== "n/a"
			) {
				const newKey = `${k}-${valueData}`.toLowerCase();
				transformedData[newKey] =
					((transformedData[newKey] as unknown as number) || 0) + 1;
			}
		}
	}

	return Object.entries(transformedData).map(([name, value], index) => {
		const color = generatePastelColor(
			index,
			Object.keys(transformedData).length,
		);
		return { name: uc16FormatLegend(name), value, color };
	});
};

const uc16FormatLegend = (name: string) => {
	if (name.startsWith("対人補償額")) {
		const code = name.split("_階層-")[1] ?? name.split("_階層化-")[1];
		switch (code) {
			case "1":
				return "1000万円未満";
			case "2":
				return "1000万円～1億未満";
			case "3":
				return "1億未満～5億未満";
			case "4":
				return "5億円以上";
			default:
				return "その他";
		}
	}
	if (name.startsWith("対物補償額")) {
		const code = name.split("_階層-")[1] ?? name.split("_階層化-")[1];
		switch (code) {
			case "1":
				return "1000万円未満";
			case "2":
				return "1000万円～5000万未満";
			case "3":
				return "5000万円未満～1.5億未満";
			case "4":
				return "1.5億円以上";
			default:
				return "その他";
		}
	}
	return name;
};
