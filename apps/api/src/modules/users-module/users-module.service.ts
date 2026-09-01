import type { UsersModuleRepository } from "./users-module.repository.js";
import type { EventBus } from "../../core/events/index.js";
import { USERS_MODULE_EVENTS } from "./users-module.events.js";
import type { CreateUsersModuleDto, UsersModuleRecord } from "./users-module.types.js";

export class UsersModuleService {
  constructor(
    private readonly repository: UsersModuleRepository,
    private readonly eventBus?: EventBus
  ) {}

  async findAll(): Promise<UsersModuleRecord[]> {
    return (await this.repository.findAll()) as unknown as UsersModuleRecord[];
  }

  async create(data: CreateUsersModuleDto): Promise<UsersModuleRecord> {
    const created = (await this.repository.create({ ...data })) as unknown as UsersModuleRecord;
    if (this.eventBus) {
      await this.eventBus.emit(USERS_MODULE_EVENTS.CREATED, { id: created.id });
    }
    return created;
  }
}
