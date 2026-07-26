# {{pascalName}} Provider

Standalone provider for {{pascalName}} integration within the Open Node Backend Platform (ONBP).

## Purpose
Enables platform services to access {{pascalName}} capabilities.

## Features
- Health status monitoring.
- Diagnostics reporting.

## Configuration
Configure the provider via the central `ConfigManager`:
- `providers.{{camelName}}.endpoint` (default: `http://localhost`)
- `providers.{{camelName}}.enabled` (default: `true`)

## Example Registration
```typescript
import provider from "./index.js";
import { container } from "../../core/container/container.js";
import { CORE_SERVICES } from "../../core/container/service.constants.js";

const providerMgr = container.resolve<any>(CORE_SERVICES.PROVIDER_MANAGER);
await providerMgr.register(provider);
```

## Example Plugin Integration
```typescript
import { {{pascalName}}Provider } from "./provider.js";

export class MyPlugin implements IPlugin {
  readonly name = "my-plugin";
  readonly version = "1.0.0";
  readonly providers = [new {{pascalName}}Provider()];
}
```
