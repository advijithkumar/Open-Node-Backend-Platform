# 🌐 OAuth & Social Login

ONBP supports modern authentication providers through Better Auth.

External identity providers authenticate users, while ONBP continues to own business identity and authorization.

---

# 🎯 Objectives

The OAuth architecture should:

* Simplify user registration.
* Reduce password management.
* Support enterprise identity providers.
* Maintain ONBP as the source of truth for business identity.

---

# 🔄 OAuth Workflow

```text
          Client
             │
             ▼
     Google / GitHub
             │
             ▼
       Better Auth
             │
             ▼
 Authentication User
             │
             ▼
   ONBP Business User
             │
             ▼
     Create Session
             │
             ▼
       Authenticated
```

---

# Supported Providers

Future providers may include:

* Google
* GitHub
* Microsoft
* Apple
* Discord
* LinkedIn
* GitLab
* Facebook

---

# Design Principle

OAuth providers authenticate the user.

ONBP determines the user's business identity.
