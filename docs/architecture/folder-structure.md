# 📁 Folder Structure

Recommended authentication layout:

```text
src/
├── auth/
│   ├── better-auth.ts
│   ├── auth.config.ts
│   ├── auth.routes.ts
│   ├── auth.middleware.ts
│   └── auth.service.ts
│
├── database/
│   ├── schema/
│   │   ├── user.schema.ts
│   │   ├── auth.schema.ts
│   │   └── ...
│   │
│   └── migrations/
│
├── modules/
│   └── users/
│
└── middleware/
```

Business modules remain independent from the authentication implementation.

Authentication concerns are isolated within the `auth` directory.
