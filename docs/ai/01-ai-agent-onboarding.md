# AI Agent Onboarding Guide

Welcome to the Open Node Backend Platform (ONBP). As an AI agent code assistant, you must adhere to the onboarding rules below to keep the architecture clean and maintain the frozen core.

## Crucial Rule: Reuse Before Rebuilding
You must check the capability manifests (`onbp.capabilities.json` and `onbp.versions.json`) before generating any new implementation.

Do NOT implement duplicate or competing:
- Authentication & Sessions
- Database client instances
- Custom Caches
- Independent Queue workers
- Direct Mail SMTP or S3 clients

## Onboarding Audit Loop
1. **Detect ONBP Framework**: Scan root for `onbp.manifest.json`.
2. **Consult Matrix**: Read `onbp.versions.json` to verify dependency versions.
3. **Inspect Services**: Read `onbp.capabilities.json` to discover existing registered modules.
4. **Draft Plan**: Draft plan listing modifications or new domain-specific modules.
5. **Doctor Review**: Verify tests and doctor statuses using `pnpm run onbp doctor`.
