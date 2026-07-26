import { BaseRepository } from "../../core/database/base.repository.js";
import { {{camelName}}Table } from "./{{normalizedName}}.schema.js";

export class {{pascalName}}Repository extends BaseRepository<typeof {{camelName}}Table> {
  constructor() {
    super({{camelName}}Table);
  }
}
