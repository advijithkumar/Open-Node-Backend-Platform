# ONBP API

> **Open Node Backend Platform - Reference API**

The ONBP API is the reference backend application of the **Open Node Backend Platform (ONBP)**. It demonstrates the recommended architecture, coding standards, security practices, and development workflow for all backend services built on the platform.

---

# Objectives

* Serve as the primary backend application for ONBP.
* Demonstrate production-ready project architecture.
* Provide REST APIs using Express and TypeScript.
* Integrate PostgreSQL, Redis, and Docker.
* Act as the foundation for ERP, CRM, Inventory, HRMS, Manufacturing, AI, and other backend systems.

---

# Technology Stack

| Technology      | Purpose               |
| --------------- | --------------------- |
| Node.js         | Runtime               |
| TypeScript      | Programming Language  |
| Express         | Web Framework         |
| PostgreSQL      | Relational Database   |
| Prisma          | ORM                   |
| BetterAuth      | Authentication        |
| Docker          | Containerization      |
| Redis           | Cache & Sessions      |
| Swagger/OpenAPI | API Documentation     |
| TurboRepo       | Monorepo Build System |
| PNPM            | Package Manager       |

---

# Project Structure

```text
apps/api
├── src/
├── package.json
├── tsconfig.json
├── .env.example
├── README.md
└── .gitignore
```

---

# Available Scripts

| Command       | Description              |
| ------------- | ------------------------ |
| `pnpm dev`    | Start development server |
| `pnpm build`  | Build the application    |
| `pnpm start`  | Start production server  |
| `pnpm lint`   | Run ESLint               |
| `pnpm format` | Format source code       |
| `pnpm clean`  | Remove build artifacts   |

---

# Development Workflow

1. Install dependencies.
2. Copy `.env.example` to `.env`.
3. Start PostgreSQL and Redis.
4. Run the development server.
5. Build and test before committing changes.

---

# Planned Features

* REST API
* Authentication
* Authorization
* PostgreSQL Integration
* Prisma ORM
* Docker Support
* Redis Cache
* File Storage (MinIO)
* Swagger Documentation
* Health Checks
* Request Logging
* Rate Limiting
* CI/CD Integration
* Monitoring & Metrics

---

# Status

Current Version:

```text
v0.1.0 (Development)
```

The API is currently under active development as part of the Open Node Backend Platform.

---

# License

This project is licensed under the **MIT License**.
