# 🔑 Login Flow

The login process verifies a user's identity and establishes an authenticated session.

Unlike registration, login never creates business data. Its sole responsibility is to authenticate an existing identity and issue a secure session.

---

# 🎯 Objectives

The login process should:

* Verify user credentials.
* Create a secure authenticated session.
* Associate the session with the authenticated user.
* Return authentication information securely.
* Reject invalid authentication attempts.

---

# 🔄 Login Workflow

```text
                 Client
                    │
                    ▼
            POST /auth/login
                    │
                    ▼
             Better Auth API
                    │
        Validate Login Request
                    │
                    ▼
         Find Authentication User
                    │
                    ▼
         Verify Password / OAuth
                    │
          ┌─────────┴─────────┐
          │                   │
      Invalid             Valid
          │                   │
          ▼                   ▼
     Return Error      Create Session
                              │
                              ▼
                      Generate Session Token
                              │
                              ▼
                  Load ONBP Business Identity
                              │
                              ▼
                     Return Authenticated User
```

---

# 📦 Login Request

Typical login fields include:

```text
email
password
```

Future authentication methods may include:

```text
Google OAuth
GitHub OAuth
Microsoft OAuth
Apple Sign-In
Passkeys (WebAuthn)
Magic Links
```

---

# 🔐 Authentication Process

Better Auth is responsible for:

* Validating credentials.
* Verifying password hashes.
* Checking email verification status.
* Creating authenticated sessions.
* Issuing secure session tokens.

ONBP does not perform password verification.

---

# 👤 Business Identity Resolution

After successful authentication:

1. Better Auth identifies the authenticated user.
2. The associated ONBP business user is located.
3. Business information is loaded.
4. The authenticated request continues through ONBP.

Authentication determines **who logged in**.

ONBP determines **what that user is allowed to do**.

---

# 🎫 Session Creation

A successful login creates a new authenticated session.

Each session contains information such as:

* Session identifier
* Expiration time
* Authentication user
* Device information (optional)
* IP address (optional)

Session management is handled entirely by Better Auth.

---

# ❌ Failed Login

Authentication fails when:

* Email does not exist.
* Password is incorrect.
* Account is disabled.
* Email verification is required.
* Authentication provider rejects the request.

Error responses should never reveal whether the email address exists in the system.

---

# 🚫 Avoid

* Comparing passwords inside ONBP.
* Returning password hashes.
* Exposing authentication internals.
* Revealing whether a specific email exists.
* Creating business records during login.

---

# 📜 Design Principle

> Login authenticates an existing identity and creates a secure session. Business authorization begins only after successful authentication.
