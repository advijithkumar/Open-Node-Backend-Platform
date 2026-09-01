/* eslint-disable @typescript-eslint/no-explicit-any */
import type { IWorkflowStep } from "../workflow.step.js";
import type { WorkflowContext } from "../workflow.context.js";
import type { WorkflowDefinition } from "../workflow.types.js";
import { container } from "../../container/container.js";
import { CORE_SERVICES } from "../../container/service.constants.js";

/**
 * 1. Verify Authorization & Permissions Step
 */
export class VerifyDocPermissionsStep implements IWorkflowStep {
  readonly name = "verifyDocPermissions";

  async execute(context: WorkflowContext, _input: any): Promise<any> {
    const authService = container.has(CORE_SERVICES.AUTHORIZATION)
      ? container.resolve<any>(CORE_SERVICES.AUTHORIZATION)
      : null;

    const user = context.input.user;
    if (!user) {
      throw new Error("Unauthorized: User context required.");
    }

    if (authService && authService.hasPermission) {
      const allowed = await authService.hasPermission(user.id, "documents:process");
      if (!allowed) {
        throw new Error(`Forbidden: User '${user.id}' lacks 'documents:process' permission.`);
      }
    }

    return { authorized: true, userId: user.id, role: user.role || "user" };
  }
}

/**
 * 2. Fetch Document from Storage Step (MinIO / Local Storage)
 */
export class FetchDocumentFromStorageStep implements IWorkflowStep {
  readonly name = "fetchDocumentFromStorage";

  async execute(context: WorkflowContext, _input: any): Promise<any> {
    const storageService = container.has(CORE_SERVICES.STORAGE)
      ? container.resolve<any>(CORE_SERVICES.STORAGE)
      : null;

    const bucket = context.input.bucket || "documents";
    const key = context.input.documentKey;

    if (!key) {
      throw new Error("Document key is missing from workflow input.");
    }

    let fileBuffer: Buffer;
    if (storageService) {
      const fileData = await storageService.download(bucket, key);
      fileBuffer = Buffer.isBuffer(fileData) ? fileData : Buffer.from(fileData);
    } else {
      fileBuffer = Buffer.from(`Sample document content for key: ${key}`);
    }

    const contentText = fileBuffer.toString("utf-8");
    return { bucket, key, size: fileBuffer.length, contentText };
  }
}

/**
 * 3. AI Text Extraction & Embedding Step (AIService - OpenAI / Gemini / Mock)
 */
export class AnalyzeDocumentWithAIStep implements IWorkflowStep {
  readonly name = "analyzeDocumentWithAI";

  async execute(_context: WorkflowContext, input: any): Promise<any> {
    const aiService = container.has(CORE_SERVICES.AI)
      ? container.resolve<any>(CORE_SERVICES.AI)
      : null;

    const fetchResult = input["fetch-document"];
    const contentText = fetchResult?.contentText || "Document placeholder text";

    let summaryText = `[Extracted summary for content length: ${contentText.length}]`;
    let embeddingVector: number[] = [0.1, 0.2, 0.3, 0.4];

    if (aiService) {
      const completion = await aiService.complete(`Summarize the following document:\n${contentText}`, {
        temperature: 0.3,
      });
      summaryText = completion.text;

      const embeddingRes = await aiService.embed(contentText);
      embeddingVector = embeddingRes.embedding;
    }

    return { summary: summaryText, embeddingLength: embeddingVector.length };
  }
}

/**
 * 4. Persist Record to Database Step (PostgreSQL via Drizzle / Mock db)
 */
export class PersistDocumentRecordStep implements IWorkflowStep {
  readonly name = "persistDocumentRecord";

  async execute(_context: WorkflowContext, input: any): Promise<any> {
    const db = container.has(CORE_SERVICES.DATABASE)
      ? container.resolve<any>(CORE_SERVICES.DATABASE)
      : null;

    const auth = input["verify-permissions"];
    const fetchRes = input["fetch-document"];
    const aiRes = input["ai-analyze"];

    const record = {
      userId: auth.userId,
      documentKey: fetchRes.key,
      summary: aiRes.summary,
      processedAt: new Date().toISOString(),
    };

    if (db && db.insert) {
      await db.insert("documents").values(record);
    }

    return { recordId: `doc-${Date.now()}`, ...record };
  }
}

/**
 * 5. Send Transactional Completion Email Step (EmailService / SMTP)
 */
export class SendProcessingCompleteEmailStep implements IWorkflowStep {
  readonly name = "sendProcessingCompleteEmail";

  async execute(context: WorkflowContext, input: any): Promise<any> {
    const emailService = container.has(CORE_SERVICES.EMAIL)
      ? container.resolve<any>(CORE_SERVICES.EMAIL)
      : null;

    const userEmail = context.input.user?.email || "user@example.com";
    const dbRecord = input["persist-record"];

    let emailSent = true;
    if (emailService) {
      const result = await emailService.send({
        to: userEmail,
        subject: "Document Processing Complete",
        html: `<p>Your document <strong>${dbRecord.documentKey}</strong> has been processed successfully.</p><p>Summary: ${dbRecord.summary}</p>`,
      });
      emailSent = result.success;
    }

    return { recipient: userEmail, sent: emailSent, documentKey: dbRecord.documentKey };
  }
}

/**
 * E2E AI Document Processing Workflow Definition
 */
export const DocumentProcessingWorkflowDefinition: WorkflowDefinition = {
  name: "ai-document-processing-workflow",
  version: "1.0.0",
  description: "End-to-end AI document processing pipeline integrating Auth, MinIO, AI, PostgreSQL, and Email.",
  steps: [
    {
      name: "verify-permissions",
      action: "verifyDocPermissions",
    },
    {
      name: "fetch-document",
      action: "fetchDocumentFromStorage",
      dependsOn: ["verify-permissions"],
    },
    {
      name: "ai-analyze",
      action: "analyzeDocumentWithAI",
      dependsOn: ["fetch-document"],
    },
    {
      name: "persist-record",
      action: "persistDocumentRecord",
      dependsOn: ["ai-analyze"],
    },
    {
      name: "send-notification-email",
      action: "sendProcessingCompleteEmail",
      dependsOn: ["persist-record"],
    },
  ],
};
