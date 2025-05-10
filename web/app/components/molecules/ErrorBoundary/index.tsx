import { useLocation, useRouteError } from "@remix-run/react";
import type { ReactNode } from "react";
import jp from "~/commons/locales/jp";
import { logger } from "~/logger";

interface ErrorBoundaryProps {
	children: ReactNode;
}

export function ErrorBoundary({ children }: ErrorBoundaryProps) {
	const error = useRouteError();
	const location = useLocation();
	const currentUrl = `${location.pathname}${location.search}${location.hash}`;

	if (error) {
		logger.error({
			message: "Error Boundary",
			err: error,
			url: currentUrl,
		});

		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50 pointer-event-auto">
				<div className="max-w-md w-full p-8 bg-white shadow-lg rounded-lg text-center">
					<div className="text-red-600 mb-4">
						<svg
							className="mx-auto h-12 w-12"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							role="img"
							aria-label="Warning icon"
						>
							<title>Warning icon</title>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
							/>
						</svg>
					</div>
					<h3 className="text-xl font-medium text-gray-900 mb-2">
						エラーが発生しました
					</h3>
					<p className="text-gray-600 mb-6">
						{jp.message.common.unexpectedError}
					</p>
					<button
						type="button"
						onClick={() => {
							window.location.href = "/";
						}}
						className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
					>
						ホームに戻る
					</button>
				</div>
			</div>
		);
	}

	return <>{children}</>;
}
