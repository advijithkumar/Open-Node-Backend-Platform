# Verification Checklist & Contract

Every completed implementation must satisfy and report the following validation metrics.

## The Verification Contract
When submitting or concluding a development task, output this status matrix:

```text
Build:
PASS / FAIL

Tests:
PASS / FAIL

Lint:
PASS / FAIL

Discovery:
PASS / FAIL

Doctor:
PASS / FAIL

Doctor JSON:
PASS / FAIL

Capability reused:
<name(s)>

Technology:
<name + version used from versions matrix>

Files changed:
- <list of file paths relative to root>

Remaining issues:
- <list of outstanding concerns/limitations>
```

---

## Command Suite Checklist

### 1. Build Verification
Ensure the TypeScript code compiles cleanly:
```bash
pnpm build
```

### 2. Test Execution
Verify all workspace tests pass successfully:
```bash
pnpm test
```

### 3. Lint Audits
Confirm zero lint/style errors:
```bash
pnpm lint
```

### 4. CLI Diagnostics
Run local doctor and discovery tests:
```bash
pnpm -F @onbp/api onbp discovery
pnpm -F @onbp/api onbp doctor
pnpm -F @onbp/api onbp doctor --json
```
