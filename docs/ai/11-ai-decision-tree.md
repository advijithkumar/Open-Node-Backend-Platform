# AI Decision Tree

Use this decision tree when mapping requirements to implementation designs in ONBP.

## Mermaid Decision Tree Flowchart

```mermaid
graph TD
    A["New Requirement"] --> B{"Is there an existing ONBP capability?"}
    B -- "Yes" --> C{"Should we reuse or extend?"}
    C -- "Reuse" --> D["Resolve Core Abstraction from DI Container"]
    C -- "Extend" --> E["Add new Provider driver / Custom action"]
    B -- "No" --> F{"What type of component is it?"}
    
    F -- "Core Utility" --> G["Implement under src/core/ (Observe Freeze)"]
    F -- "External Driver" --> H["Implement under src/plugins/"]
    F -- "Business Domain" --> I["Implement under src/modules/"]
    F -- "App Integration" --> J["Create new reference application"]
    
    D --> K["Consult ADRs and Version Matrix"]
    E --> K
    G --> K
    H --> K
    I --> K
    J --> K
    
    K --> L["Write Feature Code"]
    L --> M["Write automated unit/integration tests"]
    M --> N["Verify using build, test, lint, and onbp doctor"]
```

---

## Guidelines for Choices

- **Use core** only for system boot, DI orchestration, configuration bindings, logging configurations, or framework doctor rules.
- **Use plugins** when wrapping direct databases, key value stores, or external API platforms (Better Auth, Redis, MinIO).
- **Use modules** for standard domain operations (Express controllers, databases tables, API routers).
- **Use providers** when mapping concrete implementations to core interfaces (e.g. SMTP for Email, LocalStorage for Storage).
- **Use workflows** when orchestrating multi-step pipelines involving multiple modules or platform services sequentially.
