# 🐳 ONBP Docker Standards

> **Purpose:** Define the official Docker architecture, container standards, development environment, and deployment practices for the Open Node Backend Platform (ONBP).

---

# 🎯 Purpose

Docker provides a consistent and reproducible runtime environment for ONBP applications.

Every ONBP project should be able to run with minimal setup regardless of the developer's operating system.

Goals:

* Eliminate "works on my machine" problems.
* Standardize local development.
* Simplify deployment.
* Isolate services.
* Support scalable production environments.

---

# 🌍 Docker Philosophy

ONBP follows these principles:

* Containerize every service.
* One responsibility per container.
* Keep images lightweight.
* Prefer official Docker images.
* Separate development and production configurations.
* Automate setup wherever possible.

Docker is considered the standard runtime environment for ONBP.

---

# 🏗️ Standard Development Architecture

```text
                    Docker Compose
                           │
        ┌──────────┬──────────┬──────────┬──────────┐
        │          │          │          │
      API      PostgreSQL    Redis     MinIO
        │
        │
    Swagger UI
        │
        ▼
      Nginx
```

Every ONBP application follows this architecture.

---

# 📦 Standard Services

The default development environment should include:

| Service    | Purpose                          |
| ---------- | -------------------------------- |
| API        | Express + TypeScript application |
| PostgreSQL | Primary relational database      |
| Redis      | Cache and rate limiting          |
| MinIO      | Object storage                   |
| Nginx      | Reverse proxy                    |
| Swagger    | API documentation                |

Optional services:

| Service    | Purpose                   |
| ---------- | ------------------------- |
| MailHog    | Email testing             |
| pgAdmin    | PostgreSQL administration |
| Prometheus | Metrics collection        |
| Grafana    | Monitoring dashboards     |

---

# 📂 Docker Directory Structure

```text
docker/
├── development/
│   ├── Dockerfile
│   └── docker-compose.yml
│
├── production/
│   ├── Dockerfile
│   └── docker-compose.yml
│
├── nginx/
│   └── nginx.conf
│
├── postgres/
│   ├── init.sql
│   └── backups/
│
├── redis/
│
├── minio/
│
└── monitoring/
    ├── prometheus/
    └── grafana/
```

This layout keeps infrastructure separate from application code.

---

# 🏷️ Container Naming

Use consistent service names.

```text
api
postgres
redis
minio
nginx
```

Avoid names tied to specific projects such as:

```text
erp-api
crm-db
inventory-postgres
```

Generic names improve reusability.

---

# 🌐 Docker Network

Create a dedicated Docker network for every ONBP project.

Example:

```text
onbp-network
```

Benefits:

* Secure service communication.
* DNS-based service discovery.
* Isolation from other containers.

---

# 💾 Volumes

Persist important data using Docker volumes.

Recommended volumes:

```text
postgres-data

redis-data

minio-data
```

Do not store persistent data inside containers.

---

# ⚙️ Environment Variables

Configuration should be managed through environment variables.

Examples:

```text
NODE_ENV
PORT
DATABASE_URL
REDIS_URL
MINIO_ENDPOINT
MINIO_ACCESS_KEY
MINIO_SECRET_KEY
BETTER_AUTH_SECRET
```

Provide a `.env.example` file with placeholder values.

Never commit real credentials to version control.

---

# ❤️ Health Checks

Every service should expose a health check.

Examples:

| Service    | Health Check             |
| ---------- | ------------------------ |
| API        | `/health`                |
| PostgreSQL | `pg_isready`             |
| Redis      | `redis-cli ping`         |
| MinIO      | Built-in health endpoint |

Docker Compose should wait for dependencies to become healthy before starting dependent services.

---

# 🚀 Startup Order

Recommended startup sequence:

```text
PostgreSQL
      │
Redis
      │
MinIO
      │
API
      │
Nginx
```

The API should not start until required services are healthy.

---

# 📋 Logging

Container logs should:

* Use structured JSON where possible.
* Include timestamps.
* Include log levels.
* Be easy to aggregate.

Do not log sensitive information such as passwords, tokens, or secrets.

---

# 🔐 Container Security

Recommendations:

* Run containers as non-root users where practical.
* Keep base images updated.
* Remove unnecessary packages.
* Expose only required ports.
* Restrict inter-service communication where possible.

Never embed secrets directly into Docker images.

---

# 🧪 Development Workflow

Typical workflow:

```text
Clone Repository
        │
Copy .env.example → .env
        │
docker compose up -d
        │
Run Database Migrations
        │
Seed Development Data
        │
Start Development
```

This workflow should be documented for every ONBP application.

---

# 🌍 Production Workflow

Production deployments should:

* Use production-specific Dockerfiles.
* Use production environment variables.
* Enable HTTPS.
* Configure automated backups.
* Enable monitoring and alerting.
* Rotate secrets regularly.
* Restart containers automatically when appropriate.

---

# 💽 Backup Strategy

Back up:

* PostgreSQL database
* MinIO object storage
* Configuration (where applicable)

Backups should:

* Run automatically.
* Be stored securely.
* Be tested through periodic restore exercises.

---

# 📊 Monitoring

Recommended monitoring stack:

```text
Prometheus
      │
Grafana
      │
ONBP Services
```

Monitor:

* CPU usage
* Memory usage
* Disk usage
* API latency
* Database health
* Redis health
* Container status

---

# 🔄 Docker Image Standards

Recommendations:

* Use official images where available.
* Pin image versions.
* Avoid using the `latest` tag in production.
* Minimize image size.
* Remove build-time dependencies from runtime images.

---

# 🛠️ Troubleshooting

Common checks:

```bash
docker compose ps

docker compose logs

docker compose exec api sh

docker compose restart api

docker compose down

docker compose up -d
```

Verify:

* Container health
* Network connectivity
* Environment variables
* Mounted volumes
* Database availability

---

# 🚫 Avoid

* Running everything in one container.
* Storing persistent data inside containers.
* Using production credentials in development.
* Ignoring health checks.
* Exposing unnecessary ports.
* Using mutable Docker images in production.
* Depending on startup timing instead of health checks.

---

# 📚 Related Documents

* 03-tech-stack.md
* 07-database-standards.md
* 08-security.md
* 10-testing.md
* 11-deployment.md

---

# 🚀 Future Improvements

Future versions may include:

* Kubernetes deployment guidelines
* Docker Swarm support
* Multi-stage build optimization
* Container vulnerability scanning
* Service mesh integration
* Multi-architecture image builds
* Automated image publishing

---

# 📝 Summary

The ONBP Docker Standards establish a consistent containerized environment for development and production.

By standardizing services, networking, volumes, health checks, security practices, and deployment workflows, ONBP enables developers to build, test, and deploy applications with confidence and consistency across different environments.

Docker is the foundation of ONBP's reproducible development experience.

---

## 📜 Decision Log

| Version | Date       | Description                       |
| ------- | ---------- | --------------------------------- |
| v0.1    | 2026-07-15 | Initial Docker Standards Document |
