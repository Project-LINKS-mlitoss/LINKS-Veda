import {
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	useLocation,
	useRevalidator,
} from "@remix-run/react";
import "./tailwind.css";
import "~/styles/global.css";
import { type LoaderFunctionArgs, json } from "@remix-run/node";
import { Layout as AntLayout, ConfigProvider } from "antd";
import { retryWithExponentialBackoff } from "app/utils/retry";
import React, { Suspense, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useNavigation, useRouteLoaderData } from "react-router";
import { commitSession, getSession } from "../server/cookie.server";
import { ErrorBoundary } from "./components/molecules/ErrorBoundary";
import { FilterProvider } from "./context/FilterContext";

// Lazy load components
const LayoutMolecule = React.lazy(
	() => import("./components/molecules/Layout"),
);
const Sidebar = React.lazy(
	() => import("app/components/molecules/Common/Sidebar"),
);
const Content = React.lazy(() => import("app/components/atoms/Content"));
const SkeletonContent = React.lazy(
	() => import("./components/molecules/Layout/SkeletonContent"),
);

interface LoaderData {
	isAuthorized: boolean;
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
	return await retryWithExponentialBackoff(
		async () => {
			const session = await getSession(request.headers.get("Cookie") ?? "");
			const userId = session.get("userId");
			const isAuthorized = !!userId;

			const setCookieHeader = isAuthorized
				? await commitSession(session)
				: undefined;

			const headers: Record<string, string> = {};
			if (setCookieHeader) {
				headers["Set-Cookie"] = setCookieHeader;
			}

			return json({ isAuthorized }, { headers });
		},
		3,
		100,
		2,
	);
};

export function Layout({ children }: { children: React.ReactNode }) {
	const navigation = useNavigation();
	const data = useRouteLoaderData("root") as LoaderData;
	const location = useLocation();
	const { revalidate } = useRevalidator();

	// biome-ignore lint/correctness/useExhaustiveDependencies: FIXME
	useEffect(() => {
		revalidate();
	}, [location.pathname, revalidate]);

	const isNavigatingToDifferentRoute =
		navigation.state !== "idle" &&
		navigation.location?.pathname !== location.pathname &&
		// except UC16/UFN001
		!navigation.location?.pathname.startsWith(
			"/visualizations/16/dashboards/1",
		) &&
		!location.pathname.startsWith("/visualizations/16/dashboards/1");

	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Meta />
				<Links />
			</head>
			<body>
				<ErrorBoundary>
					<DndProvider backend={HTML5Backend}>
						<Suspense fallback={null}>
							<ConfigProvider>
								<LayoutMolecule>
									<AntLayout
										style={{ backgroundColor: "unset" }}
										className="h-full"
									>
										<FilterProvider>
											{(data?.isAuthorized ?? false) && <Sidebar />}

											<Content className="h-full">
												{isNavigatingToDifferentRoute ? (
													<SkeletonContent />
												) : (
													children
												)}
											</Content>
										</FilterProvider>
									</AntLayout>
								</LayoutMolecule>
							</ConfigProvider>
						</Suspense>
					</DndProvider>
				</ErrorBoundary>
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}

export default function App() {
	return (
		<FilterProvider>
			<Outlet />
		</FilterProvider>
	);
}
