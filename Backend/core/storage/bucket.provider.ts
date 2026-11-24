import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { env } from "../config/env.js";

export interface UploadFileInput {
  key: string;
  body: Buffer;
  contentType: string;
}

export interface UploadResult {
  key: string;
  url: string;
}

export interface IStorageProvider {
  upload(input: UploadFileInput): Promise<UploadResult>;
  delete(keyOrUrl: string): Promise<void>;
}

function getS3Client(): S3Client {
  if (!env.BUCKET_URL || !env.BUCKET_ACCESS_KEY || !env.BUCKET_SECRET_KEY || !env.BUCKET_NAME) {
    throw new Error("STORAGE_NOT_CONFIGURED");
  }

  return new S3Client({
    region: env.BUCKET_REGION,
    endpoint: env.BUCKET_URL,
    forcePathStyle: true,
    credentials: {
      accessKeyId: env.BUCKET_ACCESS_KEY,
      secretAccessKey: env.BUCKET_SECRET_KEY,
    },
  });
}

export function buildPublicAssetUrl(key: string): string {
  const cleanKey = key.replace(/^\/+/, "");
  if (env.BUCKET_PUBLIC_URL) {
    return `${env.BUCKET_PUBLIC_URL.replace(/\/+$/, "")}/${cleanKey}`;
  }
  if (env.BUCKET_URL && env.BUCKET_NAME) {
    return `${env.BUCKET_URL.replace(/\/+$/, "")}/${env.BUCKET_NAME}/${cleanKey}`;
  }
  return cleanKey;
}

export function extractStorageKey(keyOrUrl: string): string {
  if (!keyOrUrl.startsWith("http://") && !keyOrUrl.startsWith("https://")) {
    return keyOrUrl.replace(/^\/+/, "");
  }

  try {
    const parsed = new URL(keyOrUrl);
    const pathname = parsed.pathname.replace(/^\/+/, "");
    const bucketPrefix = `${env.BUCKET_NAME}/`;
    return pathname.startsWith(bucketPrefix) ? pathname.slice(bucketPrefix.length) : pathname;
  } catch {
    return keyOrUrl;
  }
}

export const r2StorageProvider: IStorageProvider = {
  async upload({ key, body, contentType }): Promise<UploadResult> {
    const client = getS3Client();
    const command = new PutObjectCommand({
      Bucket: env.BUCKET_NAME,
      Key: key,
      Body: body,
      ContentType: contentType,
    });

    await client.send(command);

    return {
      key,
      url: buildPublicAssetUrl(key),
    };
  },

  async delete(keyOrUrl: string): Promise<void> {
    if (!env.BUCKET_URL || !env.BUCKET_ACCESS_KEY || !env.BUCKET_SECRET_KEY || !env.BUCKET_NAME) {
      return;
    }

    const key = extractStorageKey(keyOrUrl);
    const client = getS3Client();
    const command = new DeleteObjectCommand({
      Bucket: env.BUCKET_NAME,
      Key: key,
    });

    await client.send(command);
  },
};
