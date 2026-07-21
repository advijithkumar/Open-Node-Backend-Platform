export type ServiceScope = "singleton" | "transient" | "scoped";
export type FactoryFunction<T> = (container: Container) => T;

interface ServiceDefinition<T = unknown> {
  scope: ServiceScope;
  factory?: FactoryFunction<T>;
  instance?: T;
}

export class Container {
  private readonly definitions = new Map<string, ServiceDefinition>();
  private readonly singletons = new Map<string, unknown>();
  private readonly aliases = new Map<string, string>();
  private scopedInstances = new Map<string, unknown>();

  register<T>(key: string, instance: T): void {
    this.registerInstance<T>(key, instance);
  }

  registerInstance<T>(key: string, instance: T): void {
    if (this.has(key)) {
      throw new Error(`Service '${key}' already registered.`);
    }

    this.definitions.set(key, { scope: "singleton", instance });
    this.singletons.set(key, instance);
  }

  registerFactory<T>(
    key: string,
    factory: FactoryFunction<T>,
    scope: ServiceScope = "transient"
  ): void {
    if (this.has(key)) {
      throw new Error(`Service '${key}' already registered.`);
    }

    this.definitions.set(key, { scope, factory: factory as FactoryFunction<unknown> });
  }

  registerSingleton<T>(key: string, factory: FactoryFunction<T>): void {
    this.registerFactory(key, factory, "singleton");
  }

  registerTransient<T>(key: string, factory: FactoryFunction<T>): void {
    this.registerFactory(key, factory, "transient");
  }

  registerScoped<T>(key: string, factory: FactoryFunction<T>): void {
    this.registerFactory(key, factory, "scoped");
  }

  registerAlias(alias: string, targetKey: string): void {
    if (this.has(alias)) {
      throw new Error(`Alias/Service '${alias}' already exists.`);
    }
    this.aliases.set(alias, targetKey);
  }

  resolve<T>(key: string): T {
    const resolvedKey = this.aliases.get(key) || key;
    const def = this.definitions.get(resolvedKey);

    if (!def) {
      throw new Error(`Service '${key}' not found in container.`);
    }

    if (def.scope === "singleton") {
      if (this.singletons.has(resolvedKey)) {
        return this.singletons.get(resolvedKey) as T;
      }
      if (def.factory) {
        const created = def.factory(this) as T;
        this.singletons.set(resolvedKey, created);
        return created;
      }
      return def.instance as T;
    }

    if (def.scope === "scoped") {
      if (this.scopedInstances.has(resolvedKey)) {
        return this.scopedInstances.get(resolvedKey) as T;
      }
      if (def.factory) {
        const created = def.factory(this) as T;
        this.scopedInstances.set(resolvedKey, created);
        return created;
      }
      throw new Error(`Scoped service '${key}' has no factory or instance.`);
    }

    // Transient
    if (def.factory) {
      return def.factory(this) as T;
    }

    return def.instance as T;
  }

  createScope(): Container {
    const scopedContainer = new Container();
    // Copy definitions and singletons reference
    for (const [k, v] of this.definitions.entries()) {
      scopedContainer.definitions.set(k, v);
    }
    for (const [k, v] of this.singletons.entries()) {
      scopedContainer.singletons.set(k, v);
    }
    for (const [k, v] of this.aliases.entries()) {
      scopedContainer.aliases.set(k, v);
    }
    return scopedContainer;
  }

  has(key: string): boolean {
    const resolvedKey = this.aliases.get(key) || key;
    return this.definitions.has(resolvedKey);
  }

  clearScope(): void {
    this.scopedInstances.clear();
  }
}

export const container = new Container();