import { checklistDefinitions, type Cadence, type ChecklistDefinition } from "./checklistData";

export type AnalyticsStatus = "open" | "done" | "blocked";
export type AnalyticsStatusMap = Record<string, AnalyticsStatus>;
export type DailySnapshot = { date: string; completion: number; health: number; open: number; blocked: number };

export function summarizeDefinition(definition: ChecklistDefinition, statusMap: AnalyticsStatusMap) {
  const done = definition.items.filter((item) => statusMap[item.id] === "done").length;
  const blocked = definition.items.filter((item) => statusMap[item.id] === "blocked").length;
  const open = definition.items.length - done - blocked;
  return { id: definition.id, name: definition.name, cadence: definition.cadence, total: definition.items.length, done, blocked, open, completionRate: definition.items.length ? Math.round((done / definition.items.length) * 100) : 0 };
}

export function getCategorySummary(statusMap: AnalyticsStatusMap, definitions = checklistDefinitions) {
  const groups = new Map<string, { category: string; total: number; done: number; blocked: number }>();
  definitions.flatMap((definition) => definition.items).forEach((item) => {
    const group = groups.get(item.category) ?? { category: item.category, total: 0, done: 0, blocked: 0 };
    group.total += 1;
    if (statusMap[item.id] === "done") group.done += 1;
    if (statusMap[item.id] === "blocked") group.blocked += 1;
    groups.set(item.category, group);
  });
  return Array.from(groups.values()).map((group) => ({ ...group, open: group.total - group.done - group.blocked, completionRate: group.total ? Math.round((group.done / group.total) * 100) : 0 })).sort((a, b) => b.total - a.total);
}

export function getCadenceSummary(statusMap: AnalyticsStatusMap, definitions = checklistDefinitions) {
  const cadenceMap = new Map<Cadence, { cadence: Cadence; total: number; done: number; blocked: number }>();
  definitions.forEach((definition) => {
    const current = cadenceMap.get(definition.cadence) ?? { cadence: definition.cadence, total: 0, done: 0, blocked: 0 };
    const summary = summarizeDefinition(definition, statusMap);
    current.total += summary.total;
    current.done += summary.done;
    current.blocked += summary.blocked;
    cadenceMap.set(definition.cadence, current);
  });
  return Array.from(cadenceMap.values()).map((entry) => ({ ...entry, open: entry.total - entry.done - entry.blocked, completionRate: entry.total ? Math.round((entry.done / entry.total) * 100) : 0 }));
}

export function getDailyTrend(statusMap: AnalyticsStatusMap, days = 14, history: DailySnapshot[] = []) {
  const total = checklistDefinitions.filter((definition) => definition.cadence === "Daily").flatMap((definition) => definition.items).length;
  const currentRate = total ? Math.round((checklistDefinitions.filter((definition) => definition.cadence === "Daily").flatMap((definition) => definition.items).filter((item) => statusMap[item.id] === "done").length / total) * 100) : 0;
  const historyMap = new Map(history.map((snapshot) => [snapshot.date, snapshot]));
  return Array.from({ length: days }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (days - 1 - index));
    const key = date.toISOString().slice(0, 10);
    const snapshot = historyMap.get(key);
    const isToday = index === days - 1;
    const weekday = date.toLocaleDateString("en-US", { weekday: "short" });
    return { label: `${weekday} ${date.getDate()}`, completion: snapshot?.completion ?? (isToday ? currentRate : null), health: snapshot?.health ?? (isToday ? currentRate : null) };
  });
}

export function getOverallSummary(statusMap: AnalyticsStatusMap) {
  const allItems = checklistDefinitions.flatMap((definition) => definition.items);
  const done = allItems.filter((item) => statusMap[item.id] === "done").length;
  const blocked = allItems.filter((item) => statusMap[item.id] === "blocked").length;
  return { total: allItems.length, done, blocked, open: allItems.length - done - blocked, completionRate: allItems.length ? Math.round((done / allItems.length) * 100) : 0 };
}
