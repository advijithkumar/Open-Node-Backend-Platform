# 📝 User Registration Flow

User registration creates both a business identity within ONBP and an authentication identity within Better Auth.

Although both records represent the same person, each system owns its respective data.

---

# 🎯 Objectives

The registration process should:

* Create a new ONBP business user.
* Create a corresponding Better Auth user.
* Securely store authentication credentials.
* Verify the user's email address.
* Maintain consistency between both domains.

---

# 🔄 Registration Workflow

```text
               Client
                  │
                  ▼
        POST /auth/register
                  │
                  ▼
          Better Auth API
                  │
      Validate Registration Data
                  │
                  ▼
        Create Authentication User
                  │
                  ▼
        Hash User Password
                  │
                  ▼
        Create Authentication Account
                  │
                  ▼
         Create ONBP Business User
                  │
                  ▼
      Send Verification Email
                  │
                  ▼
          Return Success Response
```

---

# 📦 Registration Data

Typical registration fields include:

```text
firstName
lastName
username
email
password
confirmPassword
```

Only business-related information is stored inside the ONBP `users` table.

Authentication credentials remain under Better Auth.

---

# 🔐 Password Handling

Passwords must never be stored by ONBP.

Better Auth is responsible for:

* Password hashing
* Password verification
* Password reset
* Password updates
* Password security policies

ONBP should never directly access password hashes.

---

# ✉️ Email Verification

After successful registration:

1. Better Auth generates a verification token.
2. A verification email is sent.
3. The user confirms ownership of the email address.
4. Better Auth marks the authentication identity as verified.

ONBP may choose to restrict certain business operations until email verification is complete.

---

# 🔗 Relationship Creation

During registration both systems become linked.

```text
ONBP.users
      │
      │
      ▼
Better Auth.user
      │
      ├── account
      ├── verification
      └── session
```

The relationship should remain consistent throughout the user's lifecycle.

---

# ⚠️ Transaction Strategy

Registration should be treated as a single logical operation.

If any critical step fails:

* No partial user should remain.
* Authentication records should not become orphaned.
* Business user records should remain consistent.

Future implementations may use database transactions or compensating actions to maintain consistency.

---

# 🚫 Avoid

* Creating duplicate users.
* Storing passwords inside ONBP.
* Allowing partially completed registrations.
* Ignoring failed email verification.
* Mixing authentication logic into business modules.

---

# 📜 Design Principle

> Registration creates both a business identity and an authentication identity, while preserving a clear separation of responsibilities between ONBP and Better Auth.
