import { useNavigate } from "@remix-run/react";
import Radio from "app/components/atoms/Radio";
import {
	CardLabel,
	CardUseCase,
	ContentWrapper,
	PageContainer,
	PageTitle,
	StyledRadioGroup,
	UseCaseContainer,
	VisualizationCard,
} from "./styles";

export const links = [
	{
		uc: 12,
		label: "貨物自動車運送事業者の労働生産性分析",
	},
	{
		uc: 13,
		label: "モーダルシフト推進に関する分析",
	},
	{
		uc: 14,
		label: "一般旅客定期航路事業許可申請情報等の活用",
	},
	{
		uc: 15,
		label: "管内図・拠点情報データベース整備",
	},
	{
		uc: 16,
		label: "無人航空機の飛行計画・事故情報分析",
	},
	{
		uc: 17,
		label: "内航海運業事業の実態把握",
	},
	{
		uc: 19,
		label: "倉庫業のDX推進に向けた実態把握",
	},
	{
		uc: 20,
		label: "自動車運送事業の事故実態把握",
	},
];

const VisualizationsComponent: React.FC = () => {
	const navigate = useNavigate();

	const getNavigationRoute = (uc: number) => {
		if (uc === 16) {
			return `/visualizations/${uc}/dashboard/2`;
		}

		if ([12, 13, 14, 15, 17, 20].includes(uc)) {
			return `/visualizations/${uc}/dashboard/1`;
		}

		return `/visualizations/${uc}/dashboard`;
	};

	return (
		<PageContainer>
			<ContentWrapper>
				<PageTitle className="ml-3">ユースケース</PageTitle>
				<StyledRadioGroup>
					<UseCaseContainer>
						{links.map((link) => (
							<Radio key={link.uc} value={link.uc}>
								<VisualizationCard
									onClick={() => navigate(getNavigationRoute(link.uc))}
								>
									<CardUseCase>{link.uc}</CardUseCase>
									<CardLabel>{link.label}</CardLabel>
								</VisualizationCard>
							</Radio>
						))}
					</UseCaseContainer>
				</StyledRadioGroup>
			</ContentWrapper>
		</PageContainer>
	);
};

export default VisualizationsComponent;
