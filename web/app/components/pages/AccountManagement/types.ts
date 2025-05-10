import type { UseCaseResponse } from "~/models/useCaseModel";
import type { UserItem, UsersResponse } from "~/models/userModel";
export interface DataTableAccountsType extends UserItem {}

export interface AccountData {
	account: UsersResponse;
	useCase: UseCaseResponse;
}
