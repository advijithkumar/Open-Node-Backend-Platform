import { describe, it, expect } from "vitest";
import { ConfigManager } from "../../../apps/api/src/core/config/config.manager.js";

describe("ConfigManager", () => {
  it("should set and retrieve flat configuration keys", () => {
    const config = new ConfigManager();
    config.set("appName", "Test App");

    expect(config.has("appName")).toBe(true);
    expect(config.get("appName")).toBe("Test App");
  });

  it("should set and retrieve nested dot-notation keys", () => {
    const config = new ConfigManager();
    config.set("database.host", "localhost");
    config.set("database.port", 5432);

    expect(config.get("database.host")).toBe("localhost");
    expect(config.get("database.port")).toBe(5432);
    expect(config.get("database")).toEqual({ host: "localhost", port: 5432 });
  });

  it("should deep merge loaded objects", () => {
    const config = new ConfigManager();
    config.set("database", { host: "localhost" });
    config.load({ database: { port: 5432 } });

    expect(config.get("database.host")).toBe("localhost");
    expect(config.get("database.port")).toBe(5432);
  });

  it("should throw error when modified after freeze", () => {
    const config = new ConfigManager();
    config.set("key", "val");
    config.freeze();

    expect(() => config.set("key", "new")).toThrow();
    expect(() => config.register("another", "val")).toThrow();
    expect(() => config.load({ key: "merge" })).toThrow();
    expect(() => config.remove("key")).toThrow();
  });
});
