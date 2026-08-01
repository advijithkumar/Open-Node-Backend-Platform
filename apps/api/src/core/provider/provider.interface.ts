/* eslint-disable @typescript-eslint/no-explicit-any */
export interface IProvider {
  readonly name: string;
  readonly type: string;
  readonly version: string;
  enabled: boolean;
  plugin?: string;

  register?(): Promise<void> | void;
  boot?(): Promise<void> | void;
  shutdown?(): Promise<void> | void;
  health?(): Promise<Record<string, any>> | Record<string, any>;
  diagnostics?(): Promise<Record<string, any>> | Record<string, any>;
}
