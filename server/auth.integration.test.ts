import { describe, expect, it } from "vitest";
import { buildEntraAuthorizeUrl, getEntraConfig } from "./entra";
import { canApproveReviews, canManageCustomers, canOperateChecklists, normalizeAppRole } from "@shared/rbac";

describe("deferred Entra configuration", () => {
  it("reports missing values without enabling live sign-in", () => {
    const config = getEntraConfig({});
    expect(config.configured).toBe(false);
    expect(config.missing).toEqual(["ENTRA_TENANT_ID", "ENTRA_CLIENT_ID", "ENTRA_CLIENT_SECRET", "ENTRA_REDIRECT_URI"]);
  });

  it("builds a tenant-specific authorization URL when configured", () => {
    const config = getEntraConfig({ ENTRA_TENANT_ID: "tenant-123", ENTRA_CLIENT_ID: "client-123", ENTRA_CLIENT_SECRET: "secret", ENTRA_REDIRECT_URI: "https://portal.example.com/auth/entra/callback" });
    expect(config.configured).toBe(true);
    expect(buildEntraAuthorizeUrl(config, "csrf-state")).toContain("login.microsoftonline.com/tenant-123/oauth2/v2.0/authorize");
  });
});

describe("application roles", () => {
  it("keeps administrative and approval permissions separate", () => {
    expect(canManageCustomers("admin")).toBe(true);
    expect(canManageCustomers("lead")).toBe(false);
    expect(canApproveReviews("lead")).toBe(true);
    expect(canApproveReviews("operator")).toBe(false);
    expect(canOperateChecklists("operator")).toBe(true);
    expect(normalizeAppRole("user")).toBe("operator");
  });
});
