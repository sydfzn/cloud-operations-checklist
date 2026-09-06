import { afterEach, describe, expect, it } from "vitest";
import { getDatabaseRuntime, isSqlServerProviderSelected } from "./database-provider";

const originalProvider = process.env.DB_PROVIDER;
const originalConnectionString = process.env.MSSQL_CONNECTION_STRING;

afterEach(() => {
  if (originalProvider === undefined) delete process.env.DB_PROVIDER;
  else process.env.DB_PROVIDER = originalProvider;
  if (originalConnectionString === undefined) delete process.env.MSSQL_CONNECTION_STRING;
  else process.env.MSSQL_CONNECTION_STRING = originalConnectionString;
});

describe("database provider seam", () => {
  it("resolves the managed repository runtime by default", async () => {
    delete process.env.DB_PROVIDER;
    delete process.env.MSSQL_CONNECTION_STRING;
    const runtime = await getDatabaseRuntime();
    expect(runtime.provider).toBe("managed_mysql");
    expect(isSqlServerProviderSelected()).toBe(false);
  });

  it("selects MSSQL without opening a connection when credentials are absent", async () => {
    process.env.DB_PROVIDER = "mssql";
    delete process.env.MSSQL_CONNECTION_STRING;
    const runtime = await getDatabaseRuntime();
    expect(runtime.provider).toBe("mssql");
    expect(runtime.configured).toBe(false);
    expect(isSqlServerProviderSelected()).toBe(true);
    await expect(runtime.execute(async () => "not-connected")).rejects.toThrow("MSSQL provider is not configured");
  });
});
