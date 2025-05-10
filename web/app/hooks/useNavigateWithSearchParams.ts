import { useNavigate, useSearchParams } from "@remix-run/react";
import { useCallback } from "react";
import type { NavigateOptions } from "react-router";

export const useNavigateWithSearchParams = () => {
	const [defaultSearchParams] = useSearchParams();
	const navigate = useNavigate();

	return useCallback(
		(
			to: string,
			options?: NavigateOptions & { searchParams?: URLSearchParams },
		) => {
			const _searchParams = options?.searchParams ?? defaultSearchParams;
			navigate(`${to}?${_searchParams.toString()}`, options);
		},
		[navigate, defaultSearchParams],
	);
};
