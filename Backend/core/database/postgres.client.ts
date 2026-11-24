import { Pool, type PoolClient, type QueryResult, type QueryResultRow } from "pg";
import { env } from "../config/env.js";

const isRenderOrRemoteSsl =
  env.DB_SSL ||
  env.DATABASE_URL.includes("render.com") ||
  env.DATABASE_URL.includes("sslmode=require");

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: isRenderOrRemoteSsl ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
});

pool.on("error", (err) => {
  console.error("[PostgreSQL Pool] Erro inesperado em cliente ocioso:", err);
});

/**
 * Executes a parameterized SQL query against the shared PostgreSQL connection pool.
 */
export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: readonly unknown[] = [],
): Promise<QueryResult<T>> {
  return pool.query<T>(text, [...params]);
}

/**
 * Runs an operation inside an explicit ACID database transaction (`BEGIN` / `COMMIT` / `ROLLBACK`).
 */
export async function withTransaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Verifies live database connectivity via `SELECT 1` and measures query latency in milliseconds.
 */
export async function checkDatabaseHealth(): Promise<{ connected: boolean; latencyMs: number }> {
  const start = Date.now();
  try {
    await pool.query("SELECT 1");
    return {
      connected: true,
      latencyMs: Date.now() - start,
    };
  } catch {
    return {
      connected: false,
      latencyMs: Date.now() - start,
    };
  }
}
