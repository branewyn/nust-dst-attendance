import { Pool } from "@db/postgres";
import { config } from "./config.ts";

export const pool = new Pool(config.databaseUrl, 10, true);

export async function query<T>(
  sql: string,
  params: unknown[] = []
): Promise<T[]> {
  const client = await pool.connect();
  try {
    const result = await client.queryObject<T>({ text: sql, args: params });
    return result.rows;
  } finally {
    client.release();
  }
}

export async function queryOne<T>(
  sql: string,
  params: unknown[] = []
): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows[0] ?? null;
}
