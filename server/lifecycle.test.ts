import { describe, expect, it } from "vitest";
import { lifecycleChecklistSections } from "@shared/lifecycleData";

describe("managed services lifecycle checklist catalog", () => {
  it("contains the four separate customer lifecycle sections", () => {
    expect(lifecycleChecklistSections.map((section) => section.id)).toEqual(["kyc", "transition", "onboarding", "operational_readiness"]);
    expect(lifecycleChecklistSections.map((section) => section.items.length)).toEqual([25, 42, 63, 29]);
  });

  it("preserves actionable source tasks with stable identities", () => {
    const allItems = lifecycleChecklistSections.flatMap((section) => section.items);
    expect(allItems).toHaveLength(159);
    expect(new Set(allItems.map((item) => item.id)).size).toBe(159);
    expect(allItems.every((item) => item.title.length > 0 && item.category.length > 0)).toBe(true);
  });
});
