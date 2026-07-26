import { promises as fs } from "node:fs";
import { dirname } from "node:path";

export class FileSystem {
  static async exists(filePath: string): Promise<boolean> {
    try {
      await fs.stat(filePath);
      return true;
    } catch (err: any) {
      if (err.code === "ENOENT") {
        return false;
      }
      throw err;
    }
  }

  static async mkdir(dirPath: string): Promise<void> {
    await fs.mkdir(dirPath, { recursive: true });
  }

  static async safeWriteFile(
    filePath: string,
    content: string,
    overwrite = false
  ): Promise<void> {
    const fileExists = await this.exists(filePath);
    if (fileExists && !overwrite) {
      throw new Error(`File already exists: ${filePath}`);
    }

    await this.mkdir(dirname(filePath));
    await fs.writeFile(filePath, content, "utf8");
  }

  static async readFile(filePath: string): Promise<string> {
    return fs.readFile(filePath, "utf8");
  }
}
