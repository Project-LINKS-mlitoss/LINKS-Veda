import type * as React from "react";
import { useEffect, useRef, useState } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { DEFAULT_SIZE_TOTAL, MIN_WIDTHS, ROLE } from "~/commons/core.const";
import Icon from "~/components/atoms/Icon";
import WrapContent from "~/components/molecules/Common/WrapContent";
import AccountsTable from "~/components/pages/AccountManagement/AccountTable";
import { Management } from "~/components/pages/AccountManagement/Management";
import {
	AccountM,
	AccountManagerLayoutS,
} from "~/components/pages/AccountManagement/styles";
import type {
	AccountData,
	DataTableAccountsType,
} from "~/components/pages/AccountManagement/types";
import { routes } from "~/routes/routes";
import { theme } from "~/styles/theme";

type AccountProps = {
	data: AccountData;
};

const AccountManagementPage: React.FC<AccountProps> = ({
	data,
}: {
	data: AccountData;
}) => {
	const [userItems, setUserItems] = useState<DataTableAccountsType[]>([]);
	const isPreview =
		userItems.length === 1 &&
		data.account.currentUser &&
		data.account.currentUser.role === ROLE.ADMIN;
	const [minWidths] = useState(MIN_WIDTHS);
	// biome-ignore lint/suspicious/noExplicitAny: FIXME
	const rightRef = useRef<any>(null);
	// biome-ignore lint/suspicious/noExplicitAny: FIXME
	const leftRef = useRef<any>(null);

	useEffect(() => {
		const leftPanel = leftRef.current;
		const rightPanel = rightRef.current;
		if (leftPanel && rightPanel) {
			if (isPreview) {
				leftPanel.resize(80);
				rightPanel.resize(15);
			} else {
				leftPanel.resize(DEFAULT_SIZE_TOTAL);
				rightPanel.resize(0);
			}
		}
	}, [isPreview]);

	return (
		<AccountM>
			<WrapContent
				breadcrumbItems={[
					{
						href: routes.accountManagement,
						title: (
							<>
								<Icon icon="user" size={24} color={theme.colors.semiBlack} />
								<span>アカウント管理</span>
							</>
						),
					},
				]}
			>
				<AccountManagerLayoutS>
					<PanelGroup direction="horizontal">
						<Panel
							defaultSize={80}
							minSize={minWidths.minWidthLeftCenter}
							ref={leftRef}
							className="left-item"
						>
							<AccountsTable
								currentUser={data.account.currentUser}
								data={data.account}
								userItems={userItems}
								setUserItems={setUserItems}
							/>
						</Panel>

						<PanelResizeHandle className="resize-handle" />

						<Panel
							minSize={isPreview ? minWidths.minWidthRight : 0}
							ref={rightRef}
							hidden={!isPreview}
							className="right-item"
						>
							<Management
								currentUser={data.account.currentUser}
								useCases={data.useCase}
								isPreview={isPreview}
								userDetail={userItems[0]}
								setUserItems={setUserItems}
							/>
						</Panel>
					</PanelGroup>
				</AccountManagerLayoutS>
			</WrapContent>
		</AccountM>
	);
};

export default AccountManagementPage;
