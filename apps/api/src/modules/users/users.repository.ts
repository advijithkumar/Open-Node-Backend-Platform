import { eq, and, isNull } from "drizzle-orm";
import { BaseRepository } from "../../core/database/base.repository.js";
import { users } from "../../core/database/schema/onbp/user.schema.js";

export class UserRepository extends BaseRepository<typeof users> {
  constructor() {
    super(users);
  }

  async findByEmail(email: string): Promise<Record<string, unknown> | undefined> {
    const results = await (this.dbInstance as unknown as { select: () => { from: (t: unknown) => { where: (w: unknown) => { limit: (l: number) => Promise<unknown[]> } } } })
      .select()
      .from(this.table)
      .where(and(eq(this.table.email, email), isNull(this.table.deletedAt)))
      .limit(1);

    return results[0] as Record<string, unknown> | undefined;
  }
}
