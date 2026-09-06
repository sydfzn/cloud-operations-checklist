import { lifecycleChecklistSections } from "./lifecycleData";

export function getLifecycleAssignmentSummary(assignments: Array<{ checklistId: string }>) {
  return lifecycleChecklistSections.map((section) => ({ id: section.id, label: section.label, controlCount: section.items.length, enabled: assignments.some((assignment) => assignment.checklistId === `lifecycle-${section.id}`) }));
}

export type LifecycleReportRow = { title: string; category: string; status: "open" | "done" | "blocked"; dueDate?: string | null; owner?: string | null; remarks?: string | null };

export function getLifecycleReportTemplate(checklistId: string, customerName: string, rows: LifecycleReportRow[]) {
  return getCustomerLifecyclePublicationTemplate(checklistId, customerName, rows);
}

export function getInternalLifecycleReviewTemplate(checklistId: string, customerName: string, rows: LifecycleReportRow[]) {
  const report = getCustomerLifecyclePublicationTemplate(checklistId, customerName, rows);
  return { ...report, subject: `[Internal] ${report.subject}`, sections: [{ heading: "Lead review controls", body: "Internal use only. Confirm evidence, exceptions, due dates, and owner accountability before approval." }, ...report.sections] };
}

export function getCustomerLifecyclePublicationTemplate(checklistId: string, customerName: string, rows: LifecycleReportRow[]) {
  const sectionId = checklistId.replace(/^lifecycle-/, "") as (typeof lifecycleChecklistSections)[number]["id"];
  const section = lifecycleChecklistSections.find((entry) => entry.id === sectionId);
  const done = rows.filter((row) => row.status === "done").length;
  const blocked = rows.filter((row) => row.status === "blocked").length;
  const open = rows.filter((row) => row.status === "open").length;
  return {
    subject: `${section?.label ?? "Lifecycle review"} report · ${customerName}`,
    title: section?.label ?? "Managed services lifecycle review",
    customerName,
    summary: `${done} complete · ${open} open · ${blocked} blocked`,
    sections: [
      { heading: "Executive summary", body: `${customerName} has ${done} completed control points in this lifecycle review. ${blocked ? `${blocked} controls are blocked and require attention.` : "No controls are currently blocked."}` },
      { heading: "Control point detail", rows },
      { heading: "Approval statement", body: "This report is eligible for customer publication only after the assigned cloud operations lead approves the review." },
    ],
  };
}
