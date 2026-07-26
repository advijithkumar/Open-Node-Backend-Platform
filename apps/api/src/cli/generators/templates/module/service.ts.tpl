import type { {{pascalName}}Repository } from "./{{normalizedName}}.repository.js";
import type { EventBus } from "../../core/events/index.js";
import { {{upperName}}_EVENTS } from "./{{normalizedName}}.events.js";
import type { Create{{pascalName}}Dto, {{pascalName}}Record } from "./{{normalizedName}}.types.js";

export class {{pascalName}}Service {
  constructor(
    private readonly repository: {{pascalName}}Repository,
    private readonly eventBus?: EventBus
  ) {}

  async findAll(): Promise<{{pascalName}}Record[]> {
    return (await this.repository.findAll()) as unknown as {{pascalName}}Record[];
  }

  async create(data: Create{{pascalName}}Dto): Promise<{{pascalName}}Record> {
    const created = (await this.repository.create({ ...data })) as unknown as {{pascalName}}Record;
    if (this.eventBus) {
      await this.eventBus.emit({{upperName}}_EVENTS.CREATED, { id: created.id });
    }
    return created;
  }
}
