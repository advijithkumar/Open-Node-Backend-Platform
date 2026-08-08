export class TemplateEngine {
  /**
   * Replaces all occurrences of {{key}} with values in params.
   */
  static render(templateContent: string, params: Record<string, string>): string {
    return templateContent.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
      const trimmedKey = key.trim();
      return Object.prototype.hasOwnProperty.call(params, trimmedKey)
        ? params[trimmedKey]
        : match;
    });
  }
}
