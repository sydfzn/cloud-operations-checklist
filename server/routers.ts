import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, leadProcedure, operatorProcedure, permissionProcedure, publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { getOperationsRepository } from "./database-provider";
import { z } from "zod";
import { approveReview, archiveCustomer, archiveDirectoryUserMapping, createCustomer, createEscalation, closeEscalation, getAdminSettings, getAssignedCustomers, getChecklistRun, getCustomerAccounts, getCustomers, getDirectoryUserMappings, getEscalations, getPublicationHistory, getReviewStatus, publishApprovedReport, saveAdminSettings, saveChecklistItem, saveDirectoryUserMapping, updateCustomerSetup } from "./db";
import { checklistDefinitions } from "@shared/checklistData";
import { assertCustomerWorkspaceAccess, listLifecycleMetadata, replaceLifecycleMetadata } from "./db";
import { getCustomerLifecyclePublicationTemplate, getInternalLifecycleReviewTemplate } from "@shared/lifecycleReports";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  checklist: router({
    definitions: permissionProcedure("checklists.read").query(() => checklistDefinitions),
    assignedCustomers: permissionProcedure("checklists.read").query(({ ctx }) => getAssignedCustomers(ctx.user.id, ctx.user.email)),
    workspaceCustomers: permissionProcedure("checklists.read").query(({ ctx }) => ctx.user.role === "admin" ? getOperationsRepository().then((repo) => repo.listCustomers()) : getAssignedCustomers(ctx.user.id, ctx.user.email)),
    loadRun: permissionProcedure("checklists.read").input(z.object({ customerId: z.number().int().positive(), checklistId: z.string().min(1), runDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) })).query(({ ctx, input }) => getOperationsRepository().then((repo) => repo.loadChecklistRun({ userId: ctx.user.id, customerId: input.customerId, checklistId: input.checklistId, runDate: input.runDate, role: ctx.user.role, email: ctx.user.email }))),
    saveItem: permissionProcedure("checklists.write").input(z.object({ customerId: z.number().int().positive(), checklistId: z.string().min(1), runDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), itemId: z.string().min(1), status: z.enum(["open", "done", "blocked"]), remarks: z.string().max(5000).nullable().optional() })).mutation(({ ctx, input }) => getOperationsRepository().then((repo) => repo.saveChecklistItem({ userId: ctx.user.id, customerId: input.customerId, checklistId: input.checklistId, runDate: input.runDate, itemId: input.itemId, status: input.status, remarks: input.remarks, role: ctx.user.role, email: ctx.user.email }))),
    metadata: permissionProcedure("checklists.read").input(z.object({ customerId: z.number().int().positive(), checklistId: z.string().min(1) })).query(({ ctx, input }) => assertCustomerWorkspaceAccess(ctx.user.id, input.customerId, ctx.user.role, ctx.user.email).then(() => listLifecycleMetadata(input.customerId, input.checklistId))),
    saveMetadata: permissionProcedure("checklists.write").input(z.object({ customerId: z.number().int().positive(), checklistId: z.string().min(1), entries: z.array(z.object({ itemId: z.string().min(1), dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(), ownerMappingId: z.number().int().positive().nullable().optional(), ownerName: z.string().max(160).nullable().optional(), ownerEmail: z.string().email().nullable().optional() })).max(500) })).mutation(({ ctx, input }) => assertCustomerWorkspaceAccess(ctx.user.id, input.customerId, ctx.user.role, ctx.user.email).then(() => replaceLifecycleMetadata(input.customerId, input.checklistId, input.entries))),
  }),
  customers: router({
    list: permissionProcedure("customers.manage").query(() => getOperationsRepository().then((repo) => repo.listCustomers())),
    create: permissionProcedure("customers.manage").input(z.object({ name: z.string().min(1).max(180), code: z.string().min(1).max(40), primaryContactName: z.string().max(160).nullable().optional(), primaryContactEmail: z.string().email().nullable().optional(), account: z.object({ provider: z.string().min(1).max(40), accountName: z.string().min(1).max(160), accountIdentifier: z.string().max(160).nullable().optional(), serviceScope: z.string().max(500).nullable().optional(), environment: z.string().max(80).nullable().optional(), region: z.string().max(100).nullable().optional(), criticality: z.enum(["critical", "high", "standard"]).optional() }).optional(), accounts: z.array(z.object({ provider: z.string().min(1).max(40), accountName: z.string().min(1).max(160), accountIdentifier: z.string().max(160).nullable().optional(), serviceScope: z.string().max(500).nullable().optional(), environment: z.string().max(80).nullable().optional(), region: z.string().max(100).nullable().optional(), criticality: z.enum(["critical", "high", "standard"]).optional() })).max(50).optional(), lead: z.object({ directoryUserMappingId: z.number().int().positive(), role: z.enum(["primary", "backup"]).optional() }).optional(), leads: z.array(z.object({ directoryUserMappingId: z.number().int().positive(), role: z.enum(["primary", "backup"]).optional() })).max(50).optional(), recipients: z.array(z.object({ name: z.string().max(160).nullable().optional(), email: z.string().email() })).max(50).optional(), assignments: z.array(z.string().min(1).max(80)).max(50).optional() })).mutation(({ input }) => createCustomer(input)),
    accounts: permissionProcedure("customers.manage").input(z.object({ customerId: z.number().int().positive() })).query(({ input }) => getCustomerAccounts(input.customerId)),
    update: permissionProcedure("customers.manage").input(z.object({ customerId: z.number().int().positive(), name: z.string().min(1).max(180), code: z.string().min(1).max(40), primaryContactName: z.string().max(160).nullable().optional(), primaryContactEmail: z.string().email().nullable().optional(), account: z.object({ provider: z.string().min(1).max(40), accountName: z.string().min(1).max(160), accountIdentifier: z.string().max(160).nullable().optional(), serviceScope: z.string().max(500).nullable().optional(), environment: z.string().max(80).nullable().optional(), region: z.string().max(100).nullable().optional(), criticality: z.enum(["critical", "high", "standard"]).optional() }).optional(), accounts: z.array(z.object({ provider: z.string().min(1).max(40), accountName: z.string().min(1).max(160), accountIdentifier: z.string().max(160).nullable().optional(), serviceScope: z.string().max(500).nullable().optional(), environment: z.string().max(80).nullable().optional(), region: z.string().max(100).nullable().optional(), criticality: z.enum(["critical", "high", "standard"]).optional() })).max(50).optional(), lead: z.object({ directoryUserMappingId: z.number().int().positive(), role: z.enum(["primary", "backup"]).optional() }).optional(), leads: z.array(z.object({ directoryUserMappingId: z.number().int().positive(), role: z.enum(["primary", "backup"]).optional() })).max(50).optional(), recipients: z.array(z.object({ name: z.string().max(160).nullable().optional(), email: z.string().email() })).max(50).optional(), assignments: z.array(z.string().min(1).max(80)).max(50).optional() })).mutation(({ input }) => { const { customerId, ...customer } = input; return updateCustomerSetup(customerId, customer); }),
    archive: permissionProcedure("customers.manage").input(z.object({ customerId: z.number().int().positive() })).mutation(({ input }) => archiveCustomer(input.customerId)),
  }),
  reviews: router({
    template: permissionProcedure("reviews.read").input(z.object({ customerId: z.number().int().positive(), checklistId: z.string().min(1), audience: z.enum(["internal", "customer"]), customerName: z.string().min(1), rows: z.array(z.object({ title: z.string(), category: z.string(), status: z.enum(["open", "done", "blocked"]), dueDate: z.string().nullable().optional(), owner: z.string().nullable().optional(), remarks: z.string().nullable().optional() })).max(500) })).query(({ ctx, input }) => assertCustomerWorkspaceAccess(ctx.user.id, input.customerId, ctx.user.role, ctx.user.email).then(() => input.audience === "internal" ? getInternalLifecycleReviewTemplate(input.checklistId, input.customerName, input.rows) : getCustomerLifecyclePublicationTemplate(input.checklistId, input.customerName, input.rows))),
    status: permissionProcedure("reviews.read").input(z.object({ customerId: z.number().int().positive(), checklistId: z.string().min(1), runDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) })).query(({ ctx, input }) => getOperationsRepository().then((repo) => repo.getReviewStatus({ customerId: input.customerId, checklistId: input.checklistId, runDate: input.runDate, userId: ctx.user.id, role: ctx.user.role, email: ctx.user.email }))),
    approve: permissionProcedure("reviews.approve").input(z.object({ customerId: z.number().int().positive(), checklistId: z.string().min(1), runDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), notes: z.string().max(5000).nullable().optional() })).mutation(({ ctx, input }) => approveReview(ctx.user.id, ctx.user.email, input)),
    publish: permissionProcedure("reviews.approve").input(z.object({ customerId: z.number().int().positive(), checklistId: z.string().min(1), runDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) })).mutation(({ ctx, input }) => publishApprovedReport(ctx.user.id, ctx.user.email, ctx.user.role, input)),
    history: permissionProcedure("reports.view").input(z.object({ customerId: z.number().int().positive() })).query(({ ctx, input }) => getOperationsRepository().then((repo) => repo.getPublicationHistory({ customerId: input.customerId, userId: ctx.user.id, role: ctx.user.role, email: ctx.user.email }))),
  }),
  settings: router({
    get: permissionProcedure("customers.manage").query(() => getAdminSettings()),
    save: permissionProcedure("customers.manage").input(z.record(z.string(), z.string().nullable())).mutation(({ ctx, input }) => saveAdminSettings(ctx.user.id, input)),
    directory: router({
      list: permissionProcedure("customers.manage").query(() => getDirectoryUserMappings()),
      save: permissionProcedure("customers.manage").input(z.object({ directoryEmail: z.string().email(), displayName: z.string().min(1).max(160), role: z.enum(["operator", "lead", "admin"]) })).mutation(({ input }) => saveDirectoryUserMapping(input)),
      archive: permissionProcedure("customers.manage").input(z.object({ id: z.number().int().positive() })).mutation(({ input }) => archiveDirectoryUserMapping(input.id)),
    }),
  }),
  escalations: router({
    list: protectedProcedure.query(({ ctx }) => getEscalations(ctx.user.id)),
    create: protectedProcedure.input(z.object({ owner: z.string().min(1).max(160), action: z.string().min(1).max(5000), priority: z.enum(["P1/P2", "P3", "Advisory"]), dueAt: z.string().max(32).nullable().optional() })).mutation(({ ctx, input }) => createEscalation(ctx.user.id, input)),
    close: protectedProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ ctx, input }) => closeEscalation(ctx.user.id, input.id)),
  }),
});

export type AppRouter = typeof appRouter;
