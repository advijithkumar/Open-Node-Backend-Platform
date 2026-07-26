export interface RedisPluginConfig {
  url?: string;
  host?: string;
  port?: number;
  password?: string;
  db?: number;
  enabled: boolean;
}
