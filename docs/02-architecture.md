# 🏗️ ONBP Architecture

> **Purpose:** Define the software architecture of the Open Node Backend Platform (ONBP).

---

# 🎯 Purpose

The architecture of ONBP defines how the platform is structured, how its components interact, and the engineering principles that guide its design.

A well-defined architecture ensures that every ONBP application follows the same structure, making projects easier to develop, maintain, test, and scale.

The architecture prioritizes simplicity, modularity, maintainability, and long-term sustainability over unnecessary complexity.

---

# 🌍 Architecture Vision

ONBP is designed as a **modular, production-ready backend platform**.

Instead of treating every project as a completely new application, ONBP provides a reusable foundation where common infrastructure is built once and reused across multiple business applications.

Applications should focus on business requirements while ONBP provides the underlying platform services.

---

# 🏛️ Architectural Principles

Every ONBP project should follow these principles:

* **Modular Design** – Features are developed as independent modules.
* **Separation of Concerns** – Each layer has a single responsibility.
* **Reusable Components** – Build once, reuse everywhere.
* **Security by Default** – Secure configuration should be the default.
* **Documentation First** – Architecture decisions are documented before implementation.
* **Scalability** – Support growth from small projects to enterprise systems.
* **Maintainability** – Prefer clear and simple designs over clever complexity.
* **Consistency** – Every ONBP project follows the same architecture.

---

# 🧱 High-Level Architecture

```text
                           +----------------------+
                           |     Applications     |
                           +----------+-----------+
                                      |
                                      v
                           +----------------------+
                           |   Business Modules   |
                           +----------+-----------+
                                      |
                                      v
                           +----------------------+
                           |   Platform Modules   |
                           +----------+-----------+
                                      |
                                      v
                           +----------------------+
                           | Shared Packages/Core |
                           +----------+-----------+
                                      |
                                      v
                           +----------------------+
                           |  Infrastructure      |
                           +----------------------+
```

---

# 📦 Layer 1 – Applications

Applications are built **using** ONBP.

Examples include:

* ERP
* CRM
* Hospital Management
* School Management
* Transport Management
* Manufacturing Systems
* AI Platforms
* IoT Platforms

Applications contain business-specific requirements and should avoid modifying the ONBP core.

---

# 💼 Layer 2 – Business Modules

Business modules implement domain-specific functionality.

Examples:

### ERP

* Inventory
* Production
* Purchasing
* Sales
* Finance
* Human Resources

### Hospital

* Patients
* Doctors
* Pharmacy
* Laboratory
* Billing

### Transport

* Vehicles
* Trips
* Drivers
* Routes
* Fuel Management

These modules contain business rules and workflows.

---

# ⚙️ Layer 3 – Platform Modules

Platform modules provide reusable services shared by all applications.

Examples include:

* Authentication
* Authorization
* User Management
* Roles
* Permissions
* Notifications
* File Storage
* Audit Logs
* Settings
* Health Checks
* Background Jobs

These modules are independent of any specific business domain.

---

# 📚 Layer 4 – Shared Packages

Shared packages contain reusable utilities used throughout the platform.

Examples:

* Logger
* Configuration
* Validation
* Database
* Cache
* Email
* Queue
* Utilities
* Constants

Business modules should reuse these packages instead of duplicating functionality.

---

# 🖥️ Layer 5 – Infrastructure

Infrastructure consists of external services that support the platform.

Examples:

* Docker
* Nginx
* PostgreSQL
* Redis
* MinIO
* RabbitMQ
* MQTT
* Prometheus
* Grafana

These services provide storage, networking, messaging, monitoring, and deployment capabilities.

---

# 🌐 Request Flow

Every HTTP request follows the same processing pipeline.

```text
Client
   │
   ▼
Nginx
   │
   ▼
Express Server
   │
   ▼
Middleware
   │
   ▼
Controller
   │
   ▼
Service
   │
   ▼
Repository
   │
   ▼
Prisma ORM
   │
   ▼
PostgreSQL
   │
   ▼
Response
```

This standardized flow ensures consistency across all modules.

---

# 🔄 Layer Responsibilities

| Layer      | Responsibility                      |
| ---------- | ----------------------------------- |
| Client     | Sends HTTP requests                 |
| Nginx      | Reverse proxy and SSL termination   |
| Middleware | Validation, authentication, logging |
| Controller | Handle requests and responses       |
| Service    | Business logic                      |
| Repository | Database operations                 |
| Prisma     | ORM layer                           |
| PostgreSQL | Persistent data storage             |

---

# 🔗 Dependency Rules

Dependencies should always move downward.

✅ Allowed

```text
Controller
    ↓
Service
    ↓
Repository
    ↓
Database
```

❌ Not Allowed

```text
Controller
    ↓
Database
```

Controllers should never communicate directly with the database.

---

# 📂 Standard Module Structure

Every module should follow a consistent layout.

```text
module-name/
│
├── controllers/
├── services/
├── repositories/
├── routes/
├── schemas/
├── dto/
├── types/
├── middleware/
├── tests/
└── index.ts
```

Consistency improves maintainability and onboarding.

---

# 🔒 Security Architecture

Security is integrated throughout the platform.

The architecture includes:

* Authentication
* Authorization
* Request Validation
* Rate Limiting
* Secure HTTP Headers
* Input Sanitization
* Audit Logging
* Environment Variable Management

Security should never be treated as an optional feature.

---

# 📈 Scalability Strategy

ONBP adopts a **Modular Monolith** architecture initially.

Benefits:

* Easier development
* Simpler deployment
* Faster debugging
* Lower operational complexity

As requirements evolve, individual modules can be extracted into independent microservices without changing business logic.

---

# 🧪 Testability

Each architectural layer should be independently testable.

Recommended testing levels:

* Unit Tests
* Integration Tests
* API Tests
* End-to-End Tests

Testing is considered part of the architecture, not an afterthought.

---

# 🚀 Future Evolution

The architecture is designed to evolve over time.

Future enhancements may include:

* Plugin System
* CLI Project Generator
* Module Marketplace
* Event-Driven Architecture
* Microservice Support
* Multi-Tenant Support
* Cloud-Native Deployments

The architecture should remain flexible while preserving backward compatibility where practical.

---

# 📝 Summary

The ONBP architecture provides a consistent, modular, and production-ready foundation for backend development.

By separating responsibilities into clearly defined layers and enforcing consistent design principles, ONBP enables developers to build scalable and maintainable applications while focusing on business functionality rather than infrastructure.

The architecture is intentionally designed to be simple enough for students to learn, yet powerful enough to support enterprise applications.

---

## 📜 Decision Log

| Version | Date       | Description                   |
| ------- | ---------- | ----------------------------- |
| v0.1    | 2026-07-14 | Initial Architecture Document |
