export const PROVIDER_TYPES = {
  STORAGE: "storage",
  CACHE: "cache",
  QUEUE: "queue",
  AI: "ai",
  MAIL: "mail",
  SEARCH: "search",
} as const;

export type ProviderType = typeof PROVIDER_TYPES[keyof typeof PROVIDER_TYPES];
