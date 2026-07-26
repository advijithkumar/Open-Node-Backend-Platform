import { promises as fs } from "node:fs";
import { dirname } from "node:path";

/**
 * Converts a string to PascalCase.
 * e.g., "examination" -> "Examination", "user-profile" -> "UserProfile"
 */
export function toPascalCase(str: string): string {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => word.toUpperCase())
    .replace(/\s+|[-_]+/g, "");
}

/**
 * Converts a string to camelCase.
 * e.g., "Examination" -> "examination", "user-profile" -> "userProfile"
 */
export function toCamelCase(str: string): string {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

/**
 * Converts a string to kebab-case.
 * e.g., "UserProfile" -> "user-profile"
 */
export function toKebabCase(str: string): string {
  return str
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();
}

/**
 * Safely writes content to a file, creating any missing parent directories.
 * If overwrite is false and the file exists, it throws an error.
 */
export async function safeWriteFile(
  filePath: string,
  content: string,
  overwrite = false
): Promise<void> {
  try {
    const stat = await fs.stat(filePath);
    if (stat.isFile() && !overwrite) {
      throw new Error(`File already exists: ${filePath}`);
    }
  } catch (err: any) {
    if (err.code !== "ENOENT") {
      throw err;
    }
  }

  // Ensure target directory exists
  await fs.mkdir(dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content, "utf8");
}
