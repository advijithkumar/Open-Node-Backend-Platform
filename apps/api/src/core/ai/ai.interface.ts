export interface AICompletionOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface IAIService {
  complete(prompt: string, options?: AICompletionOptions): Promise<string>;
  embed(text: string): Promise<number[]>;
}
