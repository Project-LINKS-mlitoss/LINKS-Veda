import { Link } from "@remix-run/react";
import type * as React from "react";
import Breadcrumb from "~/components/atoms/Breadcrumb";
import { HeaderSection, WrapContentS } from "./styles";

interface BreadcrumbItem {
	href?: string;
	title: React.ReactNode;
}

interface Props {
	breadcrumbItems: BreadcrumbItem[];
	children: React.ReactNode;
	actions?: React.ReactNode;
}

const WrapContent: React.FC<Props> = (props) => {
	const { breadcrumbItems, children, actions } = props;

	return (
		<WrapContentS id="wrap-content">
			<div className="title">
				<HeaderSection>
					<Breadcrumb
						items={breadcrumbItems}
						itemRender={(route, _) => {
							if (route.href) {
								return <Link to={route.href}>{route.title}</Link>;
							}
							return route.title;
						}}
					/>
					{actions && <div className="actions">{actions}</div>}
				</HeaderSection>
			</div>

			{children}
		</WrapContentS>
	);
};

export default WrapContent;
