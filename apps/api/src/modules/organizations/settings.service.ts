import type { SettingRepository } from "./settings.repository.js";

export class SettingService {
  constructor(private readonly settingRepository: SettingRepository) {}

  async get(key: string) {
    return this.settingRepository.findByKey(key);
  }

  async getAll(group?: string) {
    return this.settingRepository.findAll(group);
  }

  async set(key: string, value: unknown, description?: string, group?: string) {
    return this.settingRepository.upsert(key, value, description, group);
  }

  async delete(key: string) {
    return this.settingRepository.delete(key);
  }
}
