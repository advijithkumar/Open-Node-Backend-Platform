# 📖 ONBP Glossary

> **Purpose:** Define the common technical terms, abbreviations, and concepts used throughout the Open Node Backend Platform (ONBP) documentation.

---

# 🎯 Purpose

The ONBP Glossary serves as a central reference for technical terminology used across the project.

Its goals are to:

* Help new contributors understand documentation.
* Standardize terminology.
* Reduce ambiguity.
* Support learning and knowledge sharing.

Terms are listed alphabetically for quick reference.

---

# A

## API (Application Programming Interface)

A set of rules that allows software systems to communicate with each other.

---

## API Gateway

A service that acts as the entry point for API requests, handling routing, authentication, rate limiting, and monitoring.

---

## Authentication (AuthN)

The process of verifying the identity of a user or system.

Example:

* Username and password
* OAuth login
* BetterAuth session

---

## Authorization (AuthZ)

The process of determining what an authenticated user is allowed to access or perform.

---

# B

## Backup

A copy of application data that can be restored in case of failure or data loss.

---

## Branch

An independent line of development in Git.

Examples:

```text id="8a9q2w"
main
develop
feature/login
bugfix/api-error
```

---

## Build

The process of compiling, packaging, and preparing an application for execution or deployment.

---

# C

## Cache

Temporary storage used to improve application performance by reducing repeated computations or database queries.

Example:

Redis

---

## CI (Continuous Integration)

An automated process that builds and tests code whenever changes are committed.

---

## CD (Continuous Deployment / Continuous Delivery)

Automated deployment of tested applications to staging or production environments.

---

## Container

An isolated runtime environment that packages an application together with its dependencies.

Example:

Docker Container

---

## CORS (Cross-Origin Resource Sharing)

A browser security mechanism that controls which websites can access an API.

---

## CRUD

The four basic database operations:

* Create
* Read
* Update
* Delete

---

# D

## Database Migration

A version-controlled change to the database schema.

---

## Deployment

The process of releasing an application to a server or production environment.

---

## Docker

An open-source platform used to build, package, and run applications in containers.

---

## DTO (Data Transfer Object)

An object used to transfer structured data between application layers or across APIs.

---

# E

## Endpoint

A URL exposed by an API.

Example:

```text id="fmkhbk"
/api/v1/users
```

---

## Environment Variable

A configuration value provided outside the application code.

Example:

```text id="hfjlwm"
DATABASE_URL
NODE_ENV
REDIS_URL
```

---

# F

## Foreign Key

A database column that references the primary key of another table, establishing a relationship.

---

# G

## Git

A distributed version control system used to track source code changes.

---

## GitHub Actions

A CI/CD platform for automating builds, tests, and deployments.

---

# H

## Health Check

A lightweight endpoint used to verify that an application or service is running correctly.

Example:

```text id="jv1eqi"
/health
```

---

## HTTP

HyperText Transfer Protocol, the standard communication protocol for web applications.

---

## HTTPS

A secure version of HTTP that encrypts communication using TLS.

---

# I

## Infrastructure as Code (IaC)

Managing servers and infrastructure using code instead of manual configuration.

Examples:

* Terraform
* OpenTofu

---

## Index

A database structure that improves query performance.

---

# J

## JSON (JavaScript Object Notation)

A lightweight format for exchanging structured data.

---

## JWT (JSON Web Token)

A compact token format used for securely transmitting authentication and authorization information.

---

# L

## Load Balancer

A service that distributes incoming traffic across multiple application instances.

---

## Logging

Recording application events for monitoring, debugging, and auditing.

---

# M

## Migration

A version-controlled database schema update.

---

## Middleware

Software that executes between an incoming request and the application logic.

Examples:

* Authentication
* Logging
* Validation

---

## MinIO

An open-source object storage server compatible with the Amazon S3 API.

---

## Monitoring

Collecting system metrics and health information to observe application performance.

---

# N

## Nginx

A high-performance web server and reverse proxy used to route traffic to backend services.

---

## Node.js

A JavaScript runtime built on the V8 engine for building server-side applications.

---

# O

## Observability

The ability to understand the internal state of a system through logs, metrics, and traces.

---

## ORM (Object-Relational Mapping)

A tool that maps database tables to programming language objects.

Example:

Prisma ORM

---

# P

## PostgreSQL

An open-source relational database management system used as the standard database for ONBP.

---

## Prisma

An open-source ORM used for database access, schema management, and migrations.

---

## Pull Request (PR)

A request to merge changes from one Git branch into another after review.

---

# R

## Rate Limiting

A mechanism that restricts how many requests a client can make within a specific time period.

---

## RBAC (Role-Based Access Control)

An authorization model where permissions are assigned to roles rather than individual users.

---

## Redis

An in-memory data store used for caching, sessions, queues, and rate limiting.

---

## Repository Pattern

A software design pattern that separates business logic from database access.

---

## Reverse Proxy

A server that receives client requests and forwards them to backend services.

Example:

Nginx

---

# S

## Scalability

The ability of a system to handle increased workload efficiently.

---

## Seed Data

Initial data inserted into a database for development or testing.

---

## Service

A layer responsible for implementing business logic.

---

## Session

A mechanism for maintaining user authentication across multiple requests.

---

## Swagger (OpenAPI)

A standard for documenting and exploring REST APIs through an interactive interface.

---

# T

## Transaction

A group of database operations that either all succeed or all fail.

---

## TLS (Transport Layer Security)

The cryptographic protocol that secures HTTPS connections.

---

# U

## UUID (Universally Unique Identifier)

A globally unique identifier commonly used as a primary key in distributed systems.

---

# V

## Validation

The process of checking whether input data meets defined rules before processing.

---

## Versioning

Managing changes to APIs or software using version numbers.

Example:

```text id="k2sw0x"
v1
v2
v3
```

---

# W

## Webhook

An HTTP callback that allows one application to notify another when an event occurs.

---

# X

## XSS (Cross-Site Scripting)

A security vulnerability where malicious scripts are injected into web pages.

---

# Z

## Zero Downtime Deployment

A deployment strategy that updates an application without interrupting service availability.

---

## Zod

A TypeScript-first schema validation library used in ONBP for validating request data.

---

# 📚 Related Documents

* 03-tech-stack.md
* 05-coding-standards.md
* 06-api-standards.md
* 08-security.md
* 10-testing.md

---

# 📝 Summary

The ONBP Glossary provides a centralized reference for technical terms used throughout the project.

By maintaining a shared vocabulary, contributors can better understand documentation, communicate effectively, and follow ONBP's engineering standards with confidence.

The glossary should be updated whenever new concepts, technologies, or architectural patterns are introduced into the platform.

---

## 📜 Decision Log

| Version | Date       | Description               |
| ------- | ---------- | ------------------------- |
| v0.1    | 2026-07-15 | Initial Glossary Document |
