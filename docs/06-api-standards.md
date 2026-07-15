# 🌐 ONBP API Standards

> **Purpose:** Define the official API design standards, conventions, and best practices for the Open Node Backend Platform (ONBP).

---

# 🎯 Purpose

The ONBP API Standards define how REST APIs should be designed, implemented, documented, and maintained across every ONBP project.

A consistent API design provides:

* Predictable behavior
* Easier frontend integration
* Better developer experience
* Simplified testing
* Improved maintainability
* Long-term scalability

Every API developed within ONBP should follow these standards unless an Architecture Decision Record (ADR) documents an approved exception.

---

# 🌍 API Design Philosophy

ONBP APIs should be:

* Simple
* Consistent
* Predictable
* Stateless
* Secure
* Versioned
* Well documented
* Easy to consume

The API should be understandable without requiring knowledge of the internal implementation.

---

# 🏛️ REST Principles

Every ONBP API should follow REST principles.

Resources should be represented as nouns.

Examples:

```text
/users
/products
/orders
/invoices
/vehicles
```

Avoid verbs in endpoint names.

❌ Avoid

```text
/createUser
/getUsers
/deleteProduct
```

✅ Prefer

```text
POST   /users
GET    /users
DELETE /users/{id}
```

---

# 🌐 API Versioning

Every public API should include a version.

Example:

```text
/api/v1/users
/api/v1/products
/api/v1/orders
```

Future versions:

```text
/api/v2/users
```

Versioning allows improvements without breaking existing clients.

---

# 📡 HTTP Methods

| Method | Purpose                    |
| ------ | -------------------------- |
| GET    | Retrieve resources         |
| POST   | Create resources           |
| PUT    | Replace resources          |
| PATCH  | Partially update resources |
| DELETE | Remove resources           |

Use each method according to its intended purpose.

---

# 🏷️ URL Naming

Use:

* lowercase
* plural resource names
* hyphens when necessary

Examples:

```text
/users
/user-roles
/inventory-items
```

Avoid:

```text
/User
/getAllUsers
/UserList
```

---

# 📄 Request Format

Request body should use JSON.

Example:

```json
{
  "name": "John Doe",
  "email": "john@example.com"
}
```

Validate every request before processing.

---

# 📤 Standard Response Format

Every successful response should follow the same structure.

```json
{
  "success": true,
  "message": "Request completed successfully.",
  "data": {},
  "meta": {}
}
```

Fields:

| Field   | Purpose                    |
| ------- | -------------------------- |
| success | Indicates operation result |
| message | Human-readable message     |
| data    | Response payload           |
| meta    | Additional metadata        |

---

# ❌ Error Response Format

Error responses should also be consistent.

```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": [
    {
      "field": "email",
      "message": "Email is required."
    }
  ]
}
```

Do not expose stack traces or internal implementation details in production.

---

# 📊 HTTP Status Codes

| Code | Meaning               |
| ---- | --------------------- |
| 200  | OK                    |
| 201  | Created               |
| 204  | No Content            |
| 400  | Bad Request           |
| 401  | Unauthorized          |
| 403  | Forbidden             |
| 404  | Not Found             |
| 409  | Conflict              |
| 422  | Validation Error      |
| 500  | Internal Server Error |

Use the most appropriate status code for each response.

---

# 🔍 Filtering

Filtering should use query parameters.

Example:

```text
GET /users?status=active
GET /products?category=electronics
```

---

# 📑 Pagination

Large datasets should support pagination.

Example:

```text
GET /users?page=1&limit=20
```

Response metadata:

```json
{
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 120,
    "totalPages": 6
  }
}
```

---

# 🔃 Sorting

Sorting should use query parameters.

Example:

```text
GET /users?sort=name
GET /orders?sort=-createdAt
```

A leading `-` indicates descending order.

---

# 🔎 Searching

Search operations should use a dedicated query parameter.

Example:

```text
GET /users?search=john
```

Avoid creating separate endpoints solely for basic text search.

---

# 🔐 Authentication

Protected endpoints must require authentication.

Example:

```text
Authorization: Bearer <token>
```

Authentication should be handled by the platform middleware, not individual controllers.

---

# ✅ Validation

Every request must be validated before reaching business logic.

Validation should include:

* Required fields
* Data types
* Length constraints
* Format checks
* Business rules where appropriate

ONBP recommends using **Zod** for validation.

---

# 📚 API Documentation

Every API should be documented using OpenAPI (Swagger).

Documentation should include:

* Endpoint description
* Request schema
* Response schema
* Authentication requirements
* Status codes
* Example requests
* Example responses

Undocumented APIs should not be considered production-ready.

---

# 📂 Endpoint Organization

Group endpoints by resource.

Example:

```text
/users
/users/{id}

/products
/products/{id}

/orders
/orders/{id}
```

Avoid deeply nested URLs unless they clearly represent a hierarchical relationship.

---

# 🧪 API Testing

Every endpoint should include:

* Success test
* Validation test
* Authentication test
* Authorization test
* Error handling test

Testing should be automated where possible.

---

# 🔒 Security Guidelines

APIs should:

* Validate input
* Sanitize user data
* Use HTTPS in production
* Limit request rates
* Return safe error messages
* Protect sensitive resources

Never trust client input.

---

# 🚫 Avoid

* Verbs in URLs
* Inconsistent response formats
* Mixed naming conventions
* Returning raw database errors
* Skipping validation
* Ignoring HTTP status codes
* Exposing internal implementation details

---

# 📚 Related Documents

* 02-architecture.md
* 03-tech-stack.md
* 05-coding-standards.md
* 07-database-standards.md
* 08-security.md

---

# 🚀 Future Improvements

Future versions may include:

* GraphQL guidelines
* WebSocket API standards
* API deprecation policy
* Rate limiting strategy
* Idempotency guidelines
* API performance recommendations

---

# 📝 Summary

The ONBP API Standards ensure that every API follows a consistent design, making applications easier to develop, document, test, and integrate.

By standardizing endpoint naming, request and response formats, validation, authentication, and documentation, ONBP delivers a predictable developer experience across all projects built on the platform.

---

## 📜 Decision Log

| Version | Date       | Description                    |
| ------- | ---------- | ------------------------------ |
| v0.1    | 2026-07-15 | Initial API Standards Document |
