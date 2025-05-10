import { redirect } from "@remix-run/node";
import { userSignOutAction } from "~/actions/UserAction";
import { routes } from "~/routes/routes";

export { userSignOutAction as action };

export const loader = async () => redirect(routes.login);
