import { describe, it, expect } from "vitest";
import { generateModule } from "tools/cli/module-generator.js";
import { generatePlugin } from "tools/cli/plugin-generator.js";
import fs from "node:fs/promises";


describe("Phase 3 ONBP CLI & Ecosystem Tools", () => {
  it("should generate module structure", async () => {
    const modPath = await generateModule("inventory", "./test-gen/modules");
    const exists = await fs.access(modPath).then(() => true).catch(() => false);
    expect(exists).toBe(true);

    await fs.rm("./test-gen", { recursive: true, force: true });
  });

  it("should generate plugin structure", async () => {
    const plugPath = await generatePlugin("redis", "./test-gen/plugins");
    const exists = await fs.access(plugPath).then(() => true).catch(() => false);
    expect(exists).toBe(true);

    await fs.rm("./test-gen", { recursive: true, force: true });
  });
});
