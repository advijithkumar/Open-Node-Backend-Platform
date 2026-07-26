# ONBP Versioning Policy

This document defines the versioning guidelines, compatibility rules, and deprecation policies for all official ONBP plugins, modules, and providers.

## 1. Plugin & Provider Versioning
- All ecosystem plugins must use **Semantic Versioning (SemVer)** matching `MAJOR.MINOR.PATCH` format:
  - **MAJOR**: Breaking changes (e.g. changing DB connection options format, removing core public methods).
  - **MINOR**: Backward-compatible features (e.g. adding diagnostics properties, new options).
  - **PATCH**: Backward-compatible bug fixes (e.g. resolving memory leaks, fixing error message translations).

## 2. Compatibility Policy
- Plugins must specify their compatible framework version range in their `package.json` peerDependencies (e.g., `"@onbp/core": "^0.1.0"`).
- Minor and patch releases must preserve backward compatibility. Any breaking changes must trigger a major version release.

## 3. Deprecation Policy
- Deprecated methods or configuration keys must remain functional for at least one minor release cycle.
- Add warning logs if deprecated parameters are used:
  ```typescript
  logger.warn("Config key 'database.url' is deprecated. Please migrate to 'database.connectionString'.");
  ```
- Deprecated features must be removed only in the next major version release.

## 4. Upgrade Strategy
- Keep a detailed `CHANGELOG.md` inside each plugin directory.
- Document step-by-step upgrade instructions for major releases.
