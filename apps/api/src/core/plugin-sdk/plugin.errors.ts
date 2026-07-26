export class PluginError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = this.constructor.name;
  }
}

export class PluginConnectionError extends PluginError {
  constructor(pluginName: string, message: string, options?: ErrorOptions) {
    super(`[Plugin: ${pluginName}] Connection failed: ${message}`, options);
  }
}

export class PluginValidationError extends PluginError {
  constructor(pluginName: string, message: string, options?: ErrorOptions) {
    super(`[Plugin: ${pluginName}] Validation failed: ${message}`, options);
  }
}
