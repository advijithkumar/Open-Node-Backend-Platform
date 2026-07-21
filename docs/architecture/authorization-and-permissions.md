# 🛡️ Authorization & Permissions

Authentication confirms **who the user is**.

Authorization determines **what the user is allowed to do**.

Authentication is handled entirely by Better Auth, while authorization is managed exclusively by ONBP.

---

# 🎯 Objectives

The authorization system should:

* Enforce business rules.
* Protect application resources.
* Support Role-Based Access Control (RBAC).
* Support fine-grained permissions.
* Allow future extension to Attribute-Based Access Control (ABAC).

---

# 🔄 Authorization Workflow

```text
              Client Request
                     │
                     ▼
          Better Auth Validates Session
                     │
                     ▼
        Load ONBP Business User
                     │
                     ▼
          Load Roles & Permissions
                     │
                     ▼
         Check Required Permission
              ┌──────────────┐
              │              │
          Denied         Allowed
              │              │
              ▼              ▼
       Return 403       Execute Request
```

---

# 👤 User Identity

Every authenticated request is associated with one ONBP business user.

```text
Authentication User
        │
        ▼
ONBP Business User
        │
        ▼
Assigned Roles
        │
        ▼
Granted Permissions
```

Business authorization always begins with the ONBP user.

---

# 👥 Roles

Roles group related permissions.

Examples:

```text
Administrator
Manager
Employee
Customer
Guest
```

A user may be assigned one or more roles depending on business requirements.

---

# 🔑 Permissions

Permissions define specific actions within the platform.

Examples:

```text
users.read
users.create
users.update
users.delete

roles.assign
inventory.update
orders.approve
reports.export
```

Permissions should remain granular and descriptive.

---

# 🏢 Business Ownership

Authorization data belongs entirely to ONBP.

ONBP owns:

* Roles
* Permissions
* Role assignments
* Organization access
* Department access
* Business rules

Better Auth must never manage business authorization.

---

# 🚫 Access Denied

If the required permission is missing:

* The request is rejected.
* HTTP 403 Forbidden is returned.
* Business logic is not executed.
* The event may be logged for auditing.

Authentication success does not imply authorization success.

---

# 🔮 Future Extensions

Future versions of ONBP may support:

* Role-Based Access Control (RBAC)
* Attribute-Based Access Control (ABAC)
* Policy-Based Access Control (PBAC)
* Multi-tenant authorization
* Organization-level permissions
* Resource ownership rules

The architecture should remain flexible enough to support these models.

---

# 🚫 Avoid

* Storing business roles inside Better Auth tables.
* Embedding permission checks directly in controllers.
* Hardcoding role names throughout the application.
* Granting permissions based solely on authentication status.

---

# 📜 Design Principle

> Better Auth determines **who** the user is.

> ONBP determines **what** the user can do.

This separation ensures authentication and authorization remain independent, scalable, and maintainable.
