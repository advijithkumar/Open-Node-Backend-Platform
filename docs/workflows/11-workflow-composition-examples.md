# Workflow Composition Examples

Here are two core workflows showing how platform features compose without direct dependencies.

## 1. User Onboarding Workflow
```json
{
  "name": "user-onboarding-workflow",
  "version": "1.0.0",
  "steps": [
    {
      "name": "validate-input",
      "action": "validateUserForm"
    },
    {
      "name": "create-db-user",
      "action": "createUserInDB",
      "dependsOn": ["validate-input"]
    },
    {
      "name": "dispatch-welcome-email",
      "action": "sendWelcomeEmail",
      "dependsOn": ["create-db-user"]
    },
    {
      "name": "trigger-alert",
      "action": "sendWelcomeNotification",
      "dependsOn": ["create-db-user"]
    }
  ]
}
```

## 2. Document Processing & AI Pipeline
```json
{
  "name": "document-pipeline-workflow",
  "version": "1.0.0",
  "steps": [
    {
      "name": "upload-to-s3",
      "action": "storageUpload"
    },
    {
      "name": "ai-extract",
      "action": "generateAI",
      "dependsOn": ["upload-to-s3"]
    },
    {
      "name": "persist-results",
      "action": "saveSummaryToDB",
      "dependsOn": ["ai-extract"]
    }
  ]
}
```
