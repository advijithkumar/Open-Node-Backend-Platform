# Component Selection Rules

When adding features, reference this lookup matrix to identify the correct ONBP platform capability.

| Action Requirement | Use Component | Do NOT |
| :--- | :--- | :--- |
| User logins, tokens, registrations | `Better Auth` integration | Code custom JWT or login schemes |
| Relational queries or SQL | `PostgreSQL Plugin` + `Drizzle` | Instantiate direct postgres client pools |
| Key-value cache | `CacheService` | Write custom `ioredis` wrappers |
| Background tasks / workers | `QueueManager` | Write `setInterval` or custom queue handlers |
| CRON / Scheduled tasks | `SchedulerService` | Import `node-cron` or `agenda` |
| Blob uploads or file storage | `StorageService` | Use raw S3 SDKs or write directly to local files |
| In-app alerts, SMS | `NotificationService` | Call Twilio or firebase APIs directly |
| Sending transactional emails | `EmailService` | Connect to SMTP using raw node packages |
| LLMs text or embeddings generation | `AIService` | Call OpenAI/Gemini endpoints directly |
| Verify system integrity | `DoctorService` | Add independent diagnostics |
