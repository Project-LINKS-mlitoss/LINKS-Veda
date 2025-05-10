import styled from "@emotion/styled";
import { Component, type ReactNode } from "react";
import { logger } from "~/logger";

interface ErrorBoundaryGISProps {
	children: ReactNode;
}

interface ErrorBoundaryGISState {
	hasError: boolean;
}

class ErrorBoundaryGIS extends Component<
	ErrorBoundaryGISProps,
	ErrorBoundaryGISState
> {
	constructor(props: ErrorBoundaryGISProps) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError() {
		return { hasError: true };
	}

	componentDidCatch(error: Error) {
		logger.error({
			message: "Error in GISMap component:",
			err: error,
		});
	}

	render() {
		if (this.state.hasError) {
			return (
				<ErrorS>Map cannot be displayed because your data is invalid !</ErrorS>
			);
		}

		return this.props.children;
	}
}

export default ErrorBoundaryGIS;

const ErrorS = styled.div`
    height: 100%;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
`;
