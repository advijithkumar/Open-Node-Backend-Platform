export interface BetterAuthPluginConfig {
  secret: string;
  baseUrl: string;
  trustedOrigins?: string[];
  session?: Record<string, unknown>;
  cookie?: Record<string, unknown>;
  enabled: boolean;
}
