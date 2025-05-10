import { type GetSignedUrlConfig, Storage } from "@google-cloud/storage";
import { logger } from "~/logger";

export class StorageRepository {
	private readonly LIFE_TIME = 150 * 60 * 1000; // 150 minutes

	async generateSignedUrl(name: string): Promise<string[]> {
		const endpoint = process.env.GCS_ENDPOINT;
		const serviceAccount = process.env.GOOGLE_SERVICE_ACCOUNT;
		const bucketName = process.env.BUCKET_NAME;

		if (!endpoint || !serviceAccount || !bucketName) {
			logger.error({
				message: "Missing environment variables",
				variables: { endpoint, serviceAccount, bucketName },
			});
			throw new Error(
				"Environment variables for Google Cloud Storage are missing.",
			);
		}

		const cloudStorage = new Storage({
			apiEndpoint: endpoint,
			keyFilename: serviceAccount,
		});

		const bucket = cloudStorage.bucket(bucketName);

		try {
			await bucket.setCorsConfiguration([
				{
					origin: ["*"],
					method: ["*"],
					responseHeader: ["*"],
					maxAgeSeconds: 3600,
				},
			]);

			const signedUrlConfig: GetSignedUrlConfig = {
				action: "write",
				version: "v4",
				contentType: "application/octet-stream",
				expires: Date.now() + this.LIFE_TIME,
			};

			logger.info({
				message: "Generating signed URL",
				bucket: bucketName,
				fileName: name,
				signedUrlConfig,
			});

			const signedUrl = await bucket.file(name).getSignedUrl(signedUrlConfig);

			logger.info({
				message: "Signed URL generated successfully",
				url: signedUrl,
			});

			return signedUrl;
		} catch (error) {
			logger.error({
				message: "Error generating signed URL",
				fileName: name,
				err: error,
			});
			throw new Error("Failed to generate signed URL");
		}
	}
}
