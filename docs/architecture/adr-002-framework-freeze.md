# Architecture Decision Record 002: Framework Freeze and Business Development Phase

## Status
Accepted

## Date
2026-07-26

---

## Context
The ONBP Core Framework has achieved architectural stability with the release of version 0.1. Continuing to introduce new abstractions, loaders, or core managers increases complexity without resolving real-world application needs. To ensure production readiness, the framework must transition into a stable phase while development effort shifts towards building out the ecosystem.

---

## Decision
We freeze the ONBP Core Framework for Version 0.1. Development priorities will now focus on creating official plugins, business modules, and reference applications.

### 1. Scope of the Freeze
The freeze applies to all core managers, loaders, generator templates, and framework architecture. Specifically, no changes may be made to:
- Kernel and Lifecycle Manager
- Dependency Injection Container
- Module Manager and Plugin Manager
- Provider Manager and Router Manager
- Discovery Service and CLI generator templates

### 2. Allowed Framework Changes
Only the following maintenance tasks are permitted:
- Critical bug fixes and security vulnerability resolutions.
- Core performance improvements (e.g., memory optimization, faster scans).
- Inline or configuration documentation updates.
- Minor developer experience (DX) adjustments that do not alter public interfaces.

### 3. Forbidden Architectural Changes
- Introducing new core framework services or global managers.
- Introducing new infrastructure loaders or routing layers.
- Restructuring the lifecycle sequences (`register`, `boot`, `shutdown`).
- Redesigning CLI command interfaces or core generator architectures.

### 4. Future Expansion Policy
- Any capabilities or adapters found missing during ecosystem module/app development must be evaluated.
- Core changes require explicit, documented architecture reviews and version bumps.

---

## Consequences
- The framework core becomes a highly stable dependency, minimizing regression risks for consumer applications.
- Ecosystem components (e.g., PostgreSQL plugin, Redis plugin, Users module) can be developed against a frozen, predictable SDK.
