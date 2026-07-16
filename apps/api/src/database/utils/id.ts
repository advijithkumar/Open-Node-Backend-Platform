import { v7 as uuidv7 } from "uuid";

/**
 * Generates a UUID v7.
 */
export function generateId(): string {
  return uuidv7();
}
