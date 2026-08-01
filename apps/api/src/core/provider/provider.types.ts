/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ProviderDiagnostics {
  name: string;
  type: string;
  version: string;
  enabled: boolean;
  health?: Record<string, any> | string;
  diagnostics?: Record<string, any>;
}
