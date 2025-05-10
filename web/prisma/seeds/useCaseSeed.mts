import { PrismaClient } from "@prisma/client";
import { seedAccountManagement } from "./accountManagementSeed.mjs";

const prisma = new PrismaClient();

export async function seedUseCase() {
	await prisma.useCase.createMany({
		data: [{ name: "UC1" }, { name: "UC2" }, { name: "UC3" }],
	});

	console.log("Seeded use_cases table!");
}

// Handle to run manually
if (process.argv[1] === new URL(import.meta.url).pathname) {
	seedUseCase()
		.catch((error) => {
			console.error("Seeding failed:", error);
			process.exit(1);
		})
		.finally(() => {
			console.log("Seeding process finished.");
		});
}
