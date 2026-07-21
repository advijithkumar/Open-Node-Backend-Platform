export interface ICacheProvider {
  get<T>(key: string): Promise<T | undefined>;
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;
  delete(key: string): Promise<boolean>;
  clear(): Promise<void>;
  has(key: string): Promise<boolean>;
}

export interface ICacheService extends ICacheProvider {
  remember<T>(key: string, ttlSeconds: number, factory: () => Promise<T>): Promise<T>;
}
