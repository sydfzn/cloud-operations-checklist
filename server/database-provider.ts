import { getDatabaseProvider, getMssqlPool, type DatabaseProvider } from "./mssql";
import { getDb } from "./db";
import { createManagedRepository, createMssqlRepository, type OperationsRepository } from "./repository";

export interface DatabaseRuntime {
  provider: DatabaseProvider;
  configured: boolean;
  execute<T>(operation: (connection: unknown) => Promise<T>): Promise<T>;
}

/**
 * Resolves the persistence backend without changing the repository contracts
 * consumed by routers. MSSQL remains opt-in until DB_PROVIDER=mssql and
 * MSSQL_CONNECTION_STRING are supplied.
 */
export async function getDatabaseRuntime(): Promise<DatabaseRuntime> {
  const provider = getDatabaseProvider();

  if (provider === "mssql") {
    const pool = await getMssqlPool();
    return {
      provider,
      configured: Boolean(pool),
      execute: async <T>(operation: (connection: unknown) => Promise<T>) => {
        if (!pool) throw new Error("MSSQL provider is not configured");
        return operation(pool);
      },
    };
  }

  const managedDb = await getDb();
  return {
    provider,
    configured: Boolean(managedDb),
    execute: async <T>(operation: (connection: unknown) => Promise<T>) => {
      if (!managedDb) throw new Error("Managed database is not configured");
      return operation(managedDb);
    },
  };
}

export function isSqlServerProviderSelected(): boolean {
  return getDatabaseProvider() === "mssql";
}

let repositoryOverride: OperationsRepository | undefined;

export function setOperationsRepositoryForTests(repository?: OperationsRepository): void {
  repositoryOverride = repository;
}

export async function getOperationsRepository(): Promise<OperationsRepository> {
  if (repositoryOverride) return repositoryOverride;
  if (isSqlServerProviderSelected()) {
    const pool = await getMssqlPool();
    if (!pool) throw new Error("MSSQL provider is not configured");
    return createMssqlRepository(pool);
  }
  return createManagedRepository();
}
