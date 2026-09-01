import { BaseRepository } from "../../core/database/base.repository.js";
import { usersModuleTable } from "./users-module.schema.js";

export class UsersModuleRepository extends BaseRepository<typeof usersModuleTable> {
  constructor() {
    super(usersModuleTable);
  }
}
