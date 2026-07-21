export interface StorageFile {
  path: string;
  size: number;
  mimeType?: string;
  url?: string;
}

export interface IStorageProvider {
  upload(key: string, content: Buffer | string, mimeType?: string): Promise<StorageFile>;
  download(key: string): Promise<Buffer>;
  delete(key: string): Promise<boolean>;
  getUrl(key: string): Promise<string>;
  exists(key: string): Promise<boolean>;
}

export interface IStorageService extends IStorageProvider {
  setProvider(providerName: string, provider: IStorageProvider): void;
}
