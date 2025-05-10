import dayjs, { type Dayjs } from "dayjs";
import {
	type ReactNode,
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";
import { ChartType } from "~/components/molecules/Chart/types";
import type { ChartsFormType } from "~/components/pages/Visualizations/Dashboard/Preview/types";
import type {
	GraphFilterFormData,
	PreRequestFormData,
} from "~/components/pages/Visualizations/UC14/UFN001v2/components/Filters/types";
import type { FilterSubmitValues } from "~/components/pages/Visualizations/UC14/UFN001v2/types";
import type { PortFormData } from "~/components/pages/Visualizations/UC17/filters/types";

interface FilteringResult {
	accidents: [];
	accidentIds: [];
	polylineIds: [];
	meshIds: [];
	tv: Record<string, number>;
}
export interface IFilterType {
	filterQuery?: PreRequestFormData;
	filterValues?: FilterSubmitValues;
	filterResult?: FilteringResult;
	graphQuery?: GraphFilterFormData;
	charts: GraphFilterFormData[];
	useCase: number;
	ufn: number;
	uc17GraphQuery?: PortFormData | null;
	uc17Charts?: PortFormData[];
	uc16Charts?: ChartsFormType[];
}
interface FilterContextType {
	filterData: IFilterType[];
	setFilterData: (data: IFilterType[]) => void;
	getFilteredDataByUseCaseAndUFN: (useCase: number, ufn: number) => IFilterType;
	updateFilterDataByUseCaseAndUFN: (newFilterData: IFilterType) => void;
	loading: boolean;
}

const convertDate = (date: Dayjs | undefined) => {
	return date ? dayjs(date) : undefined;
};
const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider: React.FC<{ children: ReactNode }> = ({
	children,
}) => {
	const [filterData, setFilterData] = useState<IFilterType[]>([]);
	const [loading, setLoading] = useState(true);
	const getFilteredDataByUseCaseAndUFN = (
		useCase: number,
		ufn: number,
	): IFilterType => {
		return (
			filterData.find(
				(item) => item.useCase === useCase && item.ufn === ufn,
			) || { useCase, ufn, charts: [] }
		);
	};
	// Function to update or add a new filter item
	const updateFilterDataByUseCaseAndUFN = (newFilterData: IFilterType) => {
		setFilterData((prevData) => {
			const index = prevData.findIndex(
				(item) =>
					item.useCase === newFilterData.useCase &&
					item.ufn === newFilterData.ufn,
			);

			if (index !== -1) {
				// Update existing item
				const updatedData = [...prevData];
				updatedData[index] = newFilterData;
				return updatedData;
			}
			// Add new item if it doesn't exist
			return [...prevData, newFilterData];
		});
	};

	const initializeDB = useCallback(async (): Promise<IFilterType[]> => {
		return new Promise((resolve, reject) => {
			const dbRequest = indexedDB.open("FilterDB", 1);

			dbRequest.onupgradeneeded = (event) => {
				const db = (event.target as IDBOpenDBRequest).result;
				if (!db.objectStoreNames.contains("filters")) {
					db.createObjectStore("filters", { autoIncrement: true });
				}
			};

			dbRequest.onsuccess = (event) => {
				const db = (event.target as IDBOpenDBRequest).result;
				const transaction = db.transaction("filters", "readonly");
				const store = transaction.objectStore("filters");

				const request = store.getAll();
				request.onsuccess = () => {
					const storedFilters: IFilterType[] = request.result.map((item) => {
						return JSON.parse(item);
					});
					const transformedData = storedFilters.map((filter) => ({
						...filter,
						filterQuery: {
							...filter.filterQuery,
							dateFromSectionAccident: filter.filterQuery
								?.dateFromSectionAccident
								? dayjs(filter.filterQuery.dateFromSectionAccident)
								: undefined,
							dateToSectionAccident: filter.filterQuery?.dateToSectionAccident
								? dayjs(filter.filterQuery.dateToSectionAccident)
								: undefined,
							dateFromSectionMesh: filter.filterQuery?.dateFromSectionMesh
								? dayjs(filter.filterQuery.dateFromSectionMesh)
								: undefined,
							dateToSectionMesh: filter.filterQuery?.dateToSectionMesh
								? dayjs(filter.filterQuery.dateToSectionMesh)
								: undefined,
						},
						graphQuery: {
							...filter.graphQuery,
							dateFrom: convertDate(filter.graphQuery?.dateFrom),
							dateTo: convertDate(filter.graphQuery?.dateTo),
							dateFromSectionAccident: convertDate(
								filter.graphQuery?.dateFromSectionAccident,
							),
							dateFromSectionMesh: convertDate(
								filter.graphQuery?.dateFromSectionMesh,
							),
							dateToSectionAccident: convertDate(
								filter.graphQuery?.dateToSectionAccident,
							),
							dateToSectionMesh: convertDate(
								filter.graphQuery?.dateToSectionMesh,
							),
						},
						charts: filter.charts.map((chart) => {
							return {
								...chart,
								dateFrom: convertDate(chart.dateFrom),
								dateTo: convertDate(chart.dateTo),
								dateFromSectionAccident: convertDate(
									chart.dateFromSectionAccident,
								),
								dateFromSectionMesh: convertDate(chart.dateFromSectionMesh),
								dateToSectionAccident: convertDate(chart.dateToSectionAccident),
								dateToSectionMesh: convertDate(chart.dateToSectionMesh),
							};
						}),
					}));
					resolve(transformedData);
				};

				request.onerror = () => reject(request.error);
			};

			dbRequest.onerror = () => reject(dbRequest.error);
		});
	}, []);

	// useEffect to initialize IndexedDB and set state
	useEffect(() => {
		const fetchData = async () => {
			try {
				const storedData = await initializeDB();
				setFilterData(storedData);
				setLoading(false);
			} catch (error) {
				console.error("Error initializing IndexedDB:", error);
			}
		};

		fetchData();
	}, [initializeDB]);

	// Function to save filterData to IndexedDB
	const saveFilterDataToDB = useCallback((data: IFilterType[]) => {
		const dbRequest = indexedDB.open("FilterDB", 1);

		dbRequest.onsuccess = (event) => {
			const db = (event.target as IDBOpenDBRequest).result;
			const transaction = db.transaction("filters", "readwrite");
			const store = transaction.objectStore("filters");

			// Clear the existing data
			store.clear();

			// Add new data
			data.map((filter) => {
				store.add(JSON.stringify(filter));
			});
		};
	}, []);

	// Update IndexedDB whenever filterData changes
	useEffect(() => {
		if (filterData.length > 0) {
			saveFilterDataToDB(filterData);
		}
	}, [filterData, saveFilterDataToDB]);

	return (
		<FilterContext.Provider
			value={{
				loading,
				filterData,
				setFilterData,
				getFilteredDataByUseCaseAndUFN,
				updateFilterDataByUseCaseAndUFN,
			}}
		>
			{children}
		</FilterContext.Provider>
	);
};

export const useFilterContext = () => {
	const context = useContext(FilterContext);
	if (!context) {
		throw new Error("useFilterContext must be used within a FilterProvider");
	}
	return context;
};
