import { useEffect, useRef, useState } from "react";
import Icon from "~/components/atoms/Icon";
import Spin from "~/components/atoms/Spin";
import Table, { type TableColumnType } from "~/components/atoms/Table";

interface DataSourceItem {
	key: string | number;
	[key: string]: string | number;
}

export const CsvComponent = ({ url }: { url: string }) => {
	const [dataSource, setDataSource] = useState<DataSourceItem[]>([]);
	const [columns, setColumns] = useState<TableColumnType<DataSourceItem>[]>([]);
	const [loading, setLoading] = useState(true);
	const [loadingMore, setLoadingMore] = useState(false);
	const [dataLoaded, setDataLoaded] = useState(false);

	const workerRef = useRef<Worker | null>(null);
	const bufferRef = useRef<DataSourceItem[]>([]);
	const loadedDataRef = useRef<number>(0);

	// Create a Blob to initialize the Web Worker with inline code for parsing CSV with xlsx library
	const workerBlob = new Blob(
		[
			`
				importScripts("https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.17.0/xlsx.full.min.js");
				let csvDataCache = null;
				
				// Define worker's main message handler
				self.onmessage = async function(event) {
					const { url, startRow, batchSize } = event.data;

					try {
						// If CSV data has not been cached, fetch and process it
						if (!csvDataCache) {
							const response = await fetch(url);
							const arrayBuffer = await response.arrayBuffer();

							const textDecoder = new TextDecoder("utf-8");
							const csvText = textDecoder.decode(arrayBuffer);
							const workbook = XLSX.read(csvText, { type: "string" });

							const sheetName = workbook.SheetNames[0];
							const sheet = workbook.Sheets[sheetName];
							const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

							// Cache the parsed data for future requests
							csvDataCache = jsonData;
						}
						
						// Process and send a subset (batch) of data to the main thread
						if (csvDataCache && csvDataCache.length > 0) {
							const [header, ...rows] = csvDataCache;

							// Slice rows to send based on requested batch size
							const rowsToSend = rows.slice(startRow, startRow + batchSize);
							
							// Send header and current batch of rows to main thread
							self.postMessage({ type: "data", header, rows: rowsToSend });
							
							// Notify main thread if all data has been processed
							if (rowsToSend.length === 0) {
									self.postMessage({ type: "end" });
							}
						}
					} catch (error) {
						self.postMessage({ type: "error", error: error.message });
					}
				};
			`,
		],
		{ type: "application/javascript" },
	);

	// biome-ignore lint/correctness/useExhaustiveDependencies: ignore fileList changes
	useEffect(() => {
		if (url) {
			setDataSource([]);
			setColumns([]);
			setLoading(true);
			setDataLoaded(false);

			// Initialize the Web Worker with the CSV parsing Blob
			const worker = new Worker(URL.createObjectURL(workerBlob));
			workerRef.current = worker;

			// Event listener to handle messages from the Worker
			worker.onmessage = (event) => {
				const { type, header, rows, error } = event.data;

				// If data received, set columns and add rows to buffer
				if (type === "data") {
					if (header) {
						const tableColumns = header.map(
							(title: string | number, index: number) => ({
								title: title ?? "",
								dataIndex: title ?? "",
								key: title ?? "",
							}),
						);
						setColumns(tableColumns);
					}

					if (rows) {
						const newData = rows.map(
							(row: (string | number)[], index: number) => {
								const rowData: DataSourceItem = {
									key: `${row.join("-")}-${index}`,
								};
								row.forEach((cell, cellIndex) => {
									const headerName = header[cellIndex];
									if (headerName) {
										rowData[headerName] = cell;
									}
								});
								return rowData;
							},
						);

						// Update buffer and state with new rows
						bufferRef.current = [...bufferRef.current, ...newData];
						setDataSource(bufferRef.current);
						loadedDataRef.current += rows.length;

						// Check if no more rows to load
						if (rows.length === 0) {
							setDataLoaded(true);
						}
					}
				} else if (type === "end") {
					setDataLoaded(true);
				} else if (type === "error") {
					console.error("Worker Error:", error);
				}
			};

			// Start fetching data from the beginning of the file
			worker.postMessage({ url, startRow: 0, batchSize: 100 });

			// Cleanup function to terminate the Worker
			return () => {
				worker.terminate();
				workerRef.current = null;
			};
		}
	}, [url]);

	// Handle scrolling to load more data when reaching the end of the table
	const handleScroll = (e: React.UIEvent<HTMLDivElement, UIEvent>) => {
		const tableBody = e.target as HTMLDivElement;
		const scrollPosition =
			tableBody.scrollHeight - tableBody.scrollTop - tableBody.clientHeight;

		if (scrollPosition < 200 && !loadingMore && !dataLoaded) {
			console.log("Scroll End");
			setLoadingMore(true);

			// Request more rows from the Worker
			workerRef.current?.postMessage({
				url,
				startRow: loadedDataRef.current,
				batchSize: 100,
			});
		}
	};

	useEffect(() => {
		if (loadingMore) {
			setLoadingMore(false);
		}
	}, [loadingMore]);

	useEffect(() => {
		if (dataSource.length > 0 && columns.length > 0) {
			setLoading(false);
		}
	}, [dataSource, columns]);

	return loading ? (
		<div className="spin">
			<Spin indicator={<Icon icon="loading" size={48} />} />
		</div>
	) : (
		<div
			className="table-data"
			style={{ maxHeight: "95%", overflowY: "auto" }}
			onScroll={handleScroll}
		>
			<Table
				dataSource={dataSource}
				columns={columns}
				pagination={false}
				bordered
			/>
			<div style={{ textAlign: "center", marginTop: 20 }}>
				{loadingMore && <Spin indicator={<Icon icon="loading" size={30} />} />}
			</div>
		</div>
	);
};
