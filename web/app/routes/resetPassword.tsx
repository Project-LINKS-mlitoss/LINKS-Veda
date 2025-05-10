import { useActionData, useSubmit } from "@remix-run/react";
import { userResetPasswordAction } from "app/actions/UserAction";
import { useEffect, useState } from "react";
import jp from "~/commons/locales/jp";
import ResetPasswordComponent from "~/components/pages/ResetPassword";
import type { ResetPasswordResponse } from "~/models/userModel";

export { userResetPasswordAction as action };

export default function ResetPassword() {
	const actionData = useActionData<ResetPasswordResponse>();
	const submit = useSubmit();

	const [success, setSuccess] = useState<boolean | undefined>(undefined);
	const [message, setMessage] = useState("");

	useEffect(() => {
		if (actionData) {
			if (actionData?.success === true) {
				setSuccess(true);
				setMessage(jp.message.user.checkYourEmail);
			} else {
				setSuccess(false);
				setMessage(actionData.error || jp.message.common.internalServerError);
			}
		}
	}, [actionData]);

	const onSubmitResetPassword = (values: FormData) => {
		submit(values, { method: "post" });
	};

	return (
		<ResetPasswordComponent
			success={success}
			message={message}
			requestResetPassword={onSubmitResetPassword}
		/>
	);
}
