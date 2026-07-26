import { describe, it, expect } from "vitest";
import { Container } from "../../../apps/api/src/core/container/container.js";

describe("DI Container", () => {
  it("should register and resolve instances", () => {
    const container = new Container();
    const service = { foo: "bar" };
    container.register("myService", service);

    expect(container.has("myService")).toBe(true);
    expect(container.resolve("myService")).toBe(service);
  });

  it("should register and resolve singleton factories", () => {
    const container = new Container();
    let count = 0;
    container.registerSingleton("factoryService", () => {
      count++;
      return { val: count };
    });

    const res1 = container.resolve<{ val: number }>("factoryService");
    const res2 = container.resolve<{ val: number }>("factoryService");

    expect(res1.val).toBe(1);
    expect(res2.val).toBe(1);
    expect(count).toBe(1);
  });

  it("should support scopes", () => {
    const container = new Container();
    let count = 0;
    container.registerScoped("scopedService", () => {
      count++;
      return { val: count };
    });

    const scope1 = container.createScope();
    const res1 = scope1.resolve<{ val: number }>("scopedService");
    const res2 = scope1.resolve<{ val: number }>("scopedService");

    expect(res1.val).toBe(1);
    expect(res2.val).toBe(1);

    const scope2 = container.createScope();
    const res3 = scope2.resolve<{ val: number }>("scopedService");
    expect(res3.val).toBe(2);
  });
});
