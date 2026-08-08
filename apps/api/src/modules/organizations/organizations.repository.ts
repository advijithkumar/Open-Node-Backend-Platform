import { BaseRepository } from "../../core/database/base.repository.js";
import { organizationsTable } from "./organizations.schema.js";

export class OrganizationsRepository extends BaseRepository<typeof organizationsTable> {
  constructor() {
    super(organizationsTable);
  }
}
