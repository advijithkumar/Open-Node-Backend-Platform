import type { SettingsRepository } from "./settings.repository.js";
import { SETTINGS_EVENTS } from "./settings.events.js";
import type { CreateSettingDto, UpdateSettingDto, SettingRecord } from "./settings.types.js";
import { container } from "../../core/container/container.js";
import { CORE_SERVICES } from "../../core/container/service.constants.js";
import type { IEventBus } from "../../core/events/event.interface.js";
import type { ICacheService } from "../../core/cache/cache.interface.js";

export class SettingsService {
  constructor(
    private readonly repository: SettingsRepository,
    private readonly eventBus?: IEventBus
  ) {}

  private getCache(): ICacheService | undefined {
    try {
      if (container.has(CORE_SERVICES.CACHE)) {
        return container.resolve<ICacheService>(CORE_SERVICES.CACHE);
      }
    } catch {
      // Fallback if container is not ready
    }
    return undefined;
  }

  async findAll(limit = 50, offset = 0): Promise<SettingRecord[]> {
    return this.repository.findAllSettings(limit, offset);
  }

  async findByKey(key: string): Promise<SettingRecord | undefined> {
    const cache = this.getCache();
    const cacheKey = `setting:${key}`;

    if (cache) {
      try {
        const cached = await cache.get<SettingRecord>(cacheKey);
        if (cached) return cached;
      } catch {
        // Fallback on cache failure
      }
    }

    const record = await this.repository.findByKey(key);

    if (record && cache) {
      try {
        await cache.set(cacheKey, record, 3600);
      } catch {
        // Fallback
      }
    }

    return record;
  }

  async create(data: CreateSettingDto): Promise<SettingRecord> {
    const existing = await this.repository.findByKey(data.key);
    if (existing) {
      throw new Error(`Setting key "${data.key}" already exists`);
    }

    const created = await this.repository.createSetting(data);

    if (this.eventBus) {
      await this.eventBus.emit(SETTINGS_EVENTS.CREATED, created);
    }

    return created;
  }

  async update(key: string, data: UpdateSettingDto): Promise<SettingRecord> {
    const record = await this.repository.findByKey(key);
    if (!record) {
      throw new Error(`Setting not found for key: ${key}`);
    }

    const updated = await this.repository.updateSetting(record.id, data);

    const cache = this.getCache();
    if (cache) {
      try {
        await cache.delete(`setting:${key}`);
      } catch {
        // Fallback
      }
    }

    if (this.eventBus) {
      await this.eventBus.emit(SETTINGS_EVENTS.UPDATED, updated);
    }

    return updated;
  }

  async delete(key: string): Promise<boolean> {
    const record = await this.repository.findByKey(key);
    if (!record) {
      throw new Error(`Setting not found for key: ${key}`);
    }

    const deleted = await this.repository.deleteSetting(record.id);

    const cache = this.getCache();
    if (cache) {
      try {
        await cache.delete(`setting:${key}`);
      } catch {
        // Fallback
      }
    }

    if (deleted && this.eventBus) {
      await this.eventBus.emit(SETTINGS_EVENTS.DELETED, record);
    }

    return deleted;
  }
}
export default SettingsService;
