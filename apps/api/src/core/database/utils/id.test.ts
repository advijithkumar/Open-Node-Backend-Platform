import { describe, it, expect } from "vitest";
import { generateId } from "./id.js";

describe("generateId", () => {
  it("should return a string", () => {
    const id = generateId();
    expect(typeof id).toBe("string");
  });

  it("should be a valid UUID format (36 characters)", () => {
    const id = generateId();
    expect(id.length).toBe(36);

    // Check general UUID structure: 8-4-4-4-12
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    expect(id).toMatch(uuidRegex);
  });

  it("should generate a valid UUID v7", () => {
    const id = generateId();

    // In UUIDv7, the 13th character (index 14) must be '7'
    expect(id.charAt(14)).toBe("7");

    // The 17th character (index 19) must be 8, 9, a, or b for variant 1 UUIDs
    const variantChar = id.charAt(19).toLowerCase();
    expect(["8", "9", "a", "b"]).toContain(variantChar);
  });

  it("should generate unique IDs", () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).not.toBe(id2);
  });
});
