import type { LoaderFunctionArgs } from "@remix-run/node";
import { ServiceFactory } from "~/services/serviceFactory";

const useCase13Service = ServiceFactory.getUseCase13Service();

export async function useCase13Loader({ request }: LoaderFunctionArgs) {
	return await useCase13Service.listDataDownloadLinks();
}
