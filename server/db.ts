
import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { adminSettings, checklistRunItems, checklistRuns, customerAccounts, customerChecklistAssignments, customerLeads, customers, directoryUserMappings, escalations, InsertUser, lifecycleControlMetadata, reportPublications, reportRecipients, reviewApprovals, users } from "../drizzle/schema";
import { ENV } from './_core/env';
import { isAssignedLead, publicationEligibility } from "@shared/governance";
import type { AppRole } from "@shared/rbac";
import { isLifecycleReminderEligible } from "@shared/lifecycleReminders";

// Infer the customer row type from the schema
type CustomerRow = typeof customers.$inferSelect;

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

async function requireDb() {
  const db = await getDb();
  if (!db) throw new Error("database-unavailable");
  return db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await requireDb();

  try {
    const existing = await db.select().from(users).where(eq(users.openId, user.openId)).limit(1);

    const textFields = ["name", "email", "loginMethod"] as const;

    if (existing[0]) {
      const updateSet: Record<string, unknown> = {};
      for (const field of textFields) {
        const value = user[field];
        if (value !== undefined) updateSet[field] = value ?? null;
      }
      if (user.lastSignedIn !== undefined) updateSet.lastSignedIn = user.lastSignedIn;
      if (user.role !== undefined) updateSet.role = user.role;
      if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
      await db.update(users).set(updateSet).where(eq(users.openId, user.openId));
    } else {
      const values: InsertUser = { openId: user.openId };
      for (const field of textFields) {
        const value = user[field];
        if (value !== undefined) (values as Record<string, unknown>)[field] = value ?? null;
      }
      if (user.lastSignedIn !== undefined) values.lastSignedIn = user.lastSignedIn;
      if (!values.lastSignedIn) values.lastSignedIn = new Date();
      if (user.role !== undefined) {
        values.role = user.role;
      } else if (user.openId === ENV.ownerOpenId) {
        values.role = 'admin';
      }
      await db.insert(users).values(values);
    }
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function assertCustomerWorkspaceAccess(userId: number, customerId: number, role: "user" | "admin" | AppRole, email?: string | null) {
  if (role === "admin") return;
  const db = await requireDb();
  const leads = await db.select().from(customerLeads).where(and(eq(customerLeads.customerId, customerId), eq(customerLeads.active, 1)));
  if (!isAssignedLead(leads, userId, email)) throw new Error("You are not assigned to this customer workspace");
}

export async function getChecklistRun(userId: number, customerId: number, checklistId: string, runDate: string, role: "user" | "admin" | AppRole = "user", email?: string | null) {
  const db = await requireDb();
  if (role !== "admin") {
    const leads = await db.select().from(customerLeads).where(and(eq(customerLeads.customerId, customerId), eq(customerLeads.active, 1)));
    if (!isAssignedLead(leads, userId, email)) throw new Error("You are not assigned to this customer workspace");
  }
  const runs = await db.select().from(checklistRuns).where(and(eq(checklistRuns.userId, userId), eq(checklistRuns.customerId, customerId), eq(checklistRuns.checklistId, checklistId), eq(checklistRuns.runDate, runDate))).limit(1);
  if (!runs[0]) return { run: undefined, items: [] };
  const items = await db.select().from(checklistRunItems).where(eq(checklistRunItems.runId, runs[0].id));
  return { run: runs[0], items };
}

export async function getCustomers() {
  const db = await requireDb();
  const rows = await db.select().from(customers).orderBy(desc(customers.name));
  return Promise.all(rows.map(async (customer: CustomerRow) => ({
    ...customer,
    accounts: await getCustomerAccounts(customer.id),
    leads: await getCustomerLeads(customer.id),
    recipients: await getReportRecipients(customer.id),
    assignments: await getCustomerAssignments(customer.id),
  })));
}

async function resolveMappedLeadRows(db: ReturnType<typeof drizzle>, customerId: number, leads: Array<{ directoryUserMappingId?: number | null; displayName?: string | null; directoryEmail?: string | null; role?: "primary" | "backup" }>) {
  const rows = [];
  for (const lead of leads) {
    if (!lead.directoryUserMappingId) throw new Error("directory-user-mapping-required");
    const mapping = await db.select().from(directoryUserMappings).where(and(eq(directoryUserMappings.id, lead.directoryUserMappingId), eq(directoryUserMappings.active, 1))).limit(1);
    if (!mapping[0]) throw new Error("directory-user-mapping-invalid");
    rows.push({ customerId, userId: 0, directoryUserMappingId: mapping[0].id, displayName: mapping[0].displayName, directoryEmail: mapping[0].directoryEmail, role: lead.role ?? "primary" });
  }
  return rows;
}

export async function createCustomer(input: { name: string; code: string; primaryContactName?: string | null; primaryContactEmail?: string | null; account?: { provider: string; accountName: string; accountIdentifier?: string | null; serviceScope?: string | null; environment?: string | null; region?: string | null; criticality?: "critical" | "high" | "standard" }; accounts?: Array<{ provider: string; accountName: string; accountIdentifier?: string | null; serviceScope?: string | null; environment?: string | null; region?: string | null; criticality?: "critical" | "high" | "standard" }>; lead?: { directoryUserMappingId?: number | null; displayName?: string | null; directoryEmail?: string | null; role?: "primary" | "backup" }; leads?: Array<{ directoryUserMappingId?: number | null; displayName?: string | null; directoryEmail?: string | null; role?: "primary" | "backup" }>; recipients?: Array<{ name?: string | null; email: string }>; assignments?: string[] }) {
  const db = await requireDb();
  const requestedLeads = input.leads ?? (input.lead ? [input.lead] : []);
  await resolveMappedLeadRows(db, 0, requestedLeads);
  const inserted = await db.insert(customers).values({ name: input.name, code: input.code, primaryContactName: input.primaryContactName ?? null, primaryContactEmail: input.primaryContactEmail ?? null }).$returningId();
  const customerId = inserted[0]?.id;
  if (!customerId) return getCustomers();
  const accounts = input.accounts ?? (input.account ? [input.account] : []);
  const leads = input.leads ?? (input.lead ? [input.lead] : []);
  if (accounts.length) await db.insert(customerAccounts).values(accounts.map((account) => ({ customerId, provider: account.provider, accountName: account.accountName, accountIdentifier: account.accountIdentifier ?? null, serviceScope: account.serviceScope ?? null, environment: account.environment ?? null, region: account.region ?? null, criticality: account.criticality ?? "standard" })));
  const leadRows = await resolveMappedLeadRows(db, customerId, leads);
  if (leadRows.length) await db.insert(customerLeads).values(leadRows);
  if (input.recipients?.length) await db.insert(reportRecipients).values(input.recipients.map((recipient) => ({ customerId, name: recipient.name ?? null, email: recipient.email })));
  if (input.assignments?.length) await db.insert(customerChecklistAssignments).values(input.assignments.map((checklistId) => ({ customerId, checklistId, enabled: 1 })));
  return getCustomers();
}

export async function getAssignedCustomers(userId: number, email?: string | null) {
  const all = await getCustomers();
  const normalizedEmail = email?.toLowerCase() ?? "";
  return all.filter((customer: Awaited<ReturnType<typeof getCustomers>>[number]) => customer.leads.some((lead) => lead.directoryEmail?.toLowerCase() === normalizedEmail || lead.userId === userId));
}

export async function updateCustomerSetup(customerId: number, input: { name: string; code: string; primaryContactName?: string | null; primaryContactEmail?: string | null; account?: { provider: string; accountName: string; accountIdentifier?: string | null; serviceScope?: string | null; environment?: string | null; region?: string | null; criticality?: "critical" | "high" | "standard" }; accounts?: Array<{ provider: string; accountName: string; accountIdentifier?: string | null; serviceScope?: string | null; environment?: string | null; region?: string | null; criticality?: "critical" | "high" | "standard" }>; lead?: { directoryUserMappingId?: number | null; displayName?: string | null; directoryEmail?: string | null; role?: "primary" | "backup" }; leads?: Array<{ directoryUserMappingId?: number | null; displayName?: string | null; directoryEmail?: string | null; role?: "primary" | "backup" }>; recipients?: Array<{ name?: string | null; email: string }>; assignments?: string[] }) {
  const db = await requireDb();
  const requestedLeads = input.leads ?? (input.lead ? [input.lead] : []);
  await resolveMappedLeadRows(db, 0, requestedLeads);
  await db.update(customers).set({ name: input.name, code: input.code, primaryContactName: input.primaryContactName ?? null, primaryContactEmail: input.primaryContactEmail ?? null }).where(eq(customers.id, customerId));
  await db.delete(customerAccounts).where(eq(customerAccounts.customerId, customerId));
  await db.delete(customerLeads).where(eq(customerLeads.customerId, customerId));
  await db.delete(reportRecipients).where(eq(reportRecipients.customerId, customerId));
  await db.delete(customerChecklistAssignments).where(eq(customerChecklistAssignments.customerId, customerId));
  const accounts = input.accounts ?? (input.account ? [input.account] : []);
  const leads = input.leads ?? (input.lead ? [input.lead] : []);
  if (accounts.length) await db.insert(customerAccounts).values(accounts.map((account) => ({ customerId, provider: account.provider, accountName: account.accountName, accountIdentifier: account.accountIdentifier ?? null, serviceScope: account.serviceScope ?? null, environment: account.environment ?? null, region: account.region ?? null, criticality: account.criticality ?? "standard" })));
  const leadRows = await resolveMappedLeadRows(db, customerId, leads);
  if (leadRows.length) await db.insert(customerLeads).values(leadRows);
  if (input.recipients?.length) await db.insert(reportRecipients).values(input.recipients.map((recipient) => ({ customerId, name: recipient.name ?? null, email: recipient.email })));
  if (input.assignments?.length) await db.insert(customerChecklistAssignments).values(input.assignments.map((checklistId) => ({ customerId, checklistId, enabled: 1 })));
  return getCustomers();
}

export async function archiveCustomer(customerId: number) {
  const db = await requireDb();
  await db.update(customers).set({ status: "archived" }).where(eq(customers.id, customerId));
  return getCustomers();
}

export async function getCustomerAccounts(customerId: number) {
  const db = await requireDb();
  return db.select().from(customerAccounts).where(eq(customerAccounts.customerId, customerId)).orderBy(desc(customerAccounts.createdAt));
}

export async function getCustomerLeads(customerId: number) {
  const db = await requireDb();
  return db.select().from(customerLeads).where(and(eq(customerLeads.customerId, customerId), eq(customerLeads.active, 1))).orderBy(desc(customerLeads.createdAt));
}

export async function getCustomerAssignments(customerId: number) {
  const db = await requireDb();
  return db.select().from(customerChecklistAssignments).where(and(eq(customerChecklistAssignments.customerId, customerId), eq(customerChecklistAssignments.enabled, 1))).orderBy(desc(customerChecklistAssignments.createdAt));
}

export async function getReportRecipients(customerId: number) {
  const db = await requireDb();
  return db.select().from(reportRecipients).where(and(eq(reportRecipients.customerId, customerId), eq(reportRecipients.active, 1))).orderBy(desc(reportRecipients.createdAt));
}

export async function getPublicationHistory(customerId: number, userId?: number, role: "user" | "admin" | AppRole = "admin", email?: string | null) {
  const db = await requireDb();
  if (userId && role !== "admin") {
    const leads = await db.select().from(customerLeads).where(and(eq(customerLeads.customerId, customerId), eq(customerLeads.active, 1)));
    if (!isAssignedLead(leads, userId, email)) throw new Error("You are not assigned to this customer workspace");
  }
  return db.select().from(reportPublications).where(eq(reportPublications.customerId, customerId)).orderBy(desc(reportPublications.publishedAt));
}

export async function getDirectoryUserMappings() {
  const db = await requireDb();
  return db.select().from(directoryUserMappings).where(eq(directoryUserMappings.active, 1)).orderBy(desc(directoryUserMappings.displayName));
}

export async function saveDirectoryUserMapping(input: { directoryEmail: string; displayName: string; role: "operator" | "lead" | "admin" }) {
  const db = await requireDb();
  const existing = await db.select().from(directoryUserMappings).where(eq(directoryUserMappings.directoryEmail, input.directoryEmail)).limit(1);
  if (existing[0]) {
    await db.update(directoryUserMappings).set({ displayName: input.displayName, role: input.role, active: 1, updatedAt: new Date() }).where(eq(directoryUserMappings.id, existing[0].id));
  } else {
    await db.insert(directoryUserMappings).values({ directoryEmail: input.directoryEmail, displayName: input.displayName, role: input.role, active: 1 });
  }
  return getDirectoryUserMappings();
}

export async function archiveDirectoryUserMapping(id: number) {
  const db = await requireDb();
  await db.update(directoryUserMappings).set({ active: 0 }).where(eq(directoryUserMappings.id, id));
  return getDirectoryUserMappings();
}

export async function getAdminSettings() {
  const db = await requireDb();
  const rows = await db.select().from(adminSettings).orderBy(desc(adminSettings.updatedAt));
  return Object.fromEntries(rows.map((row) => [row.settingKey, row.settingValue ?? ""]));
}

export async function saveAdminSettings(userId: number, values: Record<string, string | null>) {
  const db = await requireDb();
  for (const [settingKey, settingValue] of Object.entries(values)) {
    const existing = await db.select({ id: adminSettings.id }).from(adminSettings).where(eq(adminSettings.settingKey, settingKey)).limit(1);
    if (existing[0]) await db.update(adminSettings).set({ settingValue, updatedByUserId: userId }).where(eq(adminSettings.id, existing[0].id));
    else await db.insert(adminSettings).values({ settingKey, settingValue, updatedByUserId: userId });
  }
  return getAdminSettings();
}

export async function getReviewStatus(customerId: number, checklistId: string, runDate: string, userId?: number, role: "user" | "admin" | AppRole = "admin", email?: string | null) {
  const db = await requireDb();
  if (userId && role !== "admin") {
    const leads = await db.select().from(customerLeads).where(and(eq(customerLeads.customerId, customerId), eq(customerLeads.active, 1)));
    if (!isAssignedLead(leads, userId, email)) throw new Error("You are not assigned to this customer workspace");
  }
  const approval = await db.select().from(reviewApprovals).where(and(eq(reviewApprovals.customerId, customerId), eq(reviewApprovals.checklistId, checklistId), eq(reviewApprovals.runDate, runDate))).orderBy(desc(reviewApprovals.createdAt)).limit(1);
  const publication = await db.select().from(reportPublications).where(and(eq(reportPublications.customerId, customerId), eq(reportPublications.checklistId, checklistId), eq(reportPublications.runDate, runDate))).orderBy(desc(reportPublications.publishedAt)).limit(1);
  return { approval: approval[0], publication: publication[0] };
}

export async function approveReview(userId: number, email: string | null | undefined, input: { customerId: number; checklistId: string; runDate: string; notes?: string | null }) {
  const db = await requireDb();
  const leads = await db.select().from(customerLeads).where(and(eq(customerLeads.customerId, input.customerId), eq(customerLeads.active, 1)));
  if (!isAssignedLead(leads, userId, email)) throw new Error("Only an assigned customer operations lead can approve this review");
  await db.insert(reviewApprovals).values({ customerId: input.customerId, checklistId: input.checklistId, runDate: input.runDate, leadUserId: userId, status: "approved", notes: input.notes ?? null, approvedAt: new Date() });
  return getReviewStatus(input.customerId, input.checklistId, input.runDate, userId, "user", email);
}

export async function publishApprovedReport(userId: number, email: string | null | undefined, role: "user" | "admin" | AppRole, input: { customerId: number; checklistId: string; runDate: string }) {
  const db = await requireDb();
  if (role !== "admin") {
    const leads = await db.select().from(customerLeads).where(and(eq(customerLeads.customerId, input.customerId), eq(customerLeads.active, 1)));
    if (!isAssignedLead(leads, userId, email)) throw new Error("Only an assigned customer operations lead can publish this report");
  }
  const status = await getReviewStatus(input.customerId, input.checklistId, input.runDate, userId, role, email);
  const approval = status.approval;
  if (!approval) throw new Error("lead-approval-required");
  const recipients = await getReportRecipients(input.customerId);
  const eligibility = publicationEligibility(approval?.status, recipients.length, Boolean(status.publication));
  if (!eligibility.allowed) throw new Error(eligibility.reason);

  await db.insert(reportPublications).values({ customerId: input.customerId, checklistId: input.checklistId, runDate: input.runDate, approvalId: approval.id, publishedByUserId: userId, recipientCount: recipients.length, deliveryStatus: "queued" });
  return getReviewStatus(input.customerId, input.checklistId, input.runDate, userId, role, email);
}

export async function getEscalations(userId: number) {
  const db = await requireDb();
  return db.select().from(escalations).where(eq(escalations.userId, userId)).orderBy(desc(escalations.createdAt));
}

export async function createEscalation(userId: number, input: { owner: string; action: string; priority: "P1/P2" | "P3" | "Advisory"; dueAt?: string | null }) {
  const db = await requireDb();
  const result = await db.insert(escalations).values({ userId, owner: input.owner, action: input.action, priority: input.priority, dueAt: input.dueAt ?? null });
  return result;
}

export async function closeEscalation(userId: number, escalationId: number) {
  const db = await requireDb();
  await db.update(escalations).set({ status: "closed" }).where(and(eq(escalations.id, escalationId), eq(escalations.userId, userId)));
  return getEscalations(userId);
}

export async function saveChecklistItem(userId: number, customerId: number, checklistId: string, runDate: string, itemId: string, status: "open" | "done" | "blocked", remarks?: string | null, role: "user" | "admin" | AppRole = "user", email?: string | null) {
  const db = await requireDb();
  if (role !== "admin") {
    const leads = await db.select().from(customerLeads).where(and(eq(customerLeads.customerId, customerId), eq(customerLeads.active, 1)));
    if (!isAssignedLead(leads, userId, email)) throw new Error("You are not assigned to this customer workspace");
  }
  const existingRun = await db.select().from(checklistRuns).where(and(eq(checklistRuns.userId, userId), eq(checklistRuns.customerId, customerId), eq(checklistRuns.checklistId, checklistId), eq(checklistRuns.runDate, runDate))).limit(1);
  const runId = existingRun[0]?.id ?? (await db.insert(checklistRuns).values({ userId, customerId, checklistId, runDate }).$returningId())[0].id;
  const existingItem = await db.select().from(checklistRunItems).where(and(eq(checklistRunItems.runId, runId), eq(checklistRunItems.itemId, itemId))).limit(1);
  if (existingItem[0]) {
    await db.update(checklistRunItems).set({ status, remarks: remarks ?? null }).where(eq(checklistRunItems.id, existingItem[0].id));
  } else {
    await db.insert(checklistRunItems).values({ runId, itemId, status, remarks: remarks ?? null });
  }
  return getChecklistRun(userId, customerId, checklistId, runDate, role, email);
}

export async function listLifecycleMetadata(customerId: number, checklistId: string) {
  const db = await requireDb();
  return db.select().from(lifecycleControlMetadata).where(and(eq(lifecycleControlMetadata.customerId, customerId), eq(lifecycleControlMetadata.checklistId, checklistId)));
}

export async function replaceLifecycleMetadata(customerId: number, checklistId: string, entries: Array<{ itemId: string; dueDate?: string | null; ownerMappingId?: number | null; ownerName?: string | null; ownerEmail?: string | null }>) {
  const db = await requireDb();
  await db.delete(lifecycleControlMetadata).where(and(eq(lifecycleControlMetadata.customerId, customerId), eq(lifecycleControlMetadata.checklistId, checklistId)));
  if (!entries.length) return [];
  await db.insert(lifecycleControlMetadata).values(entries.map((entry) => ({ customerId, checklistId, itemId: entry.itemId, dueDate: entry.dueDate || null, ownerMappingId: entry.ownerMappingId ?? null, ownerName: entry.ownerName || null, ownerEmail: entry.ownerEmail || null })));
  return listLifecycleMetadata(customerId, checklistId);
}

export async function listIncompleteLifecycleMetadata(asOf = new Date().toISOString().slice(0, 10)) {
  const db = await requireDb();
  const dueEntries = await db.select().from(lifecycleControlMetadata);
  const candidates = [];
  for (const entry of dueEntries) {
    const run = (await db.select({ id: checklistRuns.id }).from(checklistRuns).where(and(eq(checklistRuns.customerId, entry.customerId), eq(checklistRuns.checklistId, entry.checklistId))).orderBy(desc(checklistRuns.runDate)).limit(1))[0];
    const item = run ? (await db.select({ status: checklistRunItems.status }).from(checklistRunItems).where(and(eq(checklistRunItems.runId, run.id), eq(checklistRunItems.itemId, entry.itemId))).limit(1))[0] : undefined;
    if (!isLifecycleReminderEligible(entry.dueDate, item?.status, asOf)) continue;
    candidates.push({ ...entry, currentStatus: item?.status ?? "open" });
  }
  return candidates;
}

