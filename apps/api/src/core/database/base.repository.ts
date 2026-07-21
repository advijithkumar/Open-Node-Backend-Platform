import { eq, and, isNull } from "drizzle-orm";
import type { PgTable, TableConfig } from "drizzle-orm/pg-core";
import { db } from "./db.js";

export class BaseRepository<TTable extends PgTable<TableConfig>> {
  constructor(
    protected readonly table: TTable,
    protected readonly dbInstance = db
  ) {}

  async findById(idVal: string): Promise<Record<string, unknown> | undefined> {
    const tableObj = this.table as Record<string, unknown>;
    const results = await (this.dbInstance as unknown as { select: () => { from: (t: unknown) => { where: (w: unknown) => { limit: (l: number) => Promise<unknown[]> } } } })
      .select()
      .from(this.table)
      .where(and(eq(tableObj.id as any, idVal), isNull(tableObj.deletedAt as any)))
      .limit(1);

    return results[0] as Record<string, unknown> | undefined;
  }

  async findAll(limit = 50, offset = 0): Promise<Record<string, unknown>[]> {
    const tableObj = this.table as Record<string, unknown>;
    const results = await (this.dbInstance as unknown as { select: () => { from: (t: unknown) => { where: (w: unknown) => { limit: (l: number) => { offset: (o: number) => Promise<unknown[]> } } } } })
      .select()
      .from(this.table)
      .where(isNull(tableObj.deletedAt as any))
      .limit(limit)
      .offset(offset);

    return results as Record<string, unknown>[];
  }

  async create(data: Record<string, unknown>): Promise<Record<string, unknown>> {
    const results = await (this.dbInstance as unknown as { insert: (t: unknown) => { values: (v: unknown) => { returning: () => Promise<unknown[]> } } })
      .insert(this.table)
      .values(data)
      .returning();
    return results[0] as Record<string, unknown>;
  }

  async update(idVal: string, data: Record<string, unknown>): Promise<Record<string, unknown>> {
    const tableObj = this.table as Record<string, unknown>;
    const results = await (this.dbInstance as unknown as { update: (t: unknown) => { set: (v: unknown) => { where: (w: unknown) => { returning: () => Promise<unknown[]> } } } })
      .update(this.table)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(tableObj.id as any, idVal), isNull(tableObj.deletedAt as any)))
      .returning();
    return results[0] as Record<string, unknown>;
  }

  async softDelete(idVal: string): Promise<boolean> {
    const tableObj = this.table as Record<string, unknown>;
    const results = await (this.dbInstance as unknown as { update: (t: unknown) => { set: (v: unknown) => { where: (w: unknown) => { returning: () => Promise<unknown[]> } } } })
      .update(this.table)
      .set({ deletedAt: new Date(), isActive: false })
      .where(and(eq(tableObj.id as any, idVal), isNull(tableObj.deletedAt as any)))
      .returning();
    return results.length > 0;
  }
}
