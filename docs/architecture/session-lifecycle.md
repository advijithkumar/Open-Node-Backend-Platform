# 🎫 Session Lifecycle

A session represents an authenticated user's active connection to the platform.

Better Auth is solely responsible for creating, validating, renewing, and destroying sessions.

ONBP consumes authenticated session information but does not manage session storage directly.

---

# 🎯 Objectives

The session lifecycle should:

* Maintain authenticated user state.
* Securely identify each request.
* Support multiple active devices.
* Automatically expire inactive sessions.
* Protect against session hijacking.

---

# 🔄 Session Lifecycle

```text
               Login Successful
                      │
                      ▼
              Create Session
                      │
                      ▼
          Store Session Securely
                      │
                      ▼
         Client Sends Session Token
                      │
                      ▼
        Better Auth Validates Session
                      │
             ┌────────┴────────┐
             │                 │
         Invalid           Valid
             │                 │
             ▼                 ▼
     Authentication      Load ONBP User
          Failed               │
                               ▼
                     Continue Request
                               │
                               ▼
                     Session Expires
                               │
                               ▼
                      User Re-authenticates
```

---

# 📋 Session Information

Typical session information includes:

```text
Session ID
User ID
Session Token
Created At
Expires At
Last Activity
```

Additional information may include:

* Device information
* Browser information
* IP address
* Geographic location (optional)

---

# 🔄 Session Validation

Every authenticated request follows the same process:

1. Client sends the session token.
2. Better Auth validates the session.
3. Session expiration is checked.
4. Associated authentication user is identified.
5. ONBP loads the corresponding business user.
6. The request continues.

If validation fails, the request is rejected.

---

# ⏳ Session Expiration

Sessions should expire automatically after a configurable period.

Possible expiration strategies include:

* Fixed expiration
* Sliding expiration
* Idle timeout
* Maximum lifetime

The chosen strategy should balance security and user experience.

---

# 🚪 Logout

Logout immediately invalidates the active session.

```text
Client
   │
   ▼
POST /auth/logout
   │
   ▼
Better Auth
   │
   ▼
Delete Session
   │
   ▼
Return Success
```

Logout affects only the targeted session unless global logout is explicitly requested.

---

# 📱 Multiple Devices

A user may maintain multiple active sessions simultaneously.

Example:

```text
Desktop
Laptop
Mobile
Tablet
```

Each device maintains its own independent session.

Revoking one session should not automatically terminate the others unless requested.

---

# 🔒 Session Security

Recommended practices:

* Use secure, random session tokens.
* Transmit sessions only over HTTPS.
* Store tokens securely.
* Expire inactive sessions.
* Rotate session tokens when appropriate.
* Revoke compromised sessions immediately.

Session identifiers should never be predictable.

---

# 🚫 Avoid

* Storing session data in ONBP business tables.
* Sharing session tokens between users.
* Logging session tokens.
* Using excessively long session lifetimes.
* Trusting expired or revoked sessions.

---

# 📜 Design Principle

> Authentication establishes trust. Sessions maintain that trust. Better Auth owns the complete session lifecycle, while ONBP focuses on business operations performed by authenticated users.
