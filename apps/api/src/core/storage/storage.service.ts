import type { IStorageService, IStorageProvider, StorageFile } from "./storage.interface.js";
import { LocalStorageProvider } from "./local-storage.provider.js";

export class StorageService implements IStorageService {
  private readonly providers = new Map<string, IStorageProvider>();
  private defaultProviderName = "local";

  constructor(defaultProvider?: IStorageProvider) {
    this.providers.set("local", defaultProvider || new LocalStorageProvider());
  }

  setProvider(name: string, provider: IStorageProvider): void {
    this.providers.set(name, provider);
  }

  setDefaultProvider(name: string): void {
    if (!this.providers.has(name)) {
      throw new Error(`Storage provider '${name}' not registered.`);
    }
    this.defaultProviderName = name;
  }

  private getProvider(name?: string): IStorageProvider {
    const providerName = name || this.defaultProviderName;
    const provider = this.providers.get(providerName);
    if (!provider) {
      throw new Error(`Storage provider '${providerName}' not found.`);
    }
    return provider;
  }

  async upload(key: string, content: Buffer | string, mimeType?: string): Promise<StorageFile> {
    return this.getProvider().upload(key, content, mimeType);
  }

  async download(key: string): Promise<Buffer> {
    return this.getProvider().download(key);
  }

  async delete(key: string): Promise<boolean> {
    return this.getProvider().delete(key);
  }

  async getUrl(key: string): Promise<string> {
    return this.getProvider().getUrl(key);
  }

  async exists(key: string): Promise<boolean> {
    return this.getProvider().exists(key);
  }
}
