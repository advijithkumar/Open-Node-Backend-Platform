import { performance } from "node:perf_hooks";

const template = `
  Hello {{ name }},
  Welcome to {{ company }}.
  Your role is {{ role }}.
  Here are some random variables: {{ var1 }}, {{ var2 }}, {{ var3 }}, {{ var4 }}.
  {{ non_existent }} should be ignored.
  End of template.
`;

const params = {
  name: "John Doe",
  company: "Acme Corp",
  role: "Software Engineer",
  var1: "1",
  var2: "2",
  var3: "3",
  var4: "4",
};

export class OldTemplateEngine {
  static render(templateContent: string, params: Record<string, string>): string {
    let rendered = templateContent;
    for (const [key, value] of Object.entries(params)) {
      const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, "g");
      rendered = rendered.replace(regex, value);
    }
    return rendered;
  }
}

export class NewTemplateEngine {
  static render(templateContent: string, params: Record<string, string>): string {
    return templateContent.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
      const trimmedKey = key.trim();
      return Object.prototype.hasOwnProperty.call(params, trimmedKey)
        ? params[trimmedKey]
        : match;
    });
  }
}

const ITERATIONS = 50000;

console.log("Warming up...");
for (let i = 0; i < 1000; i++) {
  OldTemplateEngine.render(template, params);
  NewTemplateEngine.render(template, params);
}

console.log("Checking correctness:");
const oldResult = OldTemplateEngine.render(template, params);
const newResult = NewTemplateEngine.render(template, params);
if (oldResult !== newResult) {
  console.error("Mismatch!");
  console.log("Old:", oldResult);
  console.log("New:", newResult);
  process.exit(1);
} else {
  console.log("Correctness check passed.");
}

console.log("Benchmarking...");
const startOld = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
  OldTemplateEngine.render(template, params);
}
const endOld = performance.now();

const startNew = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
  NewTemplateEngine.render(template, params);
}
const endNew = performance.now();

const oldTime = endOld - startOld;
const newTime = endNew - startNew;
const improvement = oldTime / newTime;

console.log(`Old implementation: ${oldTime.toFixed(2)} ms`);
console.log(`New implementation: ${newTime.toFixed(2)} ms`);
console.log(`Improvement: ${improvement.toFixed(2)}x faster`);
