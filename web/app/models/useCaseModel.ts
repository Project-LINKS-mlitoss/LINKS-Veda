export interface UseCaseI {
	id: number;
	name: string;
	createdAt?: string;
	updatedAt?: string;
	deletedAt?: string;
}

export interface UseCaseResponse {
	data: UseCaseI[];
	status: boolean;
}
