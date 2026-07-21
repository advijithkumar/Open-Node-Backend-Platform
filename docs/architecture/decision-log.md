# 📜 Decision Log

| Version | Date       | Description                                                                                  |
| ------- | ---------- | -------------------------------------------------------------------------------------------- |
| v0.1    | 2026-07-17 | Initial Authentication Architecture document created.                                        |
| v0.1    | 2026-07-17 | Adopted Better Auth as the authentication provider.                                          |
| v0.1    | 2026-07-17 | Established separation of Business Identity (ONBP) and Authentication (Better Auth).         |
| v0.1    | 2026-07-17 | Defined ownership boundaries between ONBP and Better Auth.                                   |
| v0.1    | 2026-07-17 | Documented authentication lifecycle, authorization model, and future authentication roadmap. |

---

# 📝 Summary

The ONBP Authentication Architecture establishes a clear separation between **business identity** and **authentication**.

ONBP remains the authoritative source for business users, roles, permissions, and business rules, while Better Auth manages authentication, sessions, OAuth providers, and credential security.

This architecture enables ONBP to evolve independently of any authentication provider, making the platform modular, maintainable, and adaptable to future authentication technologies without impacting business logic.
