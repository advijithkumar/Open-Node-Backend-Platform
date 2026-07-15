# 🗄️ ONBP Database Standards

> **Purpose:** Define the official database design standards, schema conventions, migration strategy, and best practices for the Open Node Backend Platform (ONBP).

---

# 🎯 Purpose

The ONBP Database Standards define how databases should be designed, organized, maintained, and evolved across every ONBP project.

A standardized database design provides:

* Consistency
* Maintainability
* Better performance
* Easier collaboration
* Reliable migrations
* Scalable architecture

Every ONBP application should follow these standards unless an Architecture Decision Record (ADR) documents an approved exception.

---

# 🌍 Database Philosophy

ONBP adopts the following principles:

* Design for long-term maintenance.
* Normalize data where appropriate.
* Use clear and meaningful names.
* Prefer explicit relationships.
* Protect data integrity.
* Design with scalability in mind.
* Avoid database-specific hacks whenever possible.

The database is considered a core part of the platform architecture.

---

# 🏛️ Official Database Stack

| Component      | Standard           |
| -------------- | ------------------ |
| Database       | PostgreSQL         |
| ORM            | Prisma ORM         |
| Migration Tool | Prisma Migrate     |
| Seed Tool      | Prisma Seed        |
| Administration | pgAdmin or DBeaver |

PostgreSQL is the official relational database for ONBP.

---

# 📂 Database Organization

Every application should contain a dedicated Prisma directory.

```text
prisma/
├── schema.prisma
├── migrations/
├── seeds/
└── README.md
```

Purpose:

* Schema definition
* Database migrations
* Seed scripts
* Database documentation

---

# 🏷️ Naming Conventions

## Tables

Use:

* lowercase
* snake_case
* plural nouns

Examples:

```text
users
roles
permissions
products
purchase_orders
inventory_items
```

Avoid:

```text
User
UserTable
tbl_users
```

---

## Columns

Use:

* lowercase
* snake_case

Examples:

```text
first_name
last_name
phone_number
created_at
updated_at
```

Avoid:

```text
FirstName
PhoneNumber
```

---

## Primary Keys

Every table should use:

```text
id
```

ONBP recommends UUIDs as the primary key strategy.

Example:

```text
id UUID PRIMARY KEY
```

Advantages:

* Globally unique
* Better for distributed systems
* Avoids ID enumeration

---

# 🔗 Foreign Keys

Foreign keys should follow this convention:

```text
user_id
role_id
product_id
order_id
```

Avoid ambiguous names such as:

```text
uid
rid
owner
```

---

# 🕒 Standard Audit Fields

Every business table should include:

```text
id

created_at

updated_at

deleted_at

created_by

updated_by
```

Purpose:

* Track creation
* Track updates
* Support auditing
* Enable soft deletes

---

# 🗑️ Soft Delete Strategy

ONBP recommends soft deletes for business data.

Instead of removing records:

```sql
DELETE FROM users;
```

Update:

```text
deleted_at = CURRENT_TIMESTAMP
```

Benefits:

* Recovery
* Auditing
* Historical reporting
* Compliance

Reference data may still use hard deletes where appropriate.

---

# 🔄 Relationships

Use explicit foreign keys.

Relationship types:

* One-to-One
* One-to-Many
* Many-to-Many

Many-to-many relationships should use junction tables.

Example:

```text
users

roles

user_roles
```

Avoid storing arrays of IDs in relational tables.

---

# 📑 Constraints

Use database constraints whenever possible.

Examples:

* PRIMARY KEY
* FOREIGN KEY
* UNIQUE
* CHECK
* NOT NULL

Business rules should be enforced at both the application and database layers where appropriate.

---

# 📈 Indexing

Create indexes for:

* Foreign keys
* Frequently searched columns
* Frequently sorted columns
* Frequently filtered columns

Examples:

```text
email

created_at

status

user_id
```

Avoid excessive indexing because it increases write overhead.

---

# 🔒 Data Integrity

Always:

* Use transactions for multi-step operations.
* Define foreign keys.
* Validate input before writing to the database.
* Prevent orphaned records.

The database should protect itself against invalid data.

---

# 💾 Transactions

Use transactions when multiple operations must succeed or fail together.

Example:

```text
Create Order

↓

Create Order Items

↓

Update Inventory

↓

Create Payment

↓

Commit
```

If one step fails, the transaction should roll back.

---

# 🌱 Seed Data

Seed scripts should populate:

* Roles
* Permissions
* Default administrator
* Application settings
* Sample development data (optional)

Production data should never be included in seed files.

---

# 🔄 Migration Standards

Every schema change must be created through migrations.

Guidelines:

* One logical change per migration.
* Never modify an existing migration after it has been applied.
* Test migrations before production deployment.
* Keep migration names meaningful.

Example:

```text
20260715_create_users_table

20260716_add_roles_table

20260717_add_inventory_indexes
```

---

# 📊 Performance Guidelines

Recommendations:

* Avoid unnecessary joins.
* Select only required columns.
* Use pagination for large datasets.
* Monitor slow queries.
* Add indexes based on actual usage.
* Archive historical data when appropriate.

Performance optimization should be driven by measurement rather than assumptions.

---

# 🔐 Security Guidelines

Database credentials should:

* Be stored in environment variables.
* Never be committed to Git.
* Use least-privilege accounts.
* Be rotated periodically in production.

Sensitive data should be encrypted or hashed where appropriate.

Passwords must never be stored in plain text.

---

# 💽 Backup Strategy

Every production deployment should include:

* Automated backups
* Backup verification
* Restore testing
* Retention policy
* Disaster recovery plan

A backup is only useful if it can be restored successfully.

---

# 🧪 Database Testing

Database-related tests should verify:

* Migrations
* Constraints
* Relationships
* Transactions
* Repository methods
* Seed scripts

Testing should be part of the development workflow.

---

# 📚 Prisma Standards

Prisma models should:

* Match table names clearly.
* Define relationships explicitly.
* Use meaningful model names.
* Keep schema organized.
* Avoid duplicated models.

The Prisma schema should be treated as part of the source code.

---

# 🚫 Avoid

* Hardcoded SQL scattered across the project.
* Missing foreign keys.
* Nullable columns without justification.
* Duplicate data.
* Inconsistent naming.
* Direct schema edits in production.
* Manual database changes outside the migration process.

---

# 📚 Related Documents

* 02-architecture.md
* 03-tech-stack.md
* 05-coding-standards.md
* 06-api-standards.md
* 08-security.md

---

# 🚀 Future Improvements

Future versions may include:

* Multi-tenant database strategies
* Read replicas
* Database partitioning
* Sharding guidelines
* Event sourcing recommendations
* Time-series database integration
* Data archival policies

---

# 📝 Summary

The ONBP Database Standards provide a consistent foundation for designing, managing, and evolving relational databases across all ONBP projects.

By standardizing naming conventions, relationships, migrations, indexing, auditing, and security, ONBP ensures that every application remains reliable, maintainable, and scalable throughout its lifecycle.

A well-designed database is not only a storage system—it is a critical part of the platform architecture.

---

## 📜 Decision Log

| Version | Date       | Description                         |
| ------- | ---------- | ----------------------------------- |
| v0.1    | 2026-07-15 | Initial Database Standards Document |
