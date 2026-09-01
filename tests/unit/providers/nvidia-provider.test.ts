/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from "vitest";
import { NvidiaProvider } from "../../../apps/api/src/providers/nvidia.provider.js";

describe("NVIDIA AI Provider Unit Tests", () => {
  it("should initialize provider and return diagnostic info", async () => {
    const provider = new NvidiaProvider({ apiKey: "test-nvidia-key", model: "meta/llama-3.1-8b-instruct" });
    expect(provider.name).toBe("nvidia");

    const diag = await provider.diagnostics();
    expect(diag.provider).toBe("nvidia");
    expect(diag.model).toBe("meta/llama-3.1-8b-instruct");
    expect(diag.embeddingModel).toBe("nvidia/embed-qa-4");
    expect(diag.apiKeyConfigured).toBe(true);

    const health = await provider.health();
    expect(health.status).toBe("healthy");
  });

  it("should report unhealthy status if API key is unconfigured", async () => {
    const provider = new NvidiaProvider({ apiKey: "" });
    const health = await provider.health();
    expect(health.status).toBe("unhealthy");
    expect(health.reason).toContain("missing");
  });

  it("should execute text completion via mocked NVIDIA API fetch", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: "nv-chat-123",
        model: "meta/llama-3.1-8b-instruct",
        choices: [
          {
            message: { role: "assistant", content: "NVIDIA completion response" },
          },
        ],
        usage: {
          prompt_tokens: 10,
          completion_tokens: 15,
          total_tokens: 25,
        },
      }),
    });

    const provider = new NvidiaProvider({
      apiKey: "nv-test-key",
      fetchFn: mockFetch as any,
    });

    const res = await provider.complete("Summarize prompt");
    expect(res.text).toBe("NVIDIA completion response");
    expect(res.model).toBe("meta/llama-3.1-8b-instruct");
    expect(res.usage?.totalTokens).toBe(25);
    expect(mockFetch).toHaveBeenCalledWith("https://integrate.api.nvidia.com/v1/chat/completions", expect.any(Object));
  });

  it("should execute embedding generation via mocked NVIDIA API fetch", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        model: "nvidia/embed-qa-4",
        data: [
          {
            embedding: [0.12, 0.34, 0.56],
          },
        ],
      }),
    });

    const provider = new NvidiaProvider({
      apiKey: "nv-test-key",
      fetchFn: mockFetch as any,
    });

    const res = await provider.embed("sample content");
    expect(res.embedding).toEqual([0.12, 0.34, 0.56]);
    expect(res.model).toBe("nvidia/embed-qa-4");
  });

  it("should support multimodal vision payloads, reasoning effort, and stream headers", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: "nv-vision-123",
        model: "moonshotai/kimi-k3",
        choices: [
          {
            message: { role: "assistant", content: "Image shows a scenic landscape." },
          },
        ],
      }),
    });

    const provider = new NvidiaProvider({
      apiKey: "nv-test-key",
      fetchFn: mockFetch as any,
    });

    const res = await provider.complete("What is in this image?", {
      model: "moonshotai/kimi-k3",
      imageUrl: "https://assets.ngc.nvidia.com/products/api-catalog/example.jpg",
      reasoningEffort: "max",
      stream: true,
    });

    expect(res.text).toBe("Image shows a scenic landscape.");
    expect(mockFetch).toHaveBeenCalledWith(
      "https://integrate.api.nvidia.com/v1/chat/completions",
      expect.objectContaining({
        headers: expect.objectContaining({
          Accept: "text/event-stream",
        }),
        body: expect.stringContaining("image_url"),
      })
    );
  });

  it("should throw error if NVIDIA API returns error status", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      text: async () => "Invalid NVIDIA Key",
    });

    const provider = new NvidiaProvider({
      apiKey: "bad-key",
      fetchFn: mockFetch as any,
    });

    await expect(provider.complete("Test prompt")).rejects.toThrow("NVIDIA completion request failed (403)");
  });
});
