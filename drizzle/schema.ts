import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "lead", "operator", "customer_viewer"]).default("operator").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const checklistRuns = mysqlTable("checklistRuns", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  customerId: int("customerId").notNull(),
  checklistId: varchar("checklistId", { length: 80 }).notNull(),
  runDate: varchar("runDate", { length: 10 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ChecklistRun = typeof checklistRuns.$inferSelect;
export type InsertChecklistRun = typeof checklistRuns.$inferInsert;

export const checklistRunItems = mysqlTable("checklistRunItems", {
  id: int("id").autoincrement().primaryKey(),
  runId: int("runId").notNull(),
  itemId: varchar("itemId", { length: 100 }).notNull(),
  status: mysqlEnum("status", ["open", "done", "blocked"]).default("open").notNull(),
  remarks: text("remarks"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ChecklistRunItem = typeof checklistRunItems.$inferSelect;
export type InsertChecklistRunItem = typeof checklistRunItems.$inferInsert;

export const escalations = mysqlTable("escalations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  owner: varchar("owner", { length: 160 }).notNull(),
  action: text("action").notNull(),
  priority: mysqlEnum("priority", ["P1/P2", "P3", "Advisory"]).default("P1/P2").notNull(),
  dueAt: varchar("dueAt", { length: 32 }),
  status: mysqlEnum("status", ["open", "closed"]).default("open").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Escalation = typeof escalations.$inferSelect;
export type InsertEscalation = typeof escalations.$inferInsert;

export const customers = mysqlTable("customers", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 180 }).notNull(),
  code: varchar("code", { length: 40 }).notNull().unique(),
  status: mysqlEnum("status", ["active", "archived"]).default("active").notNull(),
  primaryContactName: varchar("primaryContactName", { length: 160 }),
  primaryContactEmail: varchar("primaryContactEmail", { length: 320 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = typeof customers.$inferInsert;

export const customerAccounts = mysqlTable("customerAccounts", {
  id: int("id").autoincrement().primaryKey(),
  customerId: int("customerId").notNull(),
  provider: varchar("provider", { length: 40 }).notNull(),
  accountName: varchar("accountName", { length: 160 }).notNull(),
  accountIdentifier: varchar("accountIdentifier", { length: 160 }),
  serviceScope: varchar("serviceScope", { length: 500 }),
  environment: varchar("environment", { length: 80 }),
  region: varchar("region", { length: 100 }),
  criticality: mysqlEnum("criticality", ["critical", "high", "standard"]).default("standard").notNull(),
  status: mysqlEnum("status", ["active", "retired"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CustomerAccount = typeof customerAccounts.$inferSelect;
export type InsertCustomerAccount = typeof customerAccounts.$inferInsert;

export const customerChecklistAssignments = mysqlTable("customerChecklistAssignments", {
  id: int("id").autoincrement().primaryKey(),
  customerId: int("customerId").notNull(),
  checklistId: varchar("checklistId", { length: 80 }).notNull(),
  enabled: int("enabled").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CustomerChecklistAssignment = typeof customerChecklistAssignments.$inferSelect;
export type InsertCustomerChecklistAssignment = typeof customerChecklistAssignments.$inferInsert;

export const customerLeads = mysqlTable("customerLeads", {
  id: int("id").autoincrement().primaryKey(),
  customerId: int("customerId").notNull(),
  userId: int("userId").notNull(),
  directoryUserMappingId: int("directoryUserMappingId"),
  displayName: varchar("displayName", { length: 160 }),
  directoryEmail: varchar("directoryEmail", { length: 320 }),
  role: mysqlEnum("role", ["primary", "backup"]).default("primary").notNull(),
  active: int("active").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CustomerLead = typeof customerLeads.$inferSelect;
export type InsertCustomerLead = typeof customerLeads.$inferInsert;

export const reportRecipients = mysqlTable("reportRecipients", {
  id: int("id").autoincrement().primaryKey(),
  customerId: int("customerId").notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  name: varchar("name", { length: 160 }),
  active: int("active").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ReportRecipient = typeof reportRecipients.$inferSelect;
export type InsertReportRecipient = typeof reportRecipients.$inferInsert;

export const reviewApprovals = mysqlTable("reviewApprovals", {
  id: int("id").autoincrement().primaryKey(),
  customerId: int("customerId").notNull(),
  checklistId: varchar("checklistId", { length: 80 }).notNull(),
  runDate: varchar("runDate", { length: 10 }).notNull(),
  leadUserId: int("leadUserId").notNull(),
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  notes: text("notes"),
  approvedAt: timestamp("approvedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ReviewApproval = typeof reviewApprovals.$inferSelect;
export type InsertReviewApproval = typeof reviewApprovals.$inferInsert;

export const reportPublications = mysqlTable("reportPublications", {
  id: int("id").autoincrement().primaryKey(),
  customerId: int("customerId").notNull(),
  checklistId: varchar("checklistId", { length: 80 }).notNull(),
  runDate: varchar("runDate", { length: 10 }).notNull(),
  approvalId: int("approvalId").notNull(),
  publishedByUserId: int("publishedByUserId").notNull(),
  recipientCount: int("recipientCount").default(0).notNull(),
  deliveryStatus: mysqlEnum("deliveryStatus", ["queued", "sent", "failed"]).default("queued").notNull(),
  publishedAt: timestamp("publishedAt").defaultNow().notNull(),
});

export type ReportPublication = typeof reportPublications.$inferSelect;
export type InsertReportPublication = typeof reportPublications.$inferInsert;

export const adminSettings = mysqlTable("adminSettings", {
  id: int("id").autoincrement().primaryKey(),
  settingKey: varchar("settingKey", { length: 120 }).notNull().unique(),
  settingValue: text("settingValue"),
  updatedByUserId: int("updatedByUserId").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AdminSetting = typeof adminSettings.$inferSelect;
export type InsertAdminSetting = typeof adminSettings.$inferInsert;

export const directoryUserMappings = mysqlTable("directoryUserMappings", {
  id: int("id").autoincrement().primaryKey(),
  directoryEmail: varchar("directoryEmail", { length: 320 }).notNull().unique(),
  displayName: varchar("displayName", { length: 160 }).notNull(),
  role: mysqlEnum("role", ["operator", "lead", "admin"]).default("operator").notNull(),
  active: int("active").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DirectoryUserMapping = typeof directoryUserMappings.$inferSelect;
export type InsertDirectoryUserMapping = typeof directoryUserMappings.$inferInsert;

export const lifecycleControlMetadata = mysqlTable("lifecycleControlMetadata", {
  id: int("id").autoincrement().primaryKey(),
  customerId: int("customerId").notNull(),
  checklistId: varchar("checklistId", { length: 80 }).notNull(),
  itemId: varchar("itemId", { length: 100 }).notNull(),
  dueDate: varchar("dueDate", { length: 10 }),
  ownerMappingId: int("ownerMappingId"),
  ownerName: varchar("ownerName", { length: 160 }),
  ownerEmail: varchar("ownerEmail", { length: 320 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LifecycleControlMetadata = typeof lifecycleControlMetadata.$inferSelect;
export type InsertLifecycleControlMetadata = typeof lifecycleControlMetadata.$inferInsert;
