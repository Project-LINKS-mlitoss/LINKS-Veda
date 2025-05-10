import { useFetcher } from "@remix-run/react";
import { useEffect, useState } from "react";
import type { FetcherWithComponents } from "react-router-dom";
import type { Jsonify } from "type-fest";

export type FetcherWithComponentsReset<T> = FetcherWithComponents<T> & {
	reset: () => void;
};

export function useFetcherWithReset<T>(): FetcherWithComponentsReset<
	Jsonify<T>
> {
	const fetcher = useFetcher<T>();
	const [data, setData] = useState(fetcher.data);

	useEffect(() => {
		if (fetcher.state === "idle") {
			setData(fetcher.data);
		}
	}, [fetcher.state, fetcher.data]);

	return {
		...fetcher,
		data: data as Jsonify<T> | undefined,
		reset: () => setData(undefined),
	};
}
