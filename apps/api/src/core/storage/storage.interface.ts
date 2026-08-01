/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Storage File metadata
 */
export interface StorageFile {
  /** Full path to the file */
  path: string;
  /** Size in bytes */
  size: number;
  /** MIME type of the file */
  mimeType?: string;
  /** Public URL to access the file */
  url?: string;
}

/**
 * Options for upload operations
 */
export interface UploadOptions {
  /** MIME type of the file */
  mimeType?: string;
  /** Cache control header */
  cacheControl?: string;
  /** Content disposition */
  contentDisposition?: string;
  /** Custom metadata */
  metadata?: Record<string, string>;
}

/**
 * Options for listing files
 */
export interface ListOptions {
  /** Prefix to filter results */
  prefix?: string;
  /** Maximum number of results */
  limit?: number;
}

/**
 * Options for signed URL generation
 */
export interface SignedUrlOptions {
  /** URL expiration time in seconds */
  expires?: number;
  /** HTTP method restriction */
  method?: string;
}

/**
 * Bucket metadata
 */
export interface BucketInfo {
  /** Bucket name */
  name: string;
  /** Creation date */
  createdAt?: Date;
  /** Region */
  region?: string;
  /** Public access flag */
  public?: boolean;
}

/**
 * Storage provider interface – provider-agnostic contract
 */
export interface IStorageProvider {
  /** Upload a file */
  upload(bucket: string, path: string, content: Buffer | string, options?: UploadOptions): Promise<StorageFile>;
  
  /** Download a file */
  download(bucket: string, path: string): Promise<Buffer>;
  
  /** Delete a file */
  delete(bucket: string, path: string): Promise<boolean>;
  
  /** Check if a file exists */
  exists(bucket: string, path: string): Promise<boolean>;
  
  /** List files in a bucket */
  list(bucket: string, options?: ListOptions): Promise<StorageFile[]>;
  
  /** Copy a file */
  copy(source: { bucket: string; path: string }, destination: { bucket: string; path: string }): Promise<StorageFile>;
  
  /** Move a file (copy then delete) */
  move(source: { bucket: string; path: string }, destination: { bucket: string; path: string }): Promise<StorageFile>;
  
  /** Get file metadata */
  getMetadata(bucket: string, path: string): Promise<StorageFile>;
  
  /** Generate a signed URL for a file */
  generateSignedUrl(bucket: string, path: string, options?: SignedUrlOptions): Promise<string>;
  
  /** Create a bucket */
  createBucket(name: string, options?: { region?: string; public?: boolean }): Promise<BucketInfo>;
  
  /** Delete a bucket */
  deleteBucket(name: string): Promise<void>;
  
  /** Check if a bucket exists */
  bucketExists(name: string): Promise<boolean>;
  
  /** List all buckets */
  listBuckets(): Promise<BucketInfo[]>;
  
  /** Get storage statistics */
  getStorageStats(): Promise<{ totalBytes: number; totalFiles: number }>;
  
  /** Get URL for file access (for local filesystem) */
  getUrl(bucket: string, path: string): Promise<string>;
  
  /** Health check */
  health?(): Promise<{ status: "healthy" | "unhealthy"; reason?: string }>;
  
  /** Diagnostics */
  diagnostics?(): Promise<Record<string, any>>;
}

/**
 * Storage service interface
 */
export interface IStorageService extends IStorageProvider {
  /** Set the active provider by name */
  setProvider(name: string, provider: IStorageProvider): void;
  
  /** Get the active provider by name */
  getProvider(name?: string): IStorageProvider;
  
  /** List all registered providers */
  listProviders(): string[];
  
  /** Health check */
  getHealth(): Promise<{ status: "healthy" | "unhealthy"; reason?: string }>;
  
  /** Diagnostics */
  getDiagnostics(): {
    activeProvider: string;
    registeredProviders: string[];
    statistics: { totalBytes: number; totalFiles: number };
  };
}