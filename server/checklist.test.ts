import { describe, expect, it } from "vitest";
import { allChecklistItems, cadenceOrder, checklistDefinitions, getChecklistDefinition } from "@shared/checklistData";
import { getCadenceSummary, getCategorySummary, getDailyTrend, getOverallSummary, summarizeDefinition } from "@shared/analytics";

describe("cloud operations checklist catalog", () => {
  it("includes every workbook cadence and all 17 source sections", () => {
    expect(checklistDefinitions).toHaveLength(17);
    expect(new Set(checklistDefinitions.map((definition) => definition.cadence))).toEqual(new Set(cadenceOrder));
    expect(allChecklistItems.length).toBeGreaterThan(200);
  });

  it("keeps item identifiers unique and attached to a checklist", () => {
    const ids = allChecklistItems.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(allChecklistItems.every((item) => item.checklistId && item.checklistName && item.activity)).toBe(true);
  });

  it("falls back to the primary daily checklist for an unknown id", () => {
    expect(getChecklistDefinition("does-not-exist").id).toBe("daily-operational");
  });

  it("aggregates completion by definition, category, cadence, and overall state", () => {
    const statuses = { "daily-operational-1": "done", "daily-operational-2": "blocked" } as const;
    const definition = summarizeDefinition(checklistDefinitions[0], statuses);
    expect(definition.done).toBe(1);
    expect(definition.blocked).toBe(1);
    expect(getOverallSummary(statuses).done).toBe(1);
    expect(getCategorySummary(statuses).some((entry) => entry.category === "Operations" && entry.done === 1)).toBe(true);
    expect(getCadenceSummary(statuses).find((entry) => entry.cadence === "Daily")?.done).toBe(1);
  });

  it("returns a bounded daily trend with the current rate at the end", () => {
    const trend = getDailyTrend({ "daily-operational-1": "done" }, 7);
    expect(trend).toHaveLength(7);
    expect(trend.every((point) => point.completion >= 0 && point.completion <= 100)).toBe(true);
  });
});
