import sql from "mssql";

export type DatabaseProvider = "managed_mysql" | "mssql";

export interface MssqlRuntimeConfig {
  provider: DatabaseProvider;
  configured: boolean;
  connectionString: string;
}

let poolPromise: Promise<sql.ConnectionPool> | undefined;

export function getDatabaseProvider(): DatabaseProvider {
  return process.env.DB_PROVIDER === "mssql" ? "mssql" : "managed_mysql";
}

export function getMssqlRuntimeConfig(): MssqlRuntimeConfig {
  const connectionString = process.env.MSSQL_CONNECTION_STRING?.trim() ?? "";
  return {
    provider: getDatabaseProvider(),
    configured: Boolean(connectionString),
    connectionString,
  };
}

export async function getMssqlPool(): Promise<sql.ConnectionPool | null> {
  const config = getMssqlRuntimeConfig();
  if (!config.configured) return null;
  if (!poolPromise) {
    poolPromise = sql.connect(config.connectionString).catch((error) => {
      poolPromise = undefined;
      throw error;
    });
  }
  return poolPromise;
}

export async function closeMssqlPool(): Promise<void> {
  if (!poolPromise) return;
  const pool = await poolPromise;
  poolPromise = undefined;
  await pool.close();
}
