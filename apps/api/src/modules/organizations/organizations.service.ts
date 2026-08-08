import type { OrganizationsRepository } from "./organizations.repository.js";
import type { EventBus } from "../../core/events/index.js";
import { ORGANIZATIONS_EVENTS } from "./organizations.events.js";
import type { CreateOrganizationsDto, OrganizationsRecord } from "./organizations.types.js";

export class OrganizationsService {
  constructor(
    private readonly repository: OrganizationsRepository,
    private readonly eventBus?: EventBus
  ) {}

  async findAll(): Promise<OrganizationsRecord[]> {
    return (await this.repository.findAll()) as unknown as OrganizationsRecord[];
  }

  async create(data: CreateOrganizationsDto): Promise<OrganizationsRecord> {
    const created = (await this.repository.create({ ...data })) as unknown as OrganizationsRecord;
    if (this.eventBus) {
      await this.eventBus.emit(ORGANIZATIONS_EVENTS.CREATED, { id: created.id });
    }
    return created;
  }
}
