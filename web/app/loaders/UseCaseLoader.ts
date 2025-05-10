import type { LoaderFunctionArgs } from "@remix-run/node";
import { ServiceFactory } from "~/services/serviceFactory";

const useCaseService = ServiceFactory.getUseCaseService();

export async function useCasesLoader({ request }: LoaderFunctionArgs) {
	return await useCaseService.listUseCase();
}
