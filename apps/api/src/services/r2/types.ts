// apps/api/src/services/r2/types.ts

/**
 * Signed URL response for upload
 */
export interface UploadUrlResponse {
  /** Pre-signed PUT URL for uploading */
  uploadUrl: string;
  /** Object key in R2 bucket */
  key: string;
  /** URL to access the photo after upload */
  publicUrl: string;
  /** Expiration time in seconds */
  expiresIn: number;
}

/**
 * Signed URL response for download
 */
export interface DownloadUrlResponse {
  /** Pre-signed GET URL for downloading */
  downloadUrl: string;
  /** Expiration time in seconds */
  expiresIn: number;
}

/**
 * R2 service configuration
 */
export interface R2Config {
  endpoint: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicBucketUrl?: string;
}

/**
 * R2 service interface
 */
export interface R2ServiceInterface {
  /**
   * Generate a pre-signed URL for uploading
   */
  generateUploadUrl: (key: string, contentType?: string) => Promise<UploadUrlResponse>;

  /**
   * Generate a pre-signed URL for downloading
   */
  generateDownloadUrl: (key: string) => Promise<DownloadUrlResponse>;

  /**
   * Delete an object from R2
   */
  deleteObject: (key: string) => Promise<void>;

  /**
   * Generate a unique key for a photo
   */
  generatePhotoKey: (userId: string, extension?: string) => string;
}
