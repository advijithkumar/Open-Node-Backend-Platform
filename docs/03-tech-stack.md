# 🛠️ Technology Stack

> **Purpose:** Define the official technology stack used by the Open Node Backend Platform (ONBP).

---

# 🎯 Purpose

The Technology Stack document defines the software, tools, libraries, and infrastructure officially adopted by ONBP.

The goal is to establish a standardized development environment that is secure, maintainable, scalable, and completely based on free and open-source technologies.

A standardized technology stack ensures that every application built using ONBP follows the same engineering practices, reducing development time and improving maintainability.

---

# 🌍 Technology Selection Philosophy

Every technology selected for ONBP must satisfy the following principles:

- ✅ Free to use
- ✅ Open Source
- ✅ Production Ready
- ✅ Well Documented
- ✅ Actively Maintained
- ✅ Large Community Support
- ✅ Scalable
- ✅ Easy to Learn
- ✅ Cross Platform
- ✅ No Vendor Lock-in

Technologies that do not meet these principles should not become part of the ONBP Core Platform.

---

# 🏗️ Core Technology Stack

These technologies are mandatory for every ONBP project.

| Category                | Technology         | Purpose                             |
| ----------------------- | ------------------ | ----------------------------------- |
| Runtime                 | Node.js            | JavaScript runtime                  |
| Language                | TypeScript         | Type-safe development               |
| Framework               | Express.js         | REST API framework                  |
| ORM                     | Prisma ORM         | Database access                     |
| Database                | PostgreSQL         | Primary relational database         |
| Authentication          | BetterAuth         | Authentication and authorization    |
| Validation              | Zod                | Request and data validation         |
| API Documentation       | Swagger / OpenAPI  | Interactive API documentation       |
| Logging                 | Pino               | High-performance structured logging |
| Security                | Helmet             | HTTP security headers               |
| Rate Limiting           | express-rate-limit | API protection                      |
| Configuration           | dotenv             | Environment configuration           |
| Testing                 | Vitest             | Unit testing                        |
| API Testing             | Supertest          | Integration testing                 |
| Manual API Testing      | Bruno              | API client and collections          |
| Containerization        | Docker             | Application containers              |
| Container Orchestration | Docker Compose     | Multi-container development         |

---

# 🗄️ Database Stack

## Primary Database

**PostgreSQL**

### Why PostgreSQL?

PostgreSQL is selected because it provides:

- Excellent SQL compliance
- High performance
- Strong ACID guarantees
- Advanced indexing
- JSON support
- Full-text search
- Spatial extensions (PostGIS)
- Large community support
- Proven enterprise reliability

### Alternatives Considered

- MySQL
- MariaDB
- SQLite
- MongoDB

PostgreSQL was selected because it offers the best balance between enterprise capabilities and open-source flexibility.

---

# 🔐 Authentication Stack

ONBP officially adopts **BetterAuth**.

Reasons:

- Modern authentication system
- Session management
- OAuth support
- Email authentication
- Secure by default
- TypeScript support
- Open Source

Authentication should never be implemented from scratch unless there is a specific project requirement.

---

# 🐳 Infrastructure Stack

Every ONBP application should support Docker-based development.

| Technology     | Purpose                      |
| -------------- | ---------------------------- |
| Docker         | Application containerization |
| Docker Compose | Multi-service development    |
| Nginx          | Reverse proxy                |
| PostgreSQL     | Database                     |
| Redis          | Cache and session storage    |
| MinIO          | Object storage (optional)    |

These services provide a production-ready backend environment.

---

# ⚡ Cache Layer

Redis is the official caching solution.

Use cases:

- Session storage
- API caching
- Temporary data
- Background jobs
- Rate limiting
- Pub/Sub messaging

Redis is optional for smaller projects but recommended for production deployments.

---

# 📦 Object Storage

ONBP recommends **MinIO Community Edition**.

Why?

- S3 compatible
- Self-hosted
- Open Source
- High performance
- Easy Docker deployment

Typical use cases include:

- File uploads
- Images
- Documents
- Reports
- Backup storage

---

# 📍 GIS & Mapping Stack (Optional)

