import {
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
	type MetaFunction,
	json,
} from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
	addUcAction,
	deleteUserAction,
	switchRoleAction,
} from "~/actions/UserAction";
import jp from "~/commons/locales/jp";
import AccountManagementPage from "~/components/pages/AccountManagement";
import type { AccountData } from "~/components/pages/AccountManagement/types";
import { accountLoader } from "~/loaders/AccountLoader";
import { useCasesLoader } from "~/loaders/UseCaseLoader";
import { ACTION_TYPES_USER } from "~/models/userModel";

export const meta: MetaFunction = () => {
	return [
		{ title: "Accounts Manager" },
		{ name: "accounts manager", content: "" },
	];
};

export async function loader({ request, params, context }: LoaderFunctionArgs) {
	const [account, useCase] = await Promise.all([
		accountLoader({ request, params, context }),
		useCasesLoader({ request, params, context }),
	]);

	return json({ account, useCase });
}
export async function action({ request }: ActionFunctionArgs) {
	const formData = new URLSearchParams(await request.text());
	const intent = formData.get("_action");
	switch (intent) {
		case ACTION_TYPES_USER.DELETE: {
			return deleteUserAction(formData);
		}
		case ACTION_TYPES_USER.SWITCH_ROLE: {
			return switchRoleAction(formData);
		}
		case ACTION_TYPES_USER.ADD_UC: {
			return addUcAction(formData);
		}
		default: {
			return json(
				{ status: false, error: jp.message.common.invalidActionType },
				{ status: 400 },
			);
		}
	}
}
export default function AccountManagement() {
	const result = useLoaderData<AccountData>();

	return <AccountManagementPage data={result} />;
}
