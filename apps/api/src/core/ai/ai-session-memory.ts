/* eslint-disable @typescript-eslint/no-explicit-any */
export interface AISessionMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
}

export interface AISessionContext {
  sessionId: string;
  messages: AISessionMessage[];
  metadata: Record<string, any>;
}

export class AISessionMemoryManager {
  private readonly sessions = new Map<string, AISessionContext>();
  private readonly maxMessagesPerSession: number;

  constructor(maxMessagesPerSession = 20) {
    this.maxMessagesPerSession = maxMessagesPerSession;
  }

  getOrCreateSession(sessionId: string): AISessionContext {
    let session = this.sessions.get(sessionId);
    if (!session) {
      session = {
        sessionId,
        messages: [],
        metadata: { createdAt: Date.now() },
      };
      this.sessions.set(sessionId, session);
    }
    return session;
  }

  addMessage(sessionId: string, role: "user" | "assistant" | "system", content: string): void {
    const session = this.getOrCreateSession(sessionId);
    session.messages.push({
      role,
      content,
      timestamp: Date.now(),
    });

    if (session.messages.length > this.maxMessagesPerSession) {
      // Retain context by trimming older non-system messages
      session.messages = session.messages.slice(-this.maxMessagesPerSession);
    }
  }

  getFormattedHistory(sessionId: string): string {
    const session = this.sessions.get(sessionId);
    if (!session || session.messages.length === 0) {
      return "";
    }

    return session.messages
      .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
      .join("\n\n");
  }

  clearSession(sessionId: string): void {
    this.sessions.delete(sessionId);
  }

  hasSession(sessionId: string): boolean {
    return this.sessions.has(sessionId);
  }
}

export default AISessionMemoryManager;
