import { BaseRepository } from "../../core/database/base.repository.js";
import { authModuleTable } from "./auth-module.schema.js";

export class AuthModuleRepository extends BaseRepository<typeof authModuleTable> {
  constructor() {
    super(authModuleTable);
  }
}
