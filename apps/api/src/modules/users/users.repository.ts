import { eq, and, isNull } from "drizzle-orm";
import { BaseRepository } from "../../core/database/base.repository.js";
import { users } from "./users.schema.js";
import { db } from "../../core/database/db.js";
import type { UserRecord } from "./users.types.js";

export class UserRepository extends BaseRepository<typeof users> {
  constructor() {
    super(users);
  }

  async findByEmail(email: string): Promise<UserRecord | undefined> {
    const results = await db
      .select()
      .from(this.table)
      .where(and(eq(users.email, email), isNull(users.deletedAt)))
      .limit(1);

    return results[0] as UserRecord | undefined;
  }

  async findUserById(idVal: string): Promise<UserRecord | undefined> {
    const record = await this.findById(idVal);
    return record as unknown as UserRecord;
  }

  async findAllUsers(limit = 50, offset = 0): Promise<UserRecord[]> {
    const results = await this.findAll(limit, offset);
    return results as unknown as UserRecord[];
  }

  async createUser(data: { firstName: string; lastName: string; username: string; email: string; authUserId: string }): Promise<UserRecord> {
    const record = await this.create(data as Record<string, unknown>);
    return record as unknown as UserRecord;
  }

  async updateUser(idVal: string, data: { firstName?: string; lastName?: string; username?: string; email?: string }): Promise<UserRecord> {
    const record = await this.update(idVal, data as Record<string, unknown>);
    return record as unknown as UserRecord;
  }

  async deleteUser(idVal: string): Promise<boolean> {
    return this.softDelete(idVal);
  }

  async restore(idVal: string): Promise<UserRecord> {
    const results = await db
      .update(this.table)
      .set({ deletedAt: null, isActive: true, updatedAt: new Date() })
      .where(eq(users.id, idVal))
      .returning();

    return results[0] as unknown as UserRecord;
  }
}
export default UserRepository;
