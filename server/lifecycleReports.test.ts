import { describe, expect, it, vi } from "vitest";
import { getCustomerLifecyclePublicationTemplate, getInternalLifecycleReviewTemplate } from "@shared/lifecycleReports";
import { isLifecycleReminderEligible } from "@shared/lifecycleReminders";
import { getLifecycleAssignmentSummary } from "@shared/lifecycleReports";
import { lifecycleReminderHandler } from "./lifecycle-reminders";

describe("lifecycle report templates", () => {
  it("builds a customer-ready onboarding summary", () => {
    const report = getCustomerLifecyclePublicationTemplate("lifecycle-onboarding", "Acme Bank", [
      { title: "Confirm handover", category: "Transition", status: "done" },
      { title: "Validate access", category: "Access", status: "blocked" },
      { title: "Schedule review", category: "Governance", status: "open" },
    ]);
    expect(report.subject).toContain("Acme Bank");
    expect(report.title).toBe("Managed Services Onboarding");
    expect(report.summary).toBe("1 complete · 1 open · 1 blocked");
    expect(report.sections).toHaveLength(3);
    const internal = getInternalLifecycleReviewTemplate("lifecycle-onboarding", "Acme Bank", []);
    expect(internal.subject).toContain("[Internal]");
    expect(internal.sections[0].heading).toBe("Lead review controls");
  });

  it("summarizes lifecycle assignment visibility for customer inventory", () => {
    const summary = getLifecycleAssignmentSummary([{ checklistId: "lifecycle-kyc" }, { checklistId: "daily-operational" }]);
    expect(summary).toHaveLength(4);
    expect(summary.find((section) => section.id === "kyc")?.enabled).toBe(true);
    expect(summary.find((section) => section.id === "transition")?.enabled).toBe(false);
  });

  it("keeps the reminder endpoint cron-only", async () => {
    const response = { status: vi.fn().mockReturnThis(), json: vi.fn() } as unknown as import("express").Response;
    await lifecycleReminderHandler({ headers: {} } as import("express").Request, response);
    expect(response.status).toHaveBeenCalledWith(403);
  });

  it("only reminds for due or overdue controls that are not complete", () => {
    expect(isLifecycleReminderEligible("2026-09-01", "open", "2026-09-03")).toBe(true);
    expect(isLifecycleReminderEligible("2026-09-04", "open", "2026-09-03")).toBe(false);
    expect(isLifecycleReminderEligible("2026-09-01", "done", "2026-09-03")).toBe(false);
  });
});
