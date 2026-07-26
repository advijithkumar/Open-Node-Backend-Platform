export interface IGenerator {
  generate(name: string, options?: Record<string, any>): Promise<void>;
}
