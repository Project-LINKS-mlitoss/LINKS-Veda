import type * as React from "react";
import jp from "~/commons/locales/jp";
import Icon from "~/components/atoms/Icon";
import OperatorCard from "~/components/molecules/Common/OperatorCard";
import WrapContent from "~/components/molecules/Common/WrapContent";
import { OperatorsPageS } from "~/components/pages/Operators/styles";
import useElementWidth from "~/hooks/useElementWidth";
import { routes } from "~/routes/routes";
import { theme } from "~/styles/theme";

const OperatorsPage: React.FC = () => {
	const sidebarWidth = useElementWidth("side-bar-id");

	const data = [
		{
			id: 1,
			title: "データ構造化",
			description: jp.operator.dataStructuringPanel,
			input: "PDF, PNG, ZIP, DOCX, XLSX",
			output: "構造化データ",
			icon: "strucOrigin",
			to: "data-structure",
		},
		{
			id: 2,
			title: "結合前処理",
			description: jp.operator.preProcessingPanel,
			input: "非構造化データ、構造化データ",
			output: "構造化データ",
			icon: "preBindingProcessing",
			to: "pre-processing",
		},
		{
			id: 3,
			title: "テキストマッチング",
			description: jp.operator.textMatchingPanel,
			input: "構造化データ",
			output: "構造化データ",
			icon: "textMatching",
			to: "text-matching",
		},
		{
			id: 4,
			title: "クロス集計",
			description: jp.operator.crossTabPanel,
			input: "構造化データ",
			output: "構造化データ",
			icon: "crosstab",
			to: "cross-tab",
		},
		{
			id: 5,
			title: "空間結合処理",
			description: jp.operator.spatialJoinPanel,
			input: "構造化データ",
			output: "構造化データ",
			icon: "spatialJoinProcessing",
			to: "spatial-join",
		},
		{
			id: 6,
			title: "空間集計処理",
			description: jp.operator.spatialAggregationPanel,
			input: "構造化データ",
			output: "構造化データ",
			icon: "spatialAggregationProcessing",
			to: "spatial-aggregation",
		},
	];

	return (
		<WrapContent
			breadcrumbItems={[
				{
					href: routes.operator,
					title: (
						<>
							<Icon icon="swap" size={24} color={theme.colors.semiBlack} />
							<span>オペレーター</span>
						</>
					),
				},
			]}
		>
			<OperatorsPageS sidebarWidth={sidebarWidth}>
				<div className="function-top">
					<div className="function">
						<p className="function-name">データ構造化</p>

						<OperatorCard
							title={data[0].title}
							description={data[0].description}
							input={data[0].input}
							output={data[0].output}
							icon={data[0].icon}
							to={data[0].to}
						/>
					</div>

					<div className="function">
						<p className="function-name">結合前処理</p>

						<OperatorCard
							title={data[1].title}
							description={data[1].description}
							input={data[1].input}
							output={data[1].output}
							icon={data[1].icon}
							to={data[1].to}
						/>
					</div>
				</div>

				<div className="function">
					<p className="function-name">データ結合</p>

					<div className="list-card">
						{data.slice(2, data.length).map((item) => (
							<OperatorCard
								key={item.id}
								title={item.title}
								description={item.description}
								input={item.input}
								output={item.output}
								icon={item.icon}
								to={item.to}
							/>
						))}
					</div>
				</div>
			</OperatorsPageS>
		</WrapContent>
	);
};

export default OperatorsPage;
