import { S3Client } from '@aws-sdk/client-s3';
import { env } from './env';

// Create S3 client (compatible with Cloudflare R2)
export const s3Client = new S3Client({
  region: env.AWS_REGION,
  endpoint: env.AWS_ENDPOINT,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});

export const BUCKET_NAME = env.AWS_BUCKET_NAME;
export const CDN_URL = env.CDN_URL || env.AWS_ENDPOINT;

// Helper to generate S3 key
export function generateS3Key(
  projectId: string,
  imageId: string,
  type: 'original' | 'thumbnail' | 'medium' | 'full',
  extension: string
): string {
  return `projects/${projectId}/${imageId}/${type}.${extension}`;
}

export default s3Client;
