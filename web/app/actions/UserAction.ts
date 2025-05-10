import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { ServiceFactory } from "app/services/serviceFactory";
import { ROLE } from "~/commons/core.const";
import jp from "~/commons/locales/jp";
import { ACTION_TYPES_USER } from "~/models/userModel";
import {
	commitSession,
	destroySession,
	getSession,
} from "../../server/cookie.server";

const userService = ServiceFactory.getUserService();

export const userAuthAction = async ({ request }: ActionFunctionArgs) => {
	const form = new URLSearchParams(await request.text());
	const email = form.get("email") ?? "";
	const password = form.get("password") ?? "";
	const response = await userService.authUser(email, password);
	if (!response.success || !response.user) {
		return json(response, { status: 401 });
	}

	const session = await getSession(request.headers.get("Cookie"));
	session.set("userId", response.user.uid);
	session.set("username", response.user.email);

	return json(response, {
		headers: {
			"Set-Cookie": await commitSession(session),
		},
	});
};

export const userSignOutAction = async ({ request }: ActionFunctionArgs) => {
	const response = await userService.signOutUser();
	const session = await getSession(request.headers.get("Cookie") ?? "");
	return json(response, {
		headers: {
			"Set-Cookie": await destroySession(session),
		},
	});
};

export const userResetPasswordAction = async ({
	request,
}: ActionFunctionArgs) => {
	const form = new URLSearchParams(await request.text());
	const email = form.get("email") ?? "";
	const response = await userService.requestResetPassword(email);

	return json(response);
};

export const deleteUserAction = async (formData: URLSearchParams) => {
	const userIdsJson = formData.get("userIds");
	let userIds: string[] = [];
	if (userIdsJson) {
		try {
			userIds = JSON.parse(userIdsJson);
		} catch (error) {
			return json(
				{ status: false, error: jp.message.user.invalidUserId },
				{ status: 400 },
			);
		}
	}
	const result = await userService.deleteUsers(userIds);
	return json({
		...result,
		actionType: ACTION_TYPES_USER.DELETE,
	});
};

export const switchRoleAction = async (formData: URLSearchParams) => {
	const role = Object.values(ROLE).includes(Number(formData.get("role")))
		? Number(formData.get("role"))
		: ROLE.VIEW;
	const userId = formData.get("userId") ?? "";
	const result = await userService.updatePermission(userId, role);
	return json({
		...result,
		actionType: ACTION_TYPES_USER.SWITCH_ROLE,
	});
};

export const addUcAction = async (formData: URLSearchParams) => {
	const ucIds = formData.get("ucIds") ?? "";
	const uid = formData.get("uid") ?? "";
	const result = await userService.updateUc(uid, ucIds);
	return json({
		...result,
		actionType: ACTION_TYPES_USER.ADD_UC,
	});
};
