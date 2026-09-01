/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from "vitest";
import { OpenAIProvider } from "../../../apps/api/src/providers/openai.provider.js";

describe("OpenAI AI Provider Unit Tests", () => {
  it("should initialize provider and return diagnostic info", async () => {
    const provider = new OpenAIProvider({ apiKey: "test-openai-key", model: "gpt-4o-mini" });
    expect(provider.name).toBe("openai");

    const diag = await provider.diagnostics();
    expect(diag.provider).toBe("openai");
    expect(diag.model).toBe("gpt-4o-mini");
    expect(diag.apiKeyConfigured).toBe(true);

    const health = await provider.health();
    expect(health.status).toBe("healthy");
  });

  it("should report unhealthy status if API key is unconfigured", async () => {
    const provider = new OpenAIProvider({ apiKey: "" });
    const health = await provider.health();
    expect(health.status).toBe("unhealthy");
    expect(health.reason).toContain("missing");
  });

  it("should execute text completion via mocked OpenAI API fetch", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: "chatcmpl-123",
        model: "gpt-4o-mini",
        choices: [
          {
            message: { role: "assistant", content: "OpenAI completion response" },
          },
        ],
        usage: {
          prompt_tokens: 5,
          completion_tokens: 10,
          total_tokens: 15,
        },
      }),
    });

    const provider = new OpenAIProvider({
      apiKey: "sk-test-key",
      fetchFn: mockFetch as any,
    });

    const res = await provider.complete("Summarize document");
    expect(res.text).toBe("OpenAI completion response");
    expect(res.model).toBe("gpt-4o-mini");
    expect(res.usage?.totalTokens).toBe(15);
    expect(mockFetch).toHaveBeenCalledWith("https://api.openai.com/v1/chat/completions", expect.any(Object));
  });

  it("should execute embedding generation via mocked OpenAI API fetch", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        model: "text-embedding-3-small",
        data: [
          {
            embedding: [0.11, 0.22, 0.33],
          },
        ],
      }),
    });

    const provider = new OpenAIProvider({
      apiKey: "sk-test-key",
      fetchFn: mockFetch as any,
    });

    const res = await provider.embed("sample document content");
    expect(res.embedding).toEqual([0.11, 0.22, 0.33]);
    expect(res.model).toBe("text-embedding-3-small");
  });

  it("should throw error if API returns non-200 status", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => "Unauthorized API key",
    });

    const provider = new OpenAIProvider({
      apiKey: "invalid-key",
      fetchFn: mockFetch as any,
    });

    await expect(provider.complete("Test prompt")).rejects.toThrow("OpenAI completion request failed (401)");
  });
});
