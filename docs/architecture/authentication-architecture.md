# 🔐 ONBP Authentication Architecture

> **Purpose:** Define the authentication architecture, responsibilities, data ownership, and integration strategy for the Open Node Backend Platform (ONBP).

---

# 🎯 Purpose

Authentication is responsible for verifying a user's identity and establishing a trusted session.

ONBP separates **business identity** from **authentication** to keep the platform modular, maintainable, and independent of any specific authentication provider.

This document defines the official authentication architecture used throughout ONBP.

---

# 🏛️ Core Principle

> **Business Identity is owned by ONBP. Authentication is owned by Better Auth.**

This principle ensures that authentication can evolve independently without affecting business data.

---

# 🎯 Goals

The authentication architecture should:

* Separate business data from authentication data.
* Allow authentication providers to be replaced with minimal impact.
* Centralize business identity within ONBP.
* Support modern authentication methods.
* Enable secure, scalable, and maintainable authentication.

---

# 🧭 Responsibilities

## ONBP Responsibilities

ONBP owns all business-related identity information.

Examples include:

* User profile
* Username
* Email
* Roles
* Permissions
* Organizations
* Departments
* Business relationships
* Soft deletion
* Audit fields

ONBP is the source of truth for business identity.

---

## Better Auth Responsibilities

Better Auth owns authentication-related information.

Examples include:

* Password hashing
* Login
* Logout
* Sessions
* OAuth providers
* Email verification
* Password reset
* Passkeys
* Authentication tokens

Better Auth is the source of truth for authentication.

---

# 📌 Design Philosophy

Authentication should never contain business logic.

Business modules should never implement authentication logic.

Each system owns its own responsibility and communicates through well-defined interfaces.

---

# 📚 Related Documents

* 07-database-standards.md
* 08-security.md
* 11-deployment.md
