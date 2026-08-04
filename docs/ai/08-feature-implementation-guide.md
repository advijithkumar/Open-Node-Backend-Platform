# Feature Implementation Guide

Use this guide to implement new modules, plugins, providers, or applications within ONBP.

## 1. Using ONBP Generators
ONBP contains native CLI generators to ensure new additions conform to framework folder structures and standards.

### Generate a Module
Modules contain business logic and reside under `apps/api/src/modules/`.
```bash
pnpm -F @onbp/api onbp generate module <name>
```

### Generate a Plugin
Plugins encapsulate external drivers (databases, key stores) and reside under `apps/api/src/plugins/`.
```bash
pnpm -F @onbp/api onbp generate plugin <name>
```

### Generate a Provider
Providers map interfaces to concrete drivers (e.g. SMTP for EmailService) and reside under `apps/api/src/providers/`.
```bash
pnpm -F @onbp/api onbp generate provider <name>
```

### Generate an Application
Initializes a new reference application on the ONBP framework.
```bash
pnpm -F @onbp/api onbp generate app <name>
```

---

## 2. Manual Implementation Steps

If you need to register a new platform capability manually:
1. **Define Constants**: Add the service key in `src/core/container/service.constants.ts`.
2. **Implement Service & Interface**: Code interface under `src/core/<feature>/<feature>.interface.ts` and service under `src/core/<feature>/<feature>.service.ts`.
3. **Register in Bootstrap**: In `src/bootstrap/register-core.ts`, register the service as a singleton, configure environment fallbacks, and map health checks.
4. **Extend Discovery & Doctor**: Add diagnostic properties to `DiscoveryService` and health checklist assertions to `DoctorService`.
5. **Verify**: Run build, tests, lint, and doctor CLI commands.
