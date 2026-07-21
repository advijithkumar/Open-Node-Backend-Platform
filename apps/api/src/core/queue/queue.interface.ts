export interface Job<T = unknown> {
  id: string;
  name: string;
  data: T;
  attempts: number;
  maxRetries: number;
  status: "pending" | "processing" | "completed" | "failed";
  error?: string;
  createdAt: Date;
}

export type JobHandler<T = unknown> = (job: Job<T>) => Promise<void>;

export interface IQueueService {
  enqueue<T>(name: string, data: T, maxRetries?: number): Promise<Job<T>>;
  process<T>(name: string, handler: JobHandler<T>): void;
  getJob(id: string): Promise<Job | undefined>;
}
