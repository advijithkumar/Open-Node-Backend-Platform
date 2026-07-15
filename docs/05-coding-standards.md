# 📝 ONBP Coding Standards

> **Purpose:** Define the official coding standards, conventions, and engineering practices for the Open Node Backend Platform (ONBP).

---

# 🎯 Purpose

The ONBP Coding Standards establish a consistent approach to writing, organizing, and maintaining code across every project built with ONBP.

Consistency improves:

- Readability
- Maintainability
- Collaboration
- Code Reviews
- Long-term Scalability

Every contributor should follow these standards unless an Architecture Decision Record (ADR) documents an approved exception.

---

# 🌍 Coding Philosophy

ONBP follows these principles:

- Write code for humans first.
- Prefer clarity over cleverness.
- Keep functions small and focused.
- Avoid duplicate code.
- Design for reuse.
- Make code easy to test.
- Fail safely and predictably.
- Keep business logic separate from infrastructure.

---

# 📏 General Rules

- Use **TypeScript** for all production code.
- Enable **strict mode**.
- Avoid the `any` type whenever possible.
- Every file should have a single responsibility.
- Prefer composition over inheritance.
- Avoid unnecessary abstractions.
- Remove dead code before merging.

---

# 📂 File Naming

Use **kebab-case** for files and folders.

Examples:

```text
user.service.ts
auth.controller.ts
inventory.repository.ts
create-user.dto.ts
```

Avoid:

```text
UserService.ts
userService.ts
```

---

# 🏷️ Naming Conventions

| Item                 | Convention       | Example         |
| -------------------- | ---------------- | --------------- |
| Folder               | kebab-case       | user-profile    |
| File                 | kebab-case       | auth.service.ts |
| Class                | PascalCase       | UserService     |
| Interface            | PascalCase       | UserRepository  |
| Type                 | PascalCase       | LoginRequest    |
| Enum                 | PascalCase       | UserRole        |
| Function             | camelCase        | createUser      |
| Variable             | camelCase        | currentUser     |
| Constant             | UPPER_SNAKE_CASE | MAX_FILE_SIZE   |
| Environment Variable | UPPER_SNAKE_CASE | DATABASE_URL    |

---

# 📦 Import Order

Imports should follow a consistent order:

```text
1. Node.js built-in modules

2. Third-party packages

3. Internal packages

4. Relative imports

5. Types
```

Example:

```typescript
import fs from "node:fs";

import express from "express";

import { logger } from "@packages/logger";

import { UserService } from "../services/user.service";

import type { User } from "../types/user";
```

---

# 🧩 Function Design

Functions should:

- Perform one task.
- Be easy to understand.
- Have descriptive names.
- Return predictable results.
- Avoid hidden side effects.

Prefer:

```text
calculateTotal()

sendEmail()

createUser()
```

Instead of:

```text
process()

run()

execute()
```

---

# 🏛️ Class Design

Classes should follow the **Single Responsibility Principle**.

Example:

```text
UserService

↓

Handles user business logic only.
```

Avoid creating classes that perform multiple unrelated tasks.

---

# ⚠️ Error Handling

Never ignore errors.

Always:

- Catch expected exceptions.
- Return meaningful error messages.
- Log unexpected failures.
- Avoid exposing sensitive information.

Do not use empty `catch` blocks.

---

# 📋 Logging

Use structured logging with **Pino**.

Log:

- Application startup
- API requests
- Warnings
- Errors
- Security events

Do not log:

- Passwords
- Tokens
- API keys
- Sensitive personal information

---

# 🌐 API Response Format

Every API should return a consistent response structure.

Example:

```json
{
  "success": true,
  "message": "User created successfully.",
  "data": {},
  "meta": {}
}
```

Error responses should follow the same structure where practical.

---

# 🗄️ Database Access

Database access should occur only through the Repository layer.

Flow:

```text
Controller

↓

Service

↓

Repository

↓

Prisma

↓

PostgreSQL
```

Controllers must never communicate directly with the database.

---

# 🧪 Testing

Every feature should include appropriate tests.

Recommended:

- Unit Tests
- Integration Tests
- API Tests

Tests should be deterministic and independent.

---

# 🔒 Security Practices

Always:

- Validate input.
- Sanitize user data.
- Hash passwords.
- Protect secrets with environment variables.
- Follow the principle of least privilege.

Never hardcode secrets into source code.

---

# 📖 Documentation

Public classes and reusable modules should include documentation.

Complex logic should explain **why** it exists, not simply describe what the code already says.

---

# 🔄 Git Practices

- One feature per branch.
- Small, focused commits.
- Meaningful commit messages.
- Pull requests should be reviewed before merging.

Refer to:

- `docs/standards/git.md`
- `docs/standards/commits.md`
- `docs/standards/branching.md`

---

# 🚫 Avoid

- Long functions
- Duplicate logic
- Circular dependencies
- Hardcoded configuration
- Magic numbers
- Unused code
- Deep nesting
- Direct database access from controllers

---

# 📚 Related Documents

- 02-architecture.md
- 03-tech-stack.md
- 04-folder-structure.md
- 06-api-standards.md
- 08-security.md

---

# 🚀 Future Improvements

Future versions may include:

- ESLint rules
- Prettier configuration
- TypeScript style guide
- Performance guidelines
- Secure coding checklist
- AI-assisted code review recommendations

---

# 📝 Summary

The ONBP Coding Standards provide a consistent engineering approach for every project built on the platform.

Following these standards ensures that code remains readable, maintainable, secure, and easy to review, regardless of project size or contributor experience.

Consistency is a core value of ONBP and should guide every implementation decision.

---

## 📜 Decision Log

| Version | Date       | Description                       |
| ------- | ---------- | --------------------------------- |
| v0.1    | 2026-07-15 | Initial Coding Standards Document |
