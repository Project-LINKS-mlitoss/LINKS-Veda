import { useActionData, useNavigate, useSubmit } from "@remix-run/react";
import { userSignOutAction } from "app/actions/UserAction";
import type { SignOutResponse } from "app/models/userModel";
import { useEffect, useState } from "react";
import jp from "~/commons/locales/jp";
import DashboardComponent from "~/components/pages/Dashboard";
import { routes } from "~/routes/routes";

export { userSignOutAction as action };

export default function Dashboard() {
	const actionData = useActionData<SignOutResponse>();
	const submit = useSubmit();
	const navigate = useNavigate();

	const [success, setSuccess] = useState<boolean | undefined>(undefined);
	const [message, setMessage] = useState("");

	useEffect(() => {
		if (actionData) {
			if (actionData?.success === true) {
				setSuccess(true);
				setMessage("Sign out successfully");
				setTimeout(() => {
					openLoginPage();
				}, 2000);
			} else {
				setSuccess(false);
				setMessage(actionData.error || jp.message.common.internalServerError);
			}
		}
	}, [actionData]);

	const openLoginPage = () => {
		navigate(routes.login);
	};

	const onSignOut = (values: FormData) => {
		submit(values, { method: "post" });
	};

	return (
		<DashboardComponent
			success={success}
			message={message}
			signOut={onSignOut}
		/>
	);
}
