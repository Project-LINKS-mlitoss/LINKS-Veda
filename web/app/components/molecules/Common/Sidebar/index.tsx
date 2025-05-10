import { NavLink, useLocation, useSubmit } from "@remix-run/react";
import type { MenuProps } from "antd";
import Menu from "app/components/atoms/Menu";
import type { SiderProps } from "app/components/atoms/Sider";
import { type ReactNode, useState } from "react";
import jp from "~/commons/locales/jp";
import Icon from "~/components/atoms/Icon";
import { routes } from "~/routes/routes";
import { StyledSidebar } from "./styles";

type MenuItem = Required<MenuProps>["items"][number];

const getItem = (
	label: ReactNode,
	key: string,
	icon?: ReactNode,
	onClick?: () => void,
): MenuItem => ({
	key,
	icon,
	label,
	onClick,
});

const Sidebar: React.FC<SiderProps> = ({ ...siderProps }) => {
	const [collapsed, setCollapsed] = useState(false);
	const location = useLocation();
	const currentPath = location.pathname.split("/")[1];
	const submit = useSubmit();

	const handleLogout = () => {
		submit(null, { method: "post", action: routes.logout });
	};

	const navItems = [
		{ to: routes.operator, label: "オペレーター", icon: "swap" },
		{ to: routes.asset, label: "アセット", icon: "asset" },
		{ to: routes.content, label: jp.common.content, icon: "schema" },
		{ to: routes.dataset, label: "データセット", icon: "dataset" },
		{ to: routes.template, label: "テンプレート", icon: "templateBox" },
		{
			to: routes.processingStatus,
			label: "処理状況一覧",
			icon: "processingStatusList",
		},
		{ to: routes.chat, label: "チャット", icon: "chat" },
		{ to: routes.accountManagement, label: "アカウント管理", icon: "user" },
		{
			to: routes.logout,
			label: "ログアウト",
			icon: "logout",
			onClick: handleLogout,
		},
	];

	const items: MenuItem[] = navItems.map(({ to, label, icon, onClick }) =>
		getItem(
			onClick ? (
				<span
					onClick={onClick}
					onKeyDown={(e) => {
						if (e.key === "Enter" || e.key === " ") {
							onClick();
						}
					}}
					className="nav-link"
				>
					{label}
				</span>
			) : (
				<NavLink to={to} prefetch="intent" className="nav-link">
					{label}
				</NavLink>
			),
			to.replace("/", ""),
			icon ? <Icon icon={icon} size={16} /> : null,
			onClick,
		),
	);

	const toggleSidebar = () => {
		setCollapsed(!collapsed);
	};

	if (!items) return null;

	return (
		<StyledSidebar
			collapsible
			collapsed={collapsed}
			trigger={null}
			{...siderProps}
			id="side-bar-id"
		>
			<Menu
				items={items}
				selectedKeys={[currentPath]}
				mode="inline"
				inlineCollapsed={collapsed}
			/>
			<button type="button" onClick={toggleSidebar} className="collapse-button">
				<Icon icon="toggleZoom" size={16} />
			</button>
		</StyledSidebar>
	);
};

export default Sidebar;
