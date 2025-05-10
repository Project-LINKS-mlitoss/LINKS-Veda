import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function seedAccountManagement() {
	await prisma.accountManagement.createMany({
		data: [
			{ userId: "Q2dBqQnZZFVdk5j6M5Ahmpof8sa2", role: 1 },
			{ userId: "UB76S9gaDyZ12ifbEzPrTVnrsHf2", role: 1 },
			{ userId: "lYG8eUJCgLOqWECOLHrk5Eay3Gw1", role: 1 },
			{ userId: "tOjzrvBIFnQOTxpaSjAmHqSmB5I2", role: 1 },
		],
	});

	console.log("Seeded account_managements table!");
}

// Handle to run manually
if (process.argv[1] === new URL(import.meta.url).pathname) {
	seedAccountManagement()
		.catch((error) => {
			console.error("Seeding failed:", error);
			process.exit(1);
		})
		.finally(() => {
			console.log("Seeding process finished.");
		});
}
