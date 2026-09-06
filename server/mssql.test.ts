import { afterEach, describe, expect, it } from "vitest";
import { getDatabaseProvider, getMssqlRuntimeConfig } from "./mssql";

const originalProvider = process.env.DB_PROVIDER;
const originalConnectionString = process.env.MSSQL_CONNECTION_STRING;

afterEach(() => {
  if (originalProvider === undefined) delete process.env.DB_PROVIDER;
  else process.env.DB_PROVIDER = originalProvider;
  if (originalConnectionString === undefined) delete process.env.MSSQL_CONNECTION_STRING;
  else process.env.MSSQL_CONNECTION_STRING = originalConnectionString;
});

describe("optional MSSQL provider configuration", () => {
  it("keeps the managed database as the default provider", () => {
    delete process.env.DB_PROVIDER;
    delete process.env.MSSQL_CONNECTION_STRING;
    expect(getDatabaseProvider()).toBe("managed_mysql");
    expect(getMssqlRuntimeConfig()).toMatchObject({ provider: "managed_mysql", configured: false, connectionString: "" });
  });

  it("recognizes a configured MSSQL connection without enabling Entra", () => {
    process.env.DB_PROVIDER = "mssql";
    process.env.MSSQL_CONNECTION_STRING = "Server=localhost\\SQLEXPRESS;Database=CloudOperations;Trusted_Connection=True;TrustServerCertificate=True";
    expect(getDatabaseProvider()).toBe("mssql");
    expect(getMssqlRuntimeConfig()).toMatchObject({ provider: "mssql", configured: true });
  });

  it("ignores unsupported provider values and remains safe when the connection is blank", () => {
    process.env.DB_PROVIDER = "postgres";
    process.env.MSSQL_CONNECTION_STRING = "  ";
    expect(getDatabaseProvider()).toBe("managed_mysql");
    expect(getMssqlRuntimeConfig().configured).toBe(false);
  });
});
