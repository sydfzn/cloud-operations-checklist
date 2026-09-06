import { describe, expect, it } from "vitest";
import { isAssignedLead, publicationEligibility } from "@shared/governance";

describe("governance rules", () => {
  const leads = [{ userId: 12, directoryEmail: "lead@company.com", active: 1 }, { userId: 18, directoryEmail: "backup@company.com", active: 1 }];

  it("allows an active assigned lead by user id or directory email", () => {
    expect(isAssignedLead(leads, 12, null)).toBe(true);
    expect(isAssignedLead(leads, 99, "LEAD@COMPANY.COM")).toBe(true);
    expect(isAssignedLead(leads, 99, "other@company.com")).toBe(false);
  });

  it("requires approval and a recipient before publication", () => {
    expect(publicationEligibility("pending", 2, false)).toEqual({ allowed: false, reason: "lead-approval-required" });
    expect(publicationEligibility("approved", 0, false)).toEqual({ allowed: false, reason: "recipient-required" });
    expect(publicationEligibility("approved", 2, true)).toEqual({ allowed: false, reason: "already-published" });
    expect(publicationEligibility("approved", 2, false)).toEqual({ allowed: true });
  });
});
