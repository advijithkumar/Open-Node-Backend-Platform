# Technology & Version Matrix

These are the official dependency versions utilized across the ONBP repository. Do NOT install conflicting packages or run mismatched environments.

| Technology | Purpose | Version | Required/Optional | ONBP Integration | Configuration |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Node.js** | Engine runtime | `>=22.0.0` | Required | Core runner | System Env |
| **TypeScript** | Language compilation | `^5.9.3` | Required | Compiler | `tsconfig.json` |
| **Express** | Router framework | `^5.2.1` | Required | Web API layer | ConfigManager (`app.port`) |
| **PostgreSQL** | Primary Database | `^3.4.9` | Required | postgres plugin | ConfigManager (`database.*`) |
| **Redis** | In-memory store | `^5.11.1` | Required | cache/queue store | ConfigManager (`cache.redis.*`) |
| **MinIO** | Object storage | `^8.0.7` | Optional | storage provider | ConfigManager (`storage.minio.*`) |
| **Better Auth** | Authentication | `^1.6.23` | Required | auth plugin | ConfigManager (`auth.*`) |
| **Zod** | Validation schema | `^4.4.3` | Required | validation checks | Inline definitions |
| **Pino** | Logging utility | `^10.3.1` | Required | Logger | ConfigManager (`logger.*`) |
| **Drizzle ORM** | Schema mapper | `^0.45.2` | Required | persistence | `drizzle.config.ts` |
| **Vitest** | Test runner | `^4.1.10` | Required | test automation | `vitest.config.ts` |
| **Turbo** | Task manager | `^2.10.5` | Required | workspace monorepo | `turbo.json` |
| **pnpm** | Package manager | `10.13.0` | Required | dependencies management | `package.json` |
