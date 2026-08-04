# Workflow Examples

Here are concrete workflow definitions showcasing how platform features are composed.

## 1. User Onboarding Workflow
```json
{
  "id": "user-onboarding",
  "trigger": { "type": "event", "event": "user.registered" },
  "steps": [
    {
      "id": "assign-role",
      "action": "assignDefaultRole"
    },
    {
      "id": "send-welcome",
      "action": "sendEmail",
      "params": {
        "template": "welcome",
        "subject": "Welcome to ONBP!"
      }
    },
    {
      "id": "alert-dashboard",
      "action": "sendNotification",
      "params": {
        "channel": "in-app",
        "body": "A new user onboarding has completed."
      }
    }
  ]
}
```

## 2. Document Processing & AI Pipeline
```json
{
  "id": "doc-pipeline",
  "trigger": { "type": "api", "path": "/api/v1/documents/process" },
  "steps": [
    {
      "id": "file-upload",
      "action": "storageUpload"
    },
    {
      "id": "ai-summarize",
      "action": "generateAI",
      "params": {
        "model": "summarize-v1"
      }
    },
    {
      "id": "db-save",
      "action": "dbWrite"
    }
  ]
}
```
