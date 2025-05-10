import {
	cert,
	getApps as getAdminApps,
	initializeApp as initializeAdminApp,
} from "firebase-admin/app";
import { getAuth as getAdminAuth } from "firebase-admin/auth";
import {
	getApps as getClientApps,
	initializeApp as initializeClientApp,
} from "firebase/app";
import { getAuth as getClientAuthOnly } from "firebase/auth";

let clientApp: ReturnType<typeof initializeClientApp>;
let adminApp: ReturnType<typeof initializeAdminApp>;

if (!getClientApps().length) {
	const firebaseConfig = {
		apiKey: process.env.FIREBASE_API_KEY,
		authDomain: process.env.AUTH_DOMAIN,
	};

	clientApp = initializeClientApp(firebaseConfig);
} else {
	clientApp = getClientApps()[0];
}

// Firebase Admin SDK
if (!getAdminApps().length) {
	const adminConfig = {
		projectId: process.env.FIREBASE_PROJECT_ID,
		privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
		clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
	};

	if (
		!adminConfig.projectId ||
		!adminConfig.privateKey ||
		!adminConfig.clientEmail
	) {
		throw new Error("Missing Firebase Admin environment variables");
	}

	adminApp = initializeAdminApp({
		credential: cert(adminConfig),
	});
} else {
	adminApp = getAdminApps()[0];
}

// Export the Firebase client and admin
export const clientAuth = getClientAuthOnly(clientApp);
export const adminAuth = getAdminAuth(adminApp);
