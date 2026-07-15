# 📂 ONBP Folder Structure

> **Purpose:** Define the official folder and workspace structure of the Open Node Backend Platform (ONBP).

---

# 🎯 Purpose

The folder structure defines how source code, configuration, documentation, infrastructure, and reusable components are organized within ONBP.

A consistent project structure improves:

* Readability
* Maintainability
* Scalability
* Team collaboration
* Developer onboarding

Every ONBP project should follow this structure unless there is a documented architectural reason to do otherwise.

---

# 🌍 Design Principles

The ONBP folder structure follows these principles:

* Consistent across all projects
* Easy to understand
* Modular by design
* Clear separation of responsibilities
* Scalable for enterprise applications
* Reusable across multiple products

---

# 🏗️ Repository Structure

```text
Open-Node-Backend-Platform/
│
├── apps/
├── packages/
├── platform/
├── docker/
├── docs/
├── scripts/
├── templates/
├── tools/
├── tests/
├── .github/
│
├── package.json
├── pnpm-workspace.yaml
├── tsconfig.json
├── .env.example
├── .gitignore
├── LICENSE
└── README.md
```

---

# 📁 apps/

Contains business applications built using ONBP.

Examples:

```text
apps/
├── erp/
├── crm/
├── hospital/
├── manufacturing/
├── transport/
└── inventory/
```

Each application contains only business-specific functionality.

Applications should never modify the ONBP core.

---

# 📁 packages/

Reusable libraries shared across all applications.

```text
packages/
├── logger/
├── config/
├── database/
├── validation/
├── cache/
├── mail/
├── storage/
├── queue/
└── utils/
```

Packages should:

* Contain reusable code.
* Have minimal dependencies.
* Be independently testable.

Packages should **not** contain business logic.

---

# 📁 platform/

Platform modules provide common services used by all applications.

```text
platform/
├── auth/
├── users/
├── roles/
├── permissions/
├── notifications/
├── audit/
├── settings/
├── health/
└── files/
```

Platform modules are independent of any business domain.

---

# 📁 docker/

Docker resources for development and production.

```text
docker/
├── development/
├── production/
├── postgres/
├── redis/
├── nginx/
├── minio/
└── monitoring/
```

Purpose:

* Local development
* Production deployment
* Container configuration
* Service orchestration

---

# 📁 docs/

Engineering documentation.

```text
docs/
├── README.md
├── architecture/
├── standards/
├── adr/
├── examples/
├── images/
└── tech/
```

Documentation is considered part of the project and should be maintained alongside the code.

---

# 📁 scripts/

Automation scripts.

Examples:

```text
scripts/
├── setup.sh
├── build.sh
├── start.sh
├── backup.sh
├── restore.sh
└── clean.sh
```

Scripts should automate repetitive development tasks.

---

# 📁 templates/

Project templates used by the future ONBP CLI.

```text
templates/
├── minimal-api/
├── erp/
├── microservice/
└── worker/
```

Templates provide standardized project starting points.

---

# 📁 tools/

Developer utilities.

Examples:

```text
tools/
├── module-generator/
├── project-generator/
├── database-tools/
└── environment-check/
```

Tools improve developer productivity and automate common tasks.

---

# 📁 tests/

Global test resources.

```text
tests/
├── integration/
├── e2e/
├── fixtures/
└── helpers/
```

Individual modules should also contain local unit tests.

---

# 📁 .github/

GitHub configuration.

```text
.github/
├── workflows/
├── ISSUE_TEMPLATE/
├── PULL_REQUEST_TEMPLATE.md
└── CODEOWNERS
```

This folder manages automation and collaboration settings.

---

# 📦 Standard Application Structure

Each application should follow the same layout.

```text
apps/erp/
│
├── src/
├── prisma/
├── config/
├── tests/
├── public/
├── package.json
├── tsconfig.json
└── README.md
```

---

# 📦 Source Folder Structure

```text
src/
├── modules/
├── shared/
├── config/
├── middleware/
├── routes/
├── plugins/
├── jobs/
├── utils/
├── types/
├── app.ts
└── server.ts
```

---

# 📦 Standard Module Structure

Every module should follow the same structure.

```text
inventory/
├── controllers/
├── services/
├── repositories/
├── routes/
├── dto/
├── schemas/
├── validators/
├── middleware/
├── types/
├── tests/
├── index.ts
└── README.md
```

This consistency allows developers to move between modules without learning a new layout each time.

---

# 📦 Shared Folder

Reusable application-level components.

```text
shared/
├── constants/
├── errors/
├── helpers/
├── interfaces/
├── middleware/
├── services/
├── types/
└── utils/
```

These components should remain business-independent.

---

# 📄 Configuration Files

| File                | Purpose                           |
| ------------------- | --------------------------------- |
| package.json        | Project metadata and dependencies |
| tsconfig.json       | TypeScript configuration          |
| pnpm-workspace.yaml | Workspace configuration           |
| .env.example        | Environment variable template     |
| .gitignore          | Git exclusions                    |
| README.md           | Project overview                  |
| LICENSE             | Open-source license               |

---

# 🏷️ Naming Conventions

| Item                 | Convention       | Example         |
| -------------------- | ---------------- | --------------- |
| Folder               | kebab-case       | user-profile    |
| File                 | kebab-case       | user.service.ts |
| Class                | PascalCase       | UserService     |
| Interface            | PascalCase       | UserRepository  |
| Type                 | PascalCase       | LoginRequest    |
| Enum                 | PascalCase       | UserRole        |
| Variable             | camelCase        | currentUser     |
| Function             | camelCase        | createUser      |
| Constant             | UPPER_SNAKE_CASE | MAX_FILE_SIZE   |
| Environment Variable | UPPER_SNAKE_CASE | DATABASE_URL    |

---

# 🚫 What Should NOT Be Done

Avoid:

* Mixing business logic with shared packages.
* Creating random folders without documentation.
* Duplicating utility functions.
* Accessing the database directly from controllers.
* Storing secrets in the repository.
* Placing unrelated files in the project root.

A clean structure is easier to maintain than fixing a disorganized project later.

---

# 📈 Scalability

The folder structure is designed to support growth from:

* Small APIs
* Enterprise ERP systems
* Multi-tenant applications
* Microservices
* Plugin-based architectures

New modules should integrate naturally without restructuring the repository.

---

# 🔗 Related Documents

* 02-architecture.md
* 03-tech-stack.md
* 05-coding-standards.md
* 06-api-standards.md

---

# 📚 Architecture Decision Records

Related ADRs:

* ADR-0001 Repository Structure
* ADR-0002 Modular Architecture
* ADR-0003 Shared Packages

(These ADRs will be created as the project evolves.)

---

# 🚀 Future Improvements

Potential enhancements include:

* ONBP CLI-generated folder structures.
* Plugin discovery conventions.
* Monorepo automation.
* Workspace package templates.
* Multi-language project templates.

---

# 📝 Summary

The ONBP folder structure provides a standardized organization for applications, platform modules, shared packages, and infrastructure.

By following a consistent layout, developers can quickly understand any ONBP project, reduce onboarding time, and improve long-term maintainability.

The folder structure is designed to evolve with the platform while preserving clarity, consistency, and modularity.

---

## 📜 Decision Log

| Version | Date       | Description                       |
| ------- | ---------- | --------------------------------- |
| v0.1    | 2026-07-15 | Initial Folder Structure Document |