Some applications require maps and geospatial data.

ONBP recommends the following stack:

| Component        | Technology              |
| ---------------- | ----------------------- |
| Map Data         | OpenStreetMap           |
| Web Maps         | Leaflet                 |
| Flutter Maps     | flutter_map             |
| Spatial Database | PostGIS                 |
| Geocoding        | Nominatim               |
| Routing          | Valhalla or GraphHopper |

This stack avoids proprietary map providers while supporting advanced GIS features.

---

# 🤖 Artificial Intelligence Stack (Optional)

Applications that require AI capabilities may use:

| Technology | Purpose                    |
| ---------- | -------------------------- |
| Ollama     | Local LLM execution        |
| Qdrant     | Vector database            |
| Chroma     | Lightweight vector storage |
| llama.cpp  | Local inference            |
| Open WebUI | AI interface               |

These technologies are optional modules and are not part of the ONBP core.

---

# 📡 Messaging Stack (Optional)

Applications requiring asynchronous communication may use:

| Technology | Purpose                 |
| ---------- | ----------------------- |
| RabbitMQ   | Message broker          |
| MQTT       | IoT communication       |
| Socket.IO  | Real-time communication |

The messaging stack should be enabled only when required.

---

# 📊 Monitoring Stack (Optional)

ONBP recommends the following monitoring tools:

| Technology | Purpose            |
| ---------- | ------------------ |
| Prometheus | Metrics collection |
| Grafana    | Dashboards         |
| Loki       | Log aggregation    |

These tools improve observability in production environments.

---

# 🧪 Testing Stack

Quality assurance is part of the platform.

| Category            | Technology |
| ------------------- | ---------- |
| Unit Testing        | Vitest     |
| Integration Testing | Supertest  |
| Manual API Testing  | Bruno      |
| Load Testing        | k6         |

Every production-ready module should include appropriate tests.

---

# 🚀 CI/CD

Recommended tools:

- GitHub Actions
- Jenkins
- Gitea Actions

Typical workflow:

```text
Code

↓

Lint

↓

Type Check

↓

Unit Tests

↓

Integration Tests

↓

Docker Build

↓

Deployment
```

---

# 📂 Development Tools

| Tool                           | Purpose                       |
| ------------------------------ | ----------------------------- |
| Git                            | Version control               |
| VS Code                        | Recommended editor            |
| Docker Desktop / Docker Engine | Container development         |
| pgAdmin                        | PostgreSQL administration     |
| DBeaver                        | Universal database client     |
| Postman / Bruno                | API testing (Bruno preferred) |

---

# 📜 Technology Selection Rules

A technology can become part of ONBP only if it satisfies most of the following:

- Free and Open Source
- Stable
- Production Ready
- Actively Maintained
- Well Documented
- Large Community
- Long-term Support
- Cross Platform
- Docker Compatible
- Easy to Learn

---

# ❌ Technologies Not Included

ONBP intentionally avoids technologies that introduce unnecessary complexity or vendor dependency into the core platform.

Examples include:

- Proprietary cloud services as mandatory dependencies
- Closed-source databases
- Commercial authentication services
- Proprietary storage solutions
- Vendor-specific SDKs

Developers may integrate these when required by a project, but they are not part of the ONBP standard.

---

# 🔮 Future Technology Evaluation

The technology stack is not fixed forever.

Before adopting a new technology, the ONBP team should evaluate:

1. Is it open source?
2. Is it actively maintained?
3. Is it production ready?
4. Does it improve developer experience?
5. Is migration worthwhile?
6. Does it align with ONBP principles?

Technology decisions should be based on engineering value rather than popularity.

---

# 📝 Summary

ONBP is built on a carefully selected collection of modern, production-ready, and open-source technologies.

By standardizing the technology stack, ONBP ensures consistency across projects while allowing optional modules to extend functionality when needed.

The objective is not to use the newest technology available, but to use technologies that are reliable, maintainable, secure, and capable of supporting enterprise applications for many years.

---

## 📜 Decision Log

| Version | Date       | Description                       |
| ------- | ---------- | --------------------------------- |
| v0.1    | 2026-07-14 | Initial Technology Stack Document |
