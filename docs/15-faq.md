# ❓ ONBP Frequently Asked Questions (FAQ)

> **Purpose:** Provide answers to common questions about the Open Node Backend Platform (ONBP), its architecture, technologies, development process, and contribution guidelines.

---

# 🎯 Purpose

The FAQ helps developers quickly find answers to common questions without searching through the entire documentation.

It is intended for:

* New contributors
* Students
* Developers
* Maintainers
* Open-source contributors

This document should grow as the ONBP community expands.

---

# 📌 General Questions

## 1. What is ONBP?

ONBP (Open Node Backend Platform) is an open-source backend platform designed to provide a reusable, production-ready foundation for building modern business applications.

It focuses on:

* Scalability
* Security
* Maintainability
* Developer Experience
* Open-source technologies

---

## 2. Why was ONBP created?

Many projects repeatedly solve the same backend problems.

ONBP provides a common foundation so developers can focus on business features instead of rebuilding infrastructure.

---

## 3. Is ONBP a framework?

No.

ONBP is a backend platform and project foundation.

It combines architecture, standards, tooling, and reusable components rather than replacing Express or Node.js.

---

## 4. Who is ONBP for?

ONBP is suitable for:

* Students
* Backend developers
* Startups
* Freelancers
* Enterprise teams
* Open-source contributors

---

## 5. Is ONBP free?

Yes.

ONBP is designed around free and open-source software.

---

# 💻 Technology Questions

## 6. Why does ONBP use Node.js?

Node.js provides:

* High performance
* Large ecosystem
* Excellent TypeScript support
* Strong community adoption

---

## 7. Why TypeScript instead of JavaScript?

TypeScript offers:

* Static type checking
* Better IDE support
* Easier refactoring
* Fewer runtime errors
* Improved maintainability

---

## 8. Why PostgreSQL?

PostgreSQL is:

* Open source
* Reliable
* Feature-rich
* Highly scalable
* Widely used in production

---

## 9. Why Prisma?

Prisma provides:

* Type-safe database access
* Simple migrations
* Excellent developer experience
* Strong TypeScript integration

---

## 10. Why Redis?

Redis is used for:

* Caching
* Session storage
* Rate limiting
* Background jobs
* Temporary data

---

## 11. Why MinIO?

MinIO provides open-source object storage compatible with the Amazon S3 API.

It is ideal for storing:

* Images
* Documents
* Backups
* Attachments

---

## 12. Why Docker?

Docker ensures:

* Consistent development environments
* Simple deployment
* Service isolation
* Easy onboarding

---

# 🔐 Security Questions

## 13. Why is security documented before implementation?

Security is most effective when it is designed into the architecture rather than added after development.

---

## 14. Does ONBP support authentication?

Yes.

ONBP standardizes authentication using BetterAuth.

---

## 15. How are passwords stored?

Passwords should always be securely hashed using modern algorithms such as Argon2 or bcrypt.

Plaintext passwords must never be stored.

---

# 🧪 Development Questions

## 16. Does ONBP include testing?

Yes.

ONBP includes standards for:

* Unit testing
* Integration testing
* API testing
* Security testing
* End-to-end testing

---

## 17. Does every feature require tests?

Yes.

Features should include appropriate tests before they are considered complete.

---

## 18. Can I use another testing framework?

Yes, if there is a valid technical reason.

Any significant deviation should be documented in an Architecture Decision Record (ADR).

---

# 🏗️ Architecture Questions

## 19. Is ONBP monolithic or microservices?

The initial architecture is a modular monolith.

This keeps development simpler while allowing future evolution toward microservices if needed.

---

## 20. Can ONBP support multiple business applications?

Yes.

ONBP is intended to support applications such as:

* ERP
* CRM
* Inventory Management
* Transport Management
* HR Management
* Manufacturing Systems
* Hospital Management
* School Management

---

## 21. Does ONBP support REST APIs?

Yes.

REST is the official API architecture for the initial release.

Future versions may include GraphQL or gRPC support.

---

# 🚀 Deployment Questions

## 22. Can ONBP run locally?

Yes.

Every project should run using Docker Compose for local development.

---

## 23. Can ONBP be deployed to the cloud?

Yes.

It can be deployed to:

* Virtual Private Servers (VPS)
* Cloud virtual machines
* Self-hosted servers
* Kubernetes clusters (future roadmap)

---

## 24. Does ONBP require Docker?

Docker is the recommended standard because it ensures consistent environments, but alternative deployment methods may be supported in the future.

---

# 🤝 Contribution Questions

## 25. How can I contribute?

You can contribute by:

* Writing code
* Improving documentation
* Reporting bugs
* Writing tests
* Reviewing pull requests
* Suggesting features

See `13-contributing.md` for details.

---

## 26. Can beginners contribute?

Absolutely.

Improving documentation, fixing small issues, and asking thoughtful questions are valuable contributions.

---

# 📚 Documentation Questions

## 27. Where should I start?

Read the documents in this order:

1. README.md
2. 01-vision.md
3. 02-architecture.md
4. 03-tech-stack.md
5. Remaining documentation

This provides a gradual introduction to the platform.

---

## 28. Why are there so many documentation files?

Each document focuses on one topic.

This makes documentation easier to maintain, update, and navigate.

---

# 🔮 Future Questions

## 29. Will ONBP support plugins?

Plugin support is planned as a future enhancement after the core platform reaches stability.

---

## 30. Will ONBP support AI features?

Potential future enhancements include AI-assisted development tools, code generation, and intelligent project templates.

These features are not part of the initial release.

---

# 📬 Didn't Find Your Answer?

If your question is not covered:

* Check the project documentation.
* Search existing issues and discussions.
* Open a new issue or discussion.
* Contact the maintainers through the project's official communication channels.

Community feedback helps improve ONBP.

---

# 📚 Related Documents

* README.md
* 01-vision.md
* 03-tech-stack.md
* 13-contributing.md
* 14-glossary.md

---

# 📝 Summary

The ONBP FAQ provides quick answers to the most common questions about the platform, helping new contributors and users understand its goals, technologies, architecture, and development practices.

As ONBP evolves, this document should be updated regularly to reflect new features, architectural decisions, and community feedback.

---

## 📜 Decision Log

| Version | Date       | Description          |
| ------- | ---------- | -------------------- |
| v0.1    | 2026-07-15 | Initial FAQ Document |
