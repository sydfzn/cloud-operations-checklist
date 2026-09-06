import { describe, expect, it } from "vitest";
import type { TrpcContext } from "./_core/context";
import { appRouter } from "./routers";
import { checklistDefinitions } from "@shared/checklistData";
import { getDb } from "./db";
import { checklistRunItems, checklistRuns, customerLeads, customers, directoryUserMappings, reportPublications, reviewApprovals } from "../drizzle/schema";
import { eq } from "drizzle-orm";

function context(user: TrpcContext["user"]): TrpcContext {
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("checklist router", () => {
  it("returns the workbook-derived definitions for an authenticated operator", async () => {
    const result = await appRouter.createCaller(context({ id: 1, openId: "operator", name: "Operator", email: "operator@example.com", loginMethod: "test", role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() })).checklist.definitions();
    expect(result).toHaveLength(checklistDefinitions.length);
    expect(result[0]?.id).toBe("daily-operational");
  });

  it("protects checklist definitions from unauthenticated access", async () => {
    await expect(appRouter.createCaller(context(undefined)).checklist.definitions()).rejects.toThrow();
  });

  it("keeps customer inventory procedures administrator-only", async () => {
    const regularUser = { id: 1, openId: "operator", name: "Operator", email: "operator@example.com", loginMethod: "test", role: "user" as const, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() };
    await expect(appRouter.createCaller(context(regularUser)).customers.list()).rejects.toThrow();
    await expect(appRouter.createCaller(context(regularUser)).customers.update({ customerId: 1, name: "Customer", code: "CUST-001" })).rejects.toThrow();
  });

  it("requires authentication for customer-scoped run and governance procedures", async () => {
    const caller = appRouter.createCaller(context(undefined));
    await expect(caller.checklist.loadRun({ customerId: 1, checklistId: "daily-operational", runDate: "2026-09-02" })).rejects.toThrow();
    await expect(caller.reviews.approve({ customerId: 1, checklistId: "daily-operational", runDate: "2026-09-02" })).rejects.toThrow();
    await expect(caller.reviews.publish({ customerId: 1, checklistId: "daily-operational", runDate: "2026-09-02" })).rejects.toThrow();
  });

  it("rejects an authenticated user without an assignment to the requested customer", async () => {
    const regularUser = { id: 991, openId: "unassigned", name: "Unassigned", email: "unassigned@example.com", loginMethod: "test", role: "user" as const, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() };
    const caller = appRouter.createCaller(context(regularUser));
    await expect(caller.checklist.loadRun({ customerId: 999999, checklistId: "daily-operational", runDate: "2026-09-02" })).rejects.toThrow("not assigned");
    await expect(caller.reviews.status({ customerId: 999999, checklistId: "daily-operational", runDate: "2026-09-02" })).rejects.toThrow("not assigned");
  }, 15000);

  it("allows assigned lead, operator, and customer viewer reads while limiting writes", async () => {
    const db = await getDb();
    if (!db) return;
    const suffix = Date.now();
    const customer = await db.insert(customers).values({ name: "Role Matrix Fixture", code: `ROLE-${suffix}` }).$returningId();
    const customerId = customer[0]?.id;
    if (!customerId) return;
    const emails = [`lead-${suffix}@example.com`, `operator-${suffix}@example.com`, `viewer-${suffix}@example.com`];
    let createdRunId: number | undefined;
    try {
      await db.insert(customerLeads).values(emails.map((directoryEmail) => ({ customerId, userId: 0, directoryEmail, displayName: directoryEmail.split("@")[0], role: "primary" as const, active: 1 })));
      const users = emails.map((email, index) => ({ id: 1100 + index, openId: `role-fixture-${suffix}-${index}`, name: email, email, loginMethod: "test", role: (index === 0 ? "lead" : index === 1 ? "operator" : "customer_viewer") as const, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() }));
      for (const user of users) {
        const caller = appRouter.createCaller(context(user));
        const run = await caller.checklist.loadRun({ customerId, checklistId: "daily-operational", runDate: "2026-09-02" });
        expect(run.items).toEqual([]);
        const history = await caller.reviews.history({ customerId });
        expect(Array.isArray(history)).toBe(true);
      }
      const operatorWrite = await appRouter.createCaller(context(users[1])).checklist.saveItem({ customerId, checklistId: "daily-operational", runDate: "2026-09-02", itemId: "health", status: "done", remarks: "Verified by seeded operator" });
      createdRunId = operatorWrite?.run?.id;
      expect(operatorWrite?.items.find((item) => item.itemId === "health")?.status).toBe("done");
      await expect(appRouter.createCaller(context(users[2])).checklist.saveItem({ customerId, checklistId: "daily-operational", runDate: "2026-09-02", itemId: "health", status: "done" })).rejects.toThrow("Permission required: checklists.write");
    } finally {
      await db.delete(reportPublications).where(eq(reportPublications.customerId, customerId));
      if (createdRunId) {
        await db.delete(checklistRunItems).where(eq(checklistRunItems.runId, createdRunId));
        await db.delete(checklistRuns).where(eq(checklistRuns.id, createdRunId));
      }
      await db.delete(customerLeads).where(eq(customerLeads.customerId, customerId));
      await db.delete(customers).where(eq(customers.id, customerId));
    }
  }, 15000);

  it("blocks an approved report when no lead approval exists", async () => {
    const admin = { id: 992, openId: "admin", name: "Admin", email: "admin@example.com", loginMethod: "test", role: "admin" as const, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() };
    await expect(appRouter.createCaller(context(admin)).reviews.publish({ customerId: 999999, checklistId: "daily-operational", runDate: "2026-09-02" })).rejects.toThrow("lead-approval-required");
  });

  it("rejects customer lead assignments without a mapped directory identity", async () => {
    const admin = { id: 993, openId: "admin-mapping", name: "Admin", email: "admin-mapping@example.com", loginMethod: "test", role: "admin" as const, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() };
    const caller = appRouter.createCaller(context(admin));
    await expect(caller.customers.create({ name: "Missing Mapping", code: `MAP-${Date.now()}`, leads: [{ role: "primary" }] })).rejects.toThrow();
    await expect(caller.customers.create({ name: "Invalid Mapping", code: `BAD-${Date.now()}`, leads: [{ directoryUserMappingId: 999999, role: "primary" }] })).rejects.toThrow("directory-user-mapping-invalid");
    await expect(caller.customers.update({ customerId: 999999, name: "Missing Mapping Update", code: `UPD-${Date.now()}`, leads: [{ role: "primary" }] })).rejects.toThrow();
    await expect(caller.customers.update({ customerId: 999999, name: "Invalid Mapping Update", code: `UPB-${Date.now()}`, leads: [{ directoryUserMappingId: 999999, role: "primary" }] })).rejects.toThrow("directory-user-mapping-invalid");
  });

  it("persists a valid mapped lead through customer update", async () => {
    const db = await getDb();
    if (!db) return;
    const suffix = Date.now();
    const mapping = await db.insert(directoryUserMappings).values({ directoryEmail: `mapped-${suffix}@example.com`, displayName: "Mapped Lead", role: "lead", active: 1 }).$returningId();
    const mappingId = mapping[0]?.id;
    const customer = await db.insert(customers).values({ name: "Mapped Lead Fixture", code: `MAPOK-${suffix}` }).$returningId();
    const customerId = customer[0]?.id;
    if (!mappingId || !customerId) return;
    try {
      const admin = { id: 994, openId: "admin-mapped-success", name: "Admin", email: "admin-mapped-success@example.com", loginMethod: "test", role: "admin" as const, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() };
      const updated = await appRouter.createCaller(context(admin)).customers.update({ customerId, name: "Mapped Lead Fixture", code: `MAPOK-${suffix}`, leads: [{ directoryUserMappingId: mappingId, role: "primary" }] });
      const saved = updated.find((entry) => entry.id === customerId);
      expect(saved?.leads[0]?.directoryUserMappingId).toBe(mappingId);
      expect(saved?.leads[0]?.displayName).toBe("Mapped Lead");
      expect(saved?.leads[0]?.directoryEmail).toBe(`mapped-${suffix}@example.com`);
    } finally {
      await db.delete(customerLeads).where(eq(customerLeads.customerId, customerId));
      await db.delete(customers).where(eq(customers.id, customerId));
      await db.delete(directoryUserMappings).where(eq(directoryUserMappings.id, mappingId));
    }
  }, 15000);

  it("enforces customers.manage create and update allow/deny outcomes", async () => {
    const admin = { id: 998, openId: "admin-crud", name: "Admin", email: "admin-crud@example.com", loginMethod: "test", role: "admin" as const, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() };
    const viewer = { ...admin, id: 999, openId: "viewer-crud", email: "viewer-crud@example.com", role: "customer_viewer" as const };
    const caller = appRouter.createCaller(context(admin));
    const created = await caller.customers.create({ name: "CRUD Role Fixture", code: `CRUD-${Date.now()}` });
    const fixture = created.find((customer) => customer.name === "CRUD Role Fixture");
    expect(fixture).toBeDefined();
    if (fixture) {
      const updated = await caller.customers.update({ customerId: fixture.id, name: "CRUD Role Fixture Updated", code: fixture.code });
      expect(updated.find((customer) => customer.id === fixture.id)?.name).toBe("CRUD Role Fixture Updated");
      await caller.customers.archive({ customerId: fixture.id });
    }
    await expect(appRouter.createCaller(context(viewer)).customers.create({ name: "Denied CRUD", code: `DENY-${Date.now()}` })).rejects.toThrow("Permission required: customers.manage");
    await expect(appRouter.createCaller(context(viewer)).customers.update({ customerId: fixture?.id ?? 1, name: "Denied Update", code: "DENY-UPD" })).rejects.toThrow("Permission required: customers.manage");
  }, 15000);

  it("enforces distinct role permissions across operations procedures", async () => {
    const viewer = { id: 995, openId: "viewer", name: "Viewer", email: "viewer@example.com", loginMethod: "test", role: "customer_viewer" as const, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() };
    const operator = { ...viewer, id: 996, openId: "operator-role", email: "operator-role@example.com", role: "operator" as const };
    const lead = { ...viewer, id: 997, openId: "lead-role", email: "lead-role@example.com", role: "lead" as const };
    const admin = { ...viewer, id: 998, openId: "admin-role", email: "admin-role@example.com", role: "admin" as const };
    expect(Array.isArray(await appRouter.createCaller(context(admin)).customers.list())).toBe(true);
    await expect(appRouter.createCaller(context(viewer)).customers.list()).rejects.toThrow("Permission required: customers.manage");
    await expect(appRouter.createCaller(context(viewer)).checklist.saveItem({ customerId: 999999, checklistId: "daily-operational", runDate: "2026-09-02", itemId: "health", status: "done" })).rejects.toThrow("Permission required: checklists.write");
    await expect(appRouter.createCaller(context(operator)).checklist.saveItem({ customerId: 999999, checklistId: "daily-operational", runDate: "2026-09-02", itemId: "health", status: "done" })).rejects.not.toThrow("Permission required");
    await expect(appRouter.createCaller(context(viewer)).reviews.approve({ customerId: 999999, checklistId: "daily-operational", runDate: "2026-09-02" })).rejects.toThrow("Permission required: reviews.approve");
    await expect(appRouter.createCaller(context(lead)).reviews.approve({ customerId: 999999, checklistId: "daily-operational", runDate: "2026-09-02" })).rejects.not.toThrow("Permission required");
    await expect(appRouter.createCaller(context(operator)).reviews.publish({ customerId: 999999, checklistId: "daily-operational", runDate: "2026-09-02" })).rejects.toThrow("Permission required: reviews.approve");
    await expect(appRouter.createCaller(context(lead)).checklist.saveItem({ customerId: 999999, checklistId: "daily-operational", runDate: "2026-09-02", itemId: "health", status: "done" })).rejects.not.toThrow("Permission required");
    await expect(appRouter.createCaller(context(viewer)).checklist.loadRun({ customerId: 999999, checklistId: "daily-operational", runDate: "2026-09-02" })).rejects.not.toThrow("Permission required");
    await expect(appRouter.createCaller(context(operator)).reviews.history({ customerId: 999999 })).rejects.not.toThrow("Permission required");
    await expect(appRouter.createCaller(context(lead)).reviews.history({ customerId: 999999 })).rejects.not.toThrow("Permission required");
    await expect(appRouter.createCaller(context(viewer)).reviews.history({ customerId: 999999 })).rejects.not.toThrow("Permission required");
  });

  it("enforces customer scope and approval gates for lifecycle reviews", async () => {
    const db = await getDb();
    if (!db) return;
    const suffix = Date.now();
    const inserted = await db.insert(customers).values({ name: "Lifecycle Gate Fixture", code: `LIFE-${suffix}` }).$returningId();
    const customerId = inserted[0]?.id;
    if (!customerId) return;
    const lead = { id: 1201, openId: `lifecycle-lead-${suffix}`, name: "Lifecycle Lead", email: `lifecycle-lead-${suffix}@example.com`, loginMethod: "test", role: "lead" as const, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() };
    try {
      await db.insert(customerLeads).values([
        { customerId, userId: lead.id, directoryEmail: lead.email, displayName: lead.name, role: "primary", active: 1 },
        { customerId, userId: 1202, directoryEmail: `lifecycle-operator-${suffix}@example.com`, displayName: "Lifecycle Operator", role: "backup", active: 1 },
      ]);
      const leadCaller = appRouter.createCaller(context(lead));
      const assignedOperator = { ...lead, id: 1202, openId: `lifecycle-operator-${suffix}`, email: `lifecycle-operator-${suffix}@example.com`, name: "Lifecycle Operator", role: "operator" as const };
      const operatorCaller = appRouter.createCaller(context(assignedOperator));
      const unassigned = { ...lead, id: 1203, openId: `lifecycle-unassigned-${suffix}`, email: `lifecycle-unassigned-${suffix}@example.com`, role: "operator" as const };
      const unassignedCaller = appRouter.createCaller(context(unassigned));
      await expect(leadCaller.checklist.loadRun({ customerId, checklistId: "lifecycle-kyc", runDate: "2026-09-02" })).resolves.toMatchObject({ items: [] });
      await expect(operatorCaller.checklist.loadRun({ customerId, checklistId: "lifecycle-transition", runDate: "2026-09-02" })).resolves.toMatchObject({ items: [] });
      await expect(operatorCaller.checklist.saveItem({ customerId, checklistId: "lifecycle-transition", runDate: "2026-09-02", itemId: "transition-001", status: "done" })).resolves.toMatchObject({ items: [{ itemId: "transition-001", status: "done" }] });
      await expect(unassignedCaller.checklist.loadRun({ customerId, checklistId: "lifecycle-kyc", runDate: "2026-09-02" })).rejects.toThrow("not assigned");
      await expect(unassignedCaller.checklist.saveItem({ customerId, checklistId: "lifecycle-transition", runDate: "2026-09-02", itemId: "transition-002", status: "done" })).rejects.toThrow("not assigned");
      const lifecycleApproval = await leadCaller.reviews.approve({ customerId, checklistId: "lifecycle-onboarding", runDate: "2026-09-02", notes: "Lifecycle gate validated" });
      expect(lifecycleApproval.approval?.status).toBe("approved");
      await expect(operatorCaller.reviews.approve({ customerId, checklistId: "lifecycle-onboarding", runDate: "2026-09-02" })).rejects.toThrow("Permission required: reviews.approve");
      await expect(operatorCaller.reviews.publish({ customerId, checklistId: "lifecycle-onboarding", runDate: "2026-09-02" })).rejects.toThrow("Permission required: reviews.approve");
      await expect(leadCaller.reviews.publish({ customerId, checklistId: "lifecycle-onboarding", runDate: "2026-09-02" })).rejects.toThrow("recipient-required");
    } finally {
      await db.delete(reviewApprovals).where(eq(reviewApprovals.customerId, customerId));
      const runs = await db.select({ id: checklistRuns.id }).from(checklistRuns).where(eq(checklistRuns.customerId, customerId));
      for (const run of runs) await db.delete(checklistRunItems).where(eq(checklistRunItems.runId, run.id));
      await db.delete(checklistRuns).where(eq(checklistRuns.customerId, customerId));
      await db.delete(customerLeads).where(eq(customerLeads.customerId, customerId));
      await db.delete(customers).where(eq(customers.id, customerId));
    }
  }, 20000);

  it("blocks an approved report when the customer has no active recipients", async () => {
    const db = await getDb();
    if (!db) return;
    const inserted = await db.insert(customers).values({ name: "Recipient Gate Fixture", code: `TEST-${Date.now()}` }).$returningId();
    const customerId = inserted[0]?.id;
    if (!customerId) return;
    try {
      await db.insert(reviewApprovals).values({ customerId, checklistId: "daily-operational", runDate: "2026-09-02", leadUserId: 992, status: "approved", approvedAt: new Date() });
      const admin = { id: 992, openId: "admin", name: "Admin", email: "admin@example.com", loginMethod: "test", role: "admin" as const, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() };
      await expect(appRouter.createCaller(context(admin)).reviews.publish({ customerId, checklistId: "daily-operational", runDate: "2026-09-02" })).rejects.toThrow("recipient-required");
    } finally {
      await db.delete(reviewApprovals).where(eq(reviewApprovals.customerId, customerId));
      await db.delete(customers).where(eq(customers.id, customerId));
    }
  });
});
