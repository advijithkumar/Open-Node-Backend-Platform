import type { AuthModuleRepository } from "./auth-module.repository.js";
import type { EventBus } from "../../core/events/index.js";
import { AUTH_MODULE_EVENTS } from "./auth-module.events.js";
import type { CreateAuthModuleDto, AuthModuleRecord } from "./auth-module.types.js";

export class AuthModuleService {
  constructor(
    private readonly repository: AuthModuleRepository,
    private readonly eventBus?: EventBus
  ) {}

  async findAll(): Promise<AuthModuleRecord[]> {
    return (await this.repository.findAll()) as unknown as AuthModuleRecord[];
  }

  async create(data: CreateAuthModuleDto): Promise<AuthModuleRecord> {
    const created = (await this.repository.create({ ...data })) as unknown as AuthModuleRecord;
    if (this.eventBus) {
      await this.eventBus.emit(AUTH_MODULE_EVENTS.CREATED, { id: created.id });
    }
    return created;
  }
}
