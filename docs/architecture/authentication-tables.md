# 🗃️ Authentication Tables

Better Auth manages all authentication-related data independently from ONBP business data.

Authentication tables should never contain business-specific information such as roles, departments, products, organizations, or application-specific settings.

---

# 📋 Table Overview

| Table                  | Purpose                                      | Owned By    |
| ---------------------- | -------------------------------------------- | ----------- |
| `user`                 | Authentication identity                      | Better Auth |
| `account`              | Linked authentication providers              | Better Auth |
| `session`              | Active user sessions                         | Better Auth |
| `verification`         | Email verification and password reset tokens | Better Auth |
| `passkey` *(optional)* | WebAuthn / Passkey authentication            | Better Auth |

---

# 👤 user

Represents an authenticated identity managed by Better Auth.

Typical information includes:

* Authentication user ID
* Display name
* Authentication email
* Email verification status
* Profile image (if supported)

This table **does not** represent the ONBP business user.

Instead, it represents the identity used during authentication.

---

# 🔑 account

Stores credentials and external authentication providers.

Examples:

* Email & Password
* Google
* GitHub
* Microsoft
* Apple
* Discord

Each account belongs to exactly one authenticated user.

This table is responsible for storing provider-specific identifiers and authentication metadata.

Passwords and authentication secrets must never be stored inside ONBP business tables.

---

# 🎫 session

Stores authenticated user sessions.

Typical information includes:

* Session ID
* Session token
* Expiration time
* Last activity
* Associated authentication user

Sessions are created after successful authentication and destroyed during logout or expiration.

ONBP relies on these sessions to identify authenticated requests.

---

# ✅ verification

Stores temporary verification records.

Examples include:

* Email verification
* Password reset
* One-time verification tokens
* Account activation

Verification records should always expire automatically after a configurable duration.

Expired verification records should be removed periodically.

---

# 🔐 passkey (Optional)

Stores WebAuthn / Passkey credentials.

Future versions of ONBP may support passwordless authentication through Passkeys.

Typical information includes:

* Credential ID
* Public key
* Signature counter
* Device information

Passkeys provide stronger security while eliminating password management.

---

# 🔗 Relationship with ONBP

Authentication tables remain separate from business tables.

```text
                 ONBP
                  │
              users
                  │
                  │ 1 : 1
                  ▼
          Better Auth user
                  │
      ┌───────────┼────────────┐
      │           │            │
      ▼           ▼            ▼
   account     session    verification
                    │
                    ▼
                 passkey
```

Authentication records ultimately represent the same person managed by ONBP, while each system retains ownership of its own data.

---

# 📌 Ownership Rules

ONBP owns:

* Business identity
* Roles
* Permissions
* Organizations
* Employee information
* Customer information
* Audit fields

Better Auth owns:

* Passwords
* Authentication providers
* Sessions
* Verification tokens
* OAuth credentials
* Passkeys

Neither system should duplicate the responsibilities of the other.

---

# 🚫 Avoid

* Storing passwords in the ONBP `users` table.
* Storing business roles inside Better Auth tables.
* Duplicating business information across authentication tables.
* Allowing authentication tables to become the source of truth for business identity.
* Modifying Better Auth tables directly outside the supported API.

---

# 📜 Design Principle

> Authentication verifies identity.

> ONBP defines business identity.

These responsibilities remain independent to ensure modularity, maintainability, and long-term flexibility.
