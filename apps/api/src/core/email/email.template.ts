import { EmailTemplateError } from "./email.errors.js";

export class EmailTemplateRenderer {
  private readonly templates = new Map<string, string>();

  register(name: string, content: string): void {
    if (this.templates.has(name)) {
      throw new EmailTemplateError(`Template '${name}' already registered.`);
    }
    this.templates.set(name, content);
  }

  render(name: string, data: Record<string, any>): string {
    const template = this.templates.get(name);
    if (!template) {
      throw new EmailTemplateError(`Template '${name}' not found.`);
    }

    return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key) => {
      return data[key] !== undefined ? String(data[key]) : "";
    });
  }

  has(name: string): boolean {
    return this.templates.has(name);
  }
}
export default EmailTemplateRenderer;
