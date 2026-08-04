# Requirement to Component Mapping

Use this guide to map application feature requirements to existing ONBP platform layers and services.

## Mapping Matrix

| Requirement | Use ONBP Component | How to resolve |
| :--- | :--- | :--- |
| File/Image upload or download | **Storage Framework** | Resolve `CORE_SERVICES.STORAGE` |
| Key-value cache | **Cache Framework** | Resolve `CORE_SERVICES.CACHE` |
| Background queues / task workers | **Queue Framework** | Resolve `CORE_SERVICES.QUEUE` |
| Cron jobs / Scheduled processes | **Scheduler** | Resolve `CORE_SERVICES.SCHEDULER` |
| Transactual emails | **Email Framework** | Resolve `CORE_SERVICES.EMAIL` |
| In-app alerts, push notifications | **Notification Framework** | Resolve `CORE_SERVICES.NOTIFICATION` |
| Text completions or embeddings | **AI Framework** | Resolve `CORE_SERVICES.AI` |
| Sessions, logins, token generation | **Better Auth** | Resolve `CORE_SERVICES.CONFIG` & access `/api/v1/auth/` |
| Relational table persistence | **PostgreSQL Plugin** | Import `db` from database integration |
| Diagnostics & status checks | **Framework Doctor** | Resolve `CORE_SERVICES.DOCTOR` or run CLI commands |
| Multi-step business processes | **Workflow Framework** | Resolve `CORE_SERVICES.WORKFLOW` |

---

## Example Scenarios

### Scenario A: Save profile avatar
1. Requirement: Upload user image.
2. Mapping: Use `StorageService` (`CORE_SERVICES.STORAGE`).
3. Execution: Call `storageService.upload(bucket, filename, fileContent)`. Do NOT write custom fs streams.

### Scenario B: Send user password reset link
1. Requirement: Send transaction email.
2. Mapping: Use `EmailService` (`CORE_SERVICES.EMAIL`).
3. Execution: Call `emailService.send({ to, subject, html })`. Do NOT import nodemailer or direct SMTP adapters.

### Scenario C: Orchestrate new user sign up
1. Requirement: Validate, write user details, publish registration event, and trigger welcome emails.
2. Mapping: Use `WorkflowService` (`CORE_SERVICES.WORKFLOW`) to execute `user-onboarding-workflow`.
3. Execution: Call `workflowService.execute("user-onboarding-workflow", { email, name })`.
