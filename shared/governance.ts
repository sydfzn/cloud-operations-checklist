export type LeadIdentity = { userId: number; directoryEmail?: string | null; active?: number };

export function isAssignedLead(leads: LeadIdentity[], userId: number, email?: string | null) {
  const normalizedEmail = email?.trim().toLowerCase() ?? "";
  return leads.some((lead) => lead.active !== 0 && (lead.userId === userId || Boolean(normalizedEmail) && lead.directoryEmail?.trim().toLowerCase() === normalizedEmail));
}

export function publicationEligibility(approvalStatus: "pending" | "approved" | "rejected" | undefined, recipientCount: number, alreadyPublished: boolean) {
  if (alreadyPublished) return { allowed: false, reason: "already-published" as const };
  if (approvalStatus !== "approved") return { allowed: false, reason: "lead-approval-required" as const };
  if (recipientCount < 1) return { allowed: false, reason: "recipient-required" as const };
  return { allowed: true as const };
}
