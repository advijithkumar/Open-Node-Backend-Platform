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

export type JobHandler<T = unknown> = (job: Job<T>) => void | Promise<void>;

export interface IQueueProvider {
  createQueue(name: string): Promise<void>;
  deleteQueue(name: string): Promise<boolean>;
  enqueue<T>(queue: string, data: T, maxRetries?: number): Promise<Job<T>>;
  dequeue(queue: string): Promise<Job | undefined>;
  process<T>(queue: string, handler: JobHandler<T>): void;
  pause(queue: string): Promise<void>;
  resume(queue: string): Promise<void>;
  retry(jobId: string): Promise<boolean>;
  remove(jobId: string): Promise<boolean>;
  getJob(jobId: string): Promise<Job | undefined>;
  getQueueStats(queue: string): Promise<{ pending: number; processing: number; completed: number; failed: number }>;
}

export type IQueueService = IQueueProvider;
