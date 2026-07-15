# 🧪 ONBP Testing Standards

> **Purpose:** Define the official testing strategy, testing standards, tools, and best practices for the Open Node Backend Platform (ONBP).

---

# 🎯 Purpose

Testing is an essential part of software development.

Every feature developed in ONBP should be verified before it is merged into the project.

The goals of testing are to:

* Improve software quality.
* Prevent regressions.
* Detect bugs early.
* Increase developer confidence.
* Support safe refactoring.
* Ensure production reliability.

Testing is not optional—it is part of the development process.

---

# 🌍 Testing Philosophy

ONBP follows these principles:

* Test early.
* Test continuously.
* Automate whenever possible.
* Keep tests independent.
* Tests should be fast.
* Tests should be repeatable.
* A failing test should clearly identify the problem.

---

# 🏛️ Testing Pyramid

ONBP follows the Testing Pyramid.

```text
                 End-to-End Tests
                       ▲
                Integration Tests
                       ▲
                  Unit Tests
```

Priority:

1. Many Unit Tests
2. Fewer Integration Tests
3. Minimal End-to-End Tests

---

# 🧰 Official Testing Stack

| Category                | Standard             |
| ----------------------- | -------------------- |
| Test Runner             | Vitest               |
| API Testing             | Supertest            |
| Mocking                 | Vitest Mock          |
| Code Coverage           | V8 Coverage (Vitest) |
| Manual API Testing      | Swagger UI / Bruno   |
| Load Testing (Optional) | k6                   |

All selected tools are free and open source.

---

# 📂 Test Directory Structure

```text
tests/
├── unit/
├── integration/
├── e2e/
├── fixtures/
├── mocks/
├── helpers/
└── README.md
```

Individual modules may also include local test folders.

Example:

```text
users/
├── controller/
├── service/
├── repository/
├── tests/
```

---

# 🧪 Unit Testing

Unit tests verify a single function, class, or module in isolation.

Examples:

* Utility functions
* Services
* Validators
* Business rules
* Helper functions

Unit tests should:

* Run quickly.
* Not require a database.
* Not require network access.
* Be deterministic.

---

# 🔗 Integration Testing

Integration tests verify that multiple components work together.

Examples:

* API + Database
* Service + Repository
* Authentication Flow
* File Storage

Integration tests should use a dedicated test database.

---

# 🌐 API Testing

Every endpoint should be tested.

Recommended checks:

* Successful request
* Validation failure
* Authentication
* Authorization
* Error handling
* Pagination
* Filtering
* Sorting

APIs should be tested automatically using Supertest.

---

# 🚀 End-to-End Testing

End-to-End (E2E) tests simulate real user workflows.

Examples:

```text
Login
    ↓
Create Customer
    ↓
Create Order
    ↓
Generate Invoice
    ↓
Logout
```

Use E2E tests for critical business processes.

---

# 🗄️ Database Testing

Database tests should verify:

* Migrations
* Relationships
* Constraints
* Transactions
* Repository methods
* Soft deletes
* Seed data

Never run destructive tests against a production database.

---

# 🎭 Mocking Strategy

Mock external dependencies such as:

* Email services
* Payment gateways
* External APIs
* Cloud storage
* Message queues

Avoid mocking the code being tested.

---

# 🌱 Test Data

Test data should:

* Be predictable.
* Be isolated.
* Be reusable.
* Never contain production information.

Use fixtures and factories where appropriate.

---

# 📊 Code Coverage

Code coverage helps identify untested code.

Recommended minimum targets:

| Component    | Coverage |
| ------------ | -------: |
| Services     |      90% |
| Controllers  |      80% |
| Utilities    |      95% |
| Repositories |      80% |

Coverage is a guide, not a substitute for meaningful tests.

---

# 🔄 Continuous Testing

Tests should run:

* Before every pull request.
* During Continuous Integration (CI).
* Before production releases.

A failing test should block the merge until it is resolved.

---

# ⚙️ Test Environment

The test environment should be isolated from development and production.

Requirements:

* Separate database
* Separate environment variables
* Automatic cleanup
* Deterministic configuration

---

# 📈 Performance Testing

Performance testing is recommended for:

* Authentication
* File uploads
* Search endpoints
* High-volume APIs
* Reporting modules

Optional tool:

```text
k6
```

---

# 🔐 Security Testing

Verify:

* Authentication
* Authorization
* Input validation
* Rate limiting
* SQL injection prevention
* XSS protection

Security tests should be included in regression testing.

---

# 📋 Test Naming

Test names should clearly describe expected behavior.

Good examples:

```text
should_create_user_successfully

should_return_404_when_user_not_found

should_reject_invalid_email
```

Avoid vague names such as:

```text
test1

check

example
```

---

# 🚫 Avoid

* Skipping tests for critical features.
* Tests that depend on execution order.
* Shared mutable test state.
* Using production data.
* Ignoring failing tests.
* Excessive mocking.
* Slow unit tests.

---

# 📚 Related Documents

* 05-coding-standards.md
* 06-api-standards.md
* 07-database-standards.md
* 08-security.md
* 11-deployment.md

---

# 🚀 Future Improvements

Future versions may include:

* Visual regression testing
* Contract testing
* Chaos engineering
* Mutation testing
* Distributed load testing
* Automated accessibility testing
* Performance benchmarking

---

# 📝 Summary

The ONBP Testing Standards establish a comprehensive testing strategy covering unit, integration, API, database, security, and end-to-end testing.

By adopting automated, repeatable, and reliable testing practices, ONBP ensures that every application remains stable, maintainable, and ready for production deployments.

Testing is a core engineering practice and an essential part of the ONBP development lifecycle.

---

## 📜 Decision Log

| Version | Date       | Description                        |
| ------- | ---------- | ---------------------------------- |
| v0.1    | 2026-07-15 | Initial Testing Standards Document |
