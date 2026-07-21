import type { ExtractTablesWithRelations } from "drizzle-orm";
import type { PgTransaction, PgQueryResultHKT } from "drizzle-orm/pg-core";
import { db } from "../db.js";

export type DbTransaction = PgTransaction<
  PgQueryResultHKT,
  Record<string, never>,
  ExtractTablesWithRelations<Record<string, never>>
>;

/**
 * Execute a callback inside a database transaction.
 * Automatically commits on success and rolls back on any thrown error.
 *
 * @example
 * await withTransaction(async (tx) => {
 *   await tx.insert(orders).values(orderData);
 *   await tx.insert(orderItems).values(items);
 * });
 */
export async function withTransaction<T>(
  callback: (tx: DbTransaction) => Promise<T>
): Promise<T> {
  return db.transaction(callback as Parameters<typeof db.transaction>[0]) as Promise<T>;
}
