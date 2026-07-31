import { eq, and, isNull } from "drizzle-orm";
import { BaseRepository } from "../../core/database/base.repository.js";
import { settingsTable } from "./settings.schema.js";
import { db } from "../../core/database/db.js";
import type { SettingRecord } from "./settings.types.js";

export class SettingsRepository extends BaseRepository<typeof settingsTable> {
  constructor() {
    super(settingsTable);
  }

  async findByKey(keyVal: string): Promise<SettingRecord | undefined> {
    const results = await db
      .select()
      .from(this.table)
      .where(and(eq(settingsTable.key, keyVal), isNull(settingsTable.deletedAt)))
      .limit(1);
    return results[0] as SettingRecord | undefined;
  }

  async findAllSettings(limit = 50, offset = 0): Promise<SettingRecord[]> {
    const results = await this.findAll(limit, offset);
    return results as unknown as SettingRecord[];
  }

  async createSetting(data: { key: string; value: string; description?: string }): Promise<SettingRecord> {
    const record = await this.create(data as Record<string, unknown>);
    return record as unknown as SettingRecord;
  }

  async updateSetting(idVal: string, data: { value: string; description?: string }): Promise<SettingRecord> {
    const record = await this.update(idVal, data as Record<string, unknown>);
    return record as unknown as SettingRecord;
  }

  async deleteSetting(idVal: string): Promise<boolean> {
    return this.softDelete(idVal);
  }
}
export default SettingsRepository;
