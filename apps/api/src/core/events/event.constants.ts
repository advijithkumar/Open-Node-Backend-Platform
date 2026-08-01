// src/core/events/event.constants.ts

export const SYSTEM_EVENTS = {
  READY: "system.ready",
  STARTING: "system.starting",
  STOPPING: "system.stopping",
} as const;

export const STORAGE_EVENTS = {
  UPLOAD_STARTED: "storage.upload.started",
  UPLOAD_COMPLETED: "storage.upload.completed",
  DOWNLOAD_STARTED: "storage.download.started",
  DOWNLOAD_COMPLETED: "storage.download.completed",
  DELETED: "storage.deleted",
  DELETION_STARTED: "storage.deletion.started",
  COPIED: "storage.copied",
  COPY_STARTED: "storage.copy.started",
  MOVED: "storage.moved",
  MOVE_STARTED: "storage.move.started",
  BUCKET_CREATED: "storage.bucket.created",
  BUCKET_DELETED: "storage.bucket.deleted",
  FAILED: "storage.failed",
} as const;