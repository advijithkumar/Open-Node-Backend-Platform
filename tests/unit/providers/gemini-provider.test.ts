/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from "vitest";
import { GeminiProvider } from "../../../apps/api/src/providers/gemini.provider.js";

describe("Google Gemini AI Provider Unit Tests", () => {
  it("should initialize provider and return diagnostic info", async () => {
    const provider = new GeminiProvider({ apiKey: "test-gemini-key", model: "gemini-1.5-flash" });
    expect(provider.name).toBe("gemini");

    const diag = await provider.diagnostics();
    expect(diag.provider).toBe("gemini");
    expect(diag.model).toBe("gemini-1.5-flash");
    expect(diag.apiKeyConfigured).toBe(true);

    const health = await provider.health();
    expect(health.status).toBe("healthy");
  });

  it("should report unhealthy status if API key is missing", async () => {
    const provider = new GeminiProvider({ apiKey: "" });
    const health = await provider.health();
    expect(health.status).toBe("unhealthy");
  });

  it("should execute completion via mocked Gemini API fetch", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        candidates: [
          {
            content: {
              parts: [{ text: "Gemini completion response" }],
            },
          },
        ],
        usageMetadata: {
          promptTokenCount: 8,
          candidatesTokenCount: 12,
          totalTokenCount: 20,
        },
      }),
    });

    const provider = new GeminiProvider({
      apiKey: "test-gemini-key",
      fetchFn: mockFetch as any,
    });

    const res = await provider.complete("Analyze document");
    expect(res.text).toBe("Gemini completion response");
    expect(res.model).toBe("gemini-1.5-flash");
    expect(res.usage?.totalTokens).toBe(20);
  });

  it("should execute embedding generation via mocked Gemini API fetch", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        embedding: {
          values: [0.55, 0.66, 0.77],
        },
      }),
    });

    const provider = new GeminiProvider({
      apiKey: "test-gemini-key",
      fetchFn: mockFetch as any,
    });

    const res = await provider.embed("sample text");
    expect(res.embedding).toEqual([0.55, 0.66, 0.77]);
    expect(res.model).toBe("text-embedding-004");
  });

  it("should throw error if Gemini API returns error status", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      text: async () => "Invalid prompt format",
    });

    const provider = new GeminiProvider({
      apiKey: "key",
      fetchFn: mockFetch as any,
    });

    await expect(provider.complete("bad prompt")).rejects.toThrow("Gemini completion request failed (400)");
  });
});
