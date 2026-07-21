# 🔒 Security Principles

Authentication security is a shared responsibility between Better Auth and ONBP.

---

# Authentication Security

Better Auth is responsible for:

* Password hashing
* Secure session generation
* Session validation
* Email verification
* OAuth security
* Password reset

---

# ONBP Security

ONBP is responsible for:

* Authorization
* Business rules
* Input validation
* API security
* Audit logging
* Rate limiting
* Data protection

---

# Security Best Practices

* Never store plain-text passwords.
* Always use HTTPS in production.
* Enable secure cookies.
* Rotate secrets regularly.
* Validate every request.
* Log authentication events.
* Minimize exposed user information.
* Apply least-privilege authorization.

---

# Avoid

* Trusting client-side validation.
* Logging secrets or tokens.
* Hardcoding credentials.
* Exposing internal authentication details.
* Sharing authentication secrets across services.

---

# Security Philosophy

Security is enforced in layers.

Authentication, authorization, validation, and auditing work together to protect the platform.
