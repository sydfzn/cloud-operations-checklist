export function isLifecycleReminderEligible(dueDate: string | null | undefined, currentStatus: "open" | "done" | "blocked" | undefined, asOf: string): boolean {
  if (!dueDate || dueDate > asOf) return false;
  return currentStatus !== "done";
}
