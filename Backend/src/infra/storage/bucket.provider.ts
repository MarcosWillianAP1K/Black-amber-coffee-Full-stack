import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { IStorageProvider, UploadResult } from "./bucket.interface";
import { env } from "../../config/env";

const client = new S3Client({
  region: env.BUCKET_REGION,
  endpoint: env.BUCKET_URL,
  forcePathStyle: true,
  credentials: {
    accessKeyId: env.BUCKET_ACCESS_KEY,
    secretAccessKey: env.BUCKET_SECRET_KEY,
  },
});

export const r2StorageProvider: IStorageProvider = {
  async upload({ key, body, contentType }): Promise<UploadResult> {
    const command = new PutObjectCommand({
      Bucket: env.BUCKET_NAME,
      Key: key,
      Body: body,
      ContentType: contentType,
    });

    await client.send(command);

    return {
      key,
    };
  },

  async delete(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: env.BUCKET_NAME,
      Key: key,
    });

    await client.send(command);
  },
};
