import { afterEach, describe, expect, it } from "vitest";
import { getOperationsRepository, setOperationsRepositoryForTests } from "./database-provider";
import type { OperationsRepository } from "./repository";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const calls: string[] = [];
const fakeRepository: OperationsRepository = {
  listCustomers: async () => { calls.push("customers.list"); return [{ id: 7, name: "MSSQL Fixture" }]; },
  loadChecklistRun: async () => { calls.push("checklist.loadRun"); return { run: { id: 11 }, items: [{ itemId: "health", status: "done" }] }; },
  saveChecklistItem: async () => { calls.push("checklist.saveItem"); return { run: { id: 11 }, items: [{ itemId: "health", status: "done" }] }; },
  getReviewStatus: async () => { calls.push("reviews.status"); return { approval: { status: "approved" }, publication: undefined }; },
  getPublicationHistory: async () => { calls.push("reviews.history"); return [{ id: 19, status: "queued" }]; },
};

function adminContext(): TrpcContext {
  return {
    user: { id: 700, openId: "mssql-router-admin", name: "MSSQL Admin", email: "mssql-router@example.com", loginMethod: "test", role: "admin", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

afterEach(() => setOperationsRepositoryForTests());

describe("provider-backed repository contract", () => {
  it("routes representative operations through an injected MSSQL repository", async () => {
    calls.length = 0;
    setOperationsRepositoryForTests(fakeRepository);
    const repository = await getOperationsRepository();

    await expect(repository.listCustomers()).resolves.toEqual([{ id: 7, name: "MSSQL Fixture" }]);
    await expect(repository.loadChecklistRun({ userId: 1, customerId: 7, checklistId: "daily-operational", runDate: "2026-09-03" })).resolves.toMatchObject({ items: [{ itemId: "health", status: "done" }] });
    await expect(repository.saveChecklistItem({ userId: 1, customerId: 7, checklistId: "daily-operational", runDate: "2026-09-03", itemId: "health", status: "done" })).resolves.toMatchObject({ run: { id: 11 } });
    await expect(repository.getReviewStatus({ customerId: 7, checklistId: "daily-operational", runDate: "2026-09-03" })).resolves.toMatchObject({ approval: { status: "approved" } });
    await expect(repository.getPublicationHistory({ customerId: 7 })).resolves.toEqual([{ id: 19, status: "queued" }]);
  });

  it("routes RPC calls through the injected provider contract", async () => {
    calls.length = 0;
    setOperationsRepositoryForTests(fakeRepository);
    const caller = appRouter.createCaller(adminContext());
    await expect(caller.customers.list()).resolves.toEqual([{ id: 7, name: "MSSQL Fixture" }]);
    await expect(caller.checklist.loadRun({ customerId: 7, checklistId: "daily-operational", runDate: "2026-09-03" })).resolves.toMatchObject({ run: { id: 11 } });
    await expect(caller.checklist.saveItem({ customerId: 7, checklistId: "daily-operational", runDate: "2026-09-03", itemId: "health", status: "done" })).resolves.toMatchObject({ items: [{ status: "done" }] });
    await expect(caller.reviews.status({ customerId: 7, checklistId: "daily-operational", runDate: "2026-09-03" })).resolves.toMatchObject({ approval: { status: "approved" } });
    await expect(caller.checklist.loadRun({ customerId: 7, checklistId: "lifecycle-kyc", runDate: "2026-09-03" })).resolves.toMatchObject({ run: { id: 11 } });
    await expect(caller.checklist.saveItem({ customerId: 7, checklistId: "lifecycle-transition", runDate: "2026-09-03", itemId: "transition-001", status: "done" })).resolves.toMatchObject({ items: [{ status: "done" }] });
    await expect(caller.reviews.status({ customerId: 7, checklistId: "lifecycle-onboarding", runDate: "2026-09-03" })).resolves.toMatchObject({ approval: { status: "approved" } });
    await expect(caller.reviews.history({ customerId: 7 })).resolves.toEqual([{ id: 19, status: "queued" }]);
    expect(calls).toEqual(["customers.list", "checklist.loadRun", "checklist.saveItem", "reviews.status", "checklist.loadRun", "checklist.saveItem", "reviews.status", "reviews.history"]);
  });
});
