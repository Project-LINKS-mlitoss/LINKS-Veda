import type { MetaFunction } from "@remix-run/node";
import { templatesDetailLoader } from "~/loaders/TemplatesLoader";

export const meta: MetaFunction = () => {
	return [{ title: "Templates edit" }, { name: "templates", content: "" }];
};

export { templatesDetailLoader as loader };
