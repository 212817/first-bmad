// apps/api/src/services/r2/r2.service.ts
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from '../../config/env.js';
import type { UploadUrlResponse, DownloadUrlResponse, R2ServiceInterface } from './types.js';

// Upload URL expires in 5 minutes
const UPLOAD_URL_EXPIRY = 300;
// Download URL expires in 1 hour (for viewing photos)
const DOWNLOAD_URL_EXPIRY = 3600;
// Photo view URL expires in 24 hours
const PHOTO_VIEW_EXPIRY = 86400;

/**
 * Create R2 client lazily to avoid errors when env vars are not set
 */
const getR2Client = (): S3Client => {
  return new S3Client({
    region: 'auto',
    endpoint: env.R2_ENDPOINT,
    credentials: {
      accessKeyId: env.R2_ACCESS_KEY_ID,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    },
    // Force path-style URLs for R2 compatibility
    forcePathStyle: true,
  });
};

/**
 * R2 service for Cloudflare R2 storage operations
 */
export const r2Service: R2ServiceInterface = {
  /**
   * Generate a pre-signed URL for uploading a photo
   */
  generateUploadUrl: async (
    key: string,
    contentType = 'image/jpeg'
  ): Promise<UploadUrlResponse> => {
    const client = getR2Client();

    const command = new PutObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(client, command, { expiresIn: UPLOAD_URL_EXPIRY });

    // Generate a signed URL for viewing the photo (works without public bucket)
    let publicUrl: string;
    if (env.R2_PUBLIC_URL) {
      // Use public URL if configured
      publicUrl = `${env.R2_PUBLIC_URL}/${key}`;
    } else {
      // Generate a long-lived signed URL for viewing
      const getCommand = new GetObjectCommand({
        Bucket: env.R2_BUCKET_NAME,
        Key: key,
      });
      publicUrl = await getSignedUrl(client, getCommand, { expiresIn: PHOTO_VIEW_EXPIRY });
    }

    return {
      uploadUrl,
      key,
      publicUrl,
      expiresIn: UPLOAD_URL_EXPIRY,
    };
  },

  /**
   * Generate a pre-signed URL for downloading a photo
   */
  generateDownloadUrl: async (key: string): Promise<DownloadUrlResponse> => {
    const client = getR2Client();

    const command = new GetObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: key,
    });

    const downloadUrl = await getSignedUrl(client, command, { expiresIn: DOWNLOAD_URL_EXPIRY });

    return {
      downloadUrl,
      expiresIn: DOWNLOAD_URL_EXPIRY,
    };
  },

  /**
   * Delete an object from R2
   */
  deleteObject: async (key: string): Promise<void> => {
    const client = getR2Client();

    const command = new DeleteObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: key,
    });

    await client.send(command);
  },

  /**
   * Generate a unique key for a photo
   * Format: photos/{userId}/{timestamp}-{random}.{ext}
   */
  generatePhotoKey: (userId: string, extension = 'jpg'): string => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 10);
    return `photos/${userId}/${timestamp}-${random}.${extension}`;
  },
};
