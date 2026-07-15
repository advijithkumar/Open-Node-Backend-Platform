# 🔐 ONBP Security Standards

> **Purpose:** Define the official security standards, policies, and best practices for the Open Node Backend Platform (ONBP).

---

# 🎯 Purpose

Security is a fundamental design principle of ONBP, not an optional feature.

This document establishes the security requirements that every ONBP application should follow to protect users, data, infrastructure, and services.

The objectives are to:

- Protect sensitive information.
- Prevent common web application attacks.
- Enforce secure development practices.
- Reduce operational risks.
- Support secure deployments.

---

# 🌍 Security Philosophy

ONBP follows these principles:

- Secure by default.
- Least privilege.
- Defense in depth.
- Validate all input.
- Encrypt sensitive data.
- Never trust client input.
- Keep dependencies updated.
- Security is everyone's responsibility.

---

# 🔑 Authentication

Authentication verifies the identity of a user or system.

ONBP standard:

| Component                   | Standard                     |
| --------------------------- | ---------------------------- |
| Authentication Library      | BetterAuth                   |
| Password Hashing            | Argon2 (preferred) or bcrypt |
| Multi-Factor Authentication | Optional                     |
| Session Management          | BetterAuth Sessions          |

Requirements:

- Never store plaintext passwords.
- Require strong passwords.
- Support secure password reset.
- Expire inactive sessions.

---

# 🛡️ Authorization

Authentication answers **who the user is**.

Authorization answers **what the user can do**.

ONBP recommends Role-Based Access Control (RBAC).

Example roles:

```text
Administrator

Manager

Employee

Viewer
```

Permissions should be checked on every protected operation.

---

# 🔒 Password Security

Passwords should:

- Be hashed before storage.
- Never be logged.
- Never be returned in API responses.
- Be compared using secure library functions.

Minimum recommendations:

- At least 12 characters.
- Encourage passphrases.
- Prevent reuse where practical.

---

# 🎟️ Session Management

Session security guidelines:

- Use secure cookies when applicable.
- Use HttpOnly cookies.
- Use Secure cookies in production.
- Set appropriate expiration times.
- Invalidate sessions after logout.

---

# 🧾 JWT Standards

If JWTs are used:

- Use strong signing algorithms.
- Keep expiration times reasonable.
- Rotate signing keys when necessary.
- Never store sensitive information inside tokens.

---

# ✅ Input Validation

Every request must be validated before reaching business logic.

Validate:

- Required fields
- Data types
- String lengths
- Number ranges
- Email formats
- UUIDs
- Dates
- Business rules

ONBP recommends **Zod** for request validation.

---

# 💉 SQL Injection Prevention

Never build SQL queries using string concatenation.

Prefer:

- Prisma ORM
- Parameterized queries

Never trust user input directly in database operations.

---

# 🖥️ Cross-Site Scripting (XSS)

Prevent XSS by:

- Escaping output where appropriate.
- Sanitizing untrusted HTML.
- Validating user input.
- Setting Content Security Policy (CSP) headers when applicable.

---

# 🔄 Cross-Site Request Forgery (CSRF)

For cookie-based authentication:

- Enable CSRF protection.
- Use anti-CSRF tokens.
- Validate request origins.

For token-based APIs, ensure secure token handling and origin validation where appropriate.

---

# 🌐 CORS Policy

Configure Cross-Origin Resource Sharing (CORS) explicitly.

Production recommendations:

- Allow only trusted origins.
- Restrict HTTP methods.
- Restrict custom headers.
- Disable wildcard origins in production.

---

# 🧱 HTTP Security Headers

Use security headers such as:

- Content-Security-Policy
- X-Content-Type-Options
- Referrer-Policy
- Permissions-Policy
- Strict-Transport-Security (HTTPS)
- X-Frame-Options

ONBP recommends using **Helmet** for Express applications.

---

# 🚦 Rate Limiting

Protect APIs against abuse.

Recommendations:

- Rate limit authentication endpoints.
- Rate limit public APIs.
- Block repeated abusive requests.
- Use Redis-backed rate limiting for distributed deployments.

---

# 📁 File Upload Security

Before accepting uploaded files:

- Validate file type.
- Validate file size.
- Generate safe filenames.
- Scan files for malware if required.
- Store uploads outside the application source directory.

Never trust the client-provided filename or MIME type alone.

---

# 🔐 Secrets Management

Secrets include:

- Database passwords
- API keys
- JWT secrets
- SMTP credentials
- Cloud storage credentials

Rules:

- Never commit secrets to Git.
- Store secrets in environment variables.
- Rotate secrets periodically in production.
- Restrict access to authorized personnel.

---

# ⚙️ Environment Variables

Sensitive configuration should be loaded from environment variables.

Examples:

```text
DATABASE_URL
REDIS_URL
BETTER_AUTH_SECRET
MINIO_ACCESS_KEY
MINIO_SECRET_KEY
```

Provide a `.env.example` file without real credentials.

---

# 📋 Logging & Auditing

Log important events such as:

- User login
- Failed login attempts
- Permission changes
- Password resets
- Critical system errors

Do not log:

- Passwords
- Authentication tokens
- API keys
- Personal secrets

---

# 🔒 Encryption

Use modern encryption algorithms.

Recommendations:

- TLS/HTTPS for data in transit.
- Strong hashing for passwords.
- Encrypt highly sensitive stored data where required by business needs.

---

# 🧩 Dependency Security

Third-party packages should:

- Come from trusted sources.
- Be updated regularly.
- Be scanned for known vulnerabilities.
- Be reviewed before adoption.

Remove unused dependencies.

---

# 🧪 Security Testing

Security testing should include:

- Authentication tests
- Authorization tests
- Input validation tests
- Rate limiting tests
- File upload tests
- Dependency vulnerability scans

Security testing should be part of the development lifecycle.

---

# 🚨 Incident Response

Prepare procedures for:

- Detecting security incidents.
- Containing affected systems.
- Recovering services.
- Investigating root causes.
- Communicating with stakeholders.
- Preventing recurrence.

---

# 💾 Backup & Recovery

Security includes reliable recovery.

Recommendations:

- Automated backups.
- Encrypted backup storage.
- Regular restore testing.
- Disaster recovery documentation.

---

# 🚫 Avoid

- Hardcoded secrets.
- Plaintext passwords.
- Disabled authentication.
- Unvalidated input.
- Exposed stack traces.
- Overly permissive CORS.
- Excessive user privileges.
- Ignoring security updates.

---

# 📚 Related Documents

- 03-tech-stack.md
- 05-coding-standards.md
- 06-api-standards.md
- 07-database-standards.md
- 09-docker.md

---

# 🚀 Future Improvements

Future versions may include:

- OAuth 2.0 integration guidelines
- OpenID Connect recommendations
- Multi-factor authentication standards
- Secrets management with Vault
- Security monitoring and alerting
- Zero Trust architecture guidance
- Security compliance checklists

---

# 📝 Summary

The ONBP Security Standards establish a secure-by-default foundation for every application built on the platform.

By following consistent practices for authentication, authorization, validation, secrets management, encryption, logging, and secure deployment, ONBP helps developers build applications that are resilient against common threats while remaining maintainable and scalable.

Security should be considered throughout the software development lifecycle—from design and implementation to deployment and ongoing maintenance.

---

## 📜 Decision Log

| Version | Date       | Description                         |
| ------- | ---------- | ----------------------------------- |
| v0.1    | 2026-07-15 | Initial Security Standards Document |
