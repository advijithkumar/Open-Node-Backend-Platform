export class TemplateEngine {
  /**
   * Replaces all occurrences of {{key}} with values in params.
   */
  static render(templateContent: string, params: Record<string, string>): string {
    let rendered = templateContent;
    for (const [key, value] of Object.entries(params)) {
      const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, "g");
      rendered = rendered.replace(regex, value);
    }
    return rendered;
  }
}
