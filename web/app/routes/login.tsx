import { useActionData, useNavigate, useSubmit } from "@remix-run/react";
import { userAuthAction } from "app/actions/UserAction";
import type { AuthResponse } from "app/models/userModel";
import { useEffect, useState } from "react";
import jp from "~/commons/locales/jp";
import LoginComponent from "~/components/pages/Login";
import { defaultAuthorizedPage } from "~/routes/routes";

export { userAuthAction as action };

export default function Login() {
	const actionData = useActionData<AuthResponse>();
	const submit = useSubmit();
	const navigate = useNavigate();
	const [message, setMessage] = useState("");

	useEffect(() => {
		if (actionData) {
			if (actionData?.success === true) {
				navigate(defaultAuthorizedPage);
			} else {
				setMessage(actionData.error || jp.message.common.internalServerError);
			}
		}
	}, [actionData, navigate]);

	const onSubmitLogin = (values: FormData) => {
		submit(values, { method: "post" });
	};

	return <LoginComponent message={message} login={onSubmitLogin} />;
}
