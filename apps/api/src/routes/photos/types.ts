// apps/api/src/routes/photos/types.ts

/**
 * Request body for getting an upload URL
 */
export interface GetUploadUrlRequest {
  /** File extension (default: jpg) */
  extension?: string;
  /** Content type (default: image/jpeg) */
  contentType?: string;
}

/**
 * Response for upload URL
 */
export interface GetUploadUrlResponse {
  /** Pre-signed PUT URL for uploading */
  uploadUrl: string;
  /** Object key in storage */
  key: string;
  /** URL to access the photo after upload */
  publicUrl: string;
  /** Expiration time in seconds */
  expiresIn: number;
}

/**
 * Request parameters for deleting a photo
 */
export interface DeletePhotoParams {
  /** Object key in storage */
  key: string;
}
