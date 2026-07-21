# 🏗️ System Architecture

```text
                        Client
                  (Web / Mobile / API)
                           │
                           ▼
                    Express API (ONBP)
                           │
        ┌──────────────────┴──────────────────┐
        │                                     │
        ▼                                     ▼
 Business Layer                    Authentication Layer
      (ONBP)                          (Better Auth)
        │                                     │
        │                                     │
  ┌─────┴──────────────┐          ┌───────────┴────────────┐
  │                    │          │                        │
  ▼                    ▼          ▼                        ▼
Users              Roles      Accounts                Sessions
Permissions        Profile    Verification            OAuth
Organizations                 Passkeys
        │                                     │
        └──────────────────┬──────────────────┘
                           │
                           ▼
                      PostgreSQL
```

The ONBP API acts as the single entry point for all requests.

Business operations are handled by ONBP modules, while authentication is delegated to Better Auth.

Although both systems use the same PostgreSQL database, each owns a distinct set of tables and responsibilities.

---

# 🗂️ Database Ownership

The database is logically divided into two domains.

## ONBP Domain

These tables represent business entities and are fully managed by ONBP.

```text
users
roles
permissions
organizations
departments
employees
products
orders
inventory
...
```

These tables define **who the user is within the business** and how they interact with the platform.

---

## Better Auth Domain

These tables are managed exclusively by Better Auth.

```text
user
account
session
verification
passkey
```

These tables define **how the user authenticates**.

ONBP must never store passwords, authentication tokens, or session information in its own tables.

---

# 🔗 Relationship Between Domains

Business identity and authentication remain separate but connected.

```text
ONBP.users
      │
      │ 1 : 1
      ▼
BetterAuth.user
      │
      ├── account
      ├── session
      ├── verification
      └── passkey
```

The relationship ensures that authentication data can evolve independently while ONBP remains the source of truth for business identity.

Every authentication record ultimately belongs to exactly one ONBP user.
