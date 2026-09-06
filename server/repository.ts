import type sql from "mssql";
import { getChecklistRun, getCustomers, getPublicationHistory, getReviewStatus, saveChecklistItem } from "./db";

export interface OperationsRepository {
  listCustomers(): Promise<any[]>;
  loadChecklistRun(input: { userId: number; customerId: number; checklistId: string; runDate: string; role?: string; email?: string | null }): Promise<any>;
  saveChecklistItem(input: { userId: number; customerId: number; checklistId: string; runDate: string; itemId: string; status: string; remarks?: string | null; role?: string; email?: string | null }): Promise<any>;
  getReviewStatus(input: { customerId: number; checklistId: string; runDate: string; userId?: number; role?: string; email?: string | null }): Promise<any>;
  getPublicationHistory(input: { customerId: number; userId?: number; role?: string; email?: string | null }): Promise<any[]>;
}

export function createManagedRepository(): OperationsRepository {
  return {
    listCustomers: () => getCustomers(),
    loadChecklistRun: (input) => getChecklistRun(input.userId, input.customerId, input.checklistId, input.runDate, input.role as any, input.email),
    saveChecklistItem: (input) => saveChecklistItem(input.userId, input.customerId, input.checklistId, input.runDate, input.itemId, input.status as any, input.remarks, input.role as any, input.email),
    getReviewStatus: (input) => getReviewStatus(input.customerId, input.checklistId, input.runDate, input.userId, input.role as any, input.email),
    getPublicationHistory: (input) => getPublicationHistory(input.customerId, input.userId, input.role as any, input.email),
  };
}

function rows<T>(result: { recordset?: T[] }): T[] {
  return result.recordset ?? [];
}

export function createMssqlRepository(pool: sql.ConnectionPool): OperationsRepository {
  return {
    async listCustomers() {
      const result = await pool.request().query(`
        SELECT c.id, c.name, c.code, c.primaryContactName, c.primaryContactEmail, c.status, c.createdAt, c.updatedAt
        FROM dbo.customers AS c
        WHERE c.status <> N'archived'
        ORDER BY c.name ASC
      `);
      return rows(result).map((customer) => ({ ...customer, accounts: [], leads: [], recipients: [], assignments: [] }));
    },

    async loadChecklistRun(input) {
      const runResult = await pool.request()
        .input("userId", input.userId)
        .input("customerId", input.customerId)
        .input("checklistId", input.checklistId)
        .input("runDate", input.runDate)
        .query(`
          SELECT TOP (1) id, userId, customerId, checklistId, runDate, createdAt, updatedAt
          FROM dbo.checklistRuns
          WHERE userId = @userId AND customerId = @customerId AND checklistId = @checklistId AND runDate = @runDate
        `);
      const run = rows(runResult)[0];
      if (!run) return { run: undefined, items: [] };
      const itemResult = await pool.request().input("runId", (run as any).id).query(`
        SELECT id, runId, itemId, status, remarks, updatedAt
        FROM dbo.checklistRunItems
        WHERE runId = @runId
        ORDER BY itemId ASC
      `);
      return { run, items: rows(itemResult) };
    },

    async saveChecklistItem(input) {
      const existingRun = await pool.request()
        .input("userId", input.userId)
        .input("customerId", input.customerId)
        .input("checklistId", input.checklistId)
        .input("runDate", input.runDate)
        .query(`
          SELECT TOP (1) id FROM dbo.checklistRuns
          WHERE userId = @userId AND customerId = @customerId AND checklistId = @checklistId AND runDate = @runDate
        `);
      let runId = rows(existingRun)[0]?.id;
      if (!runId) {
        const created = await pool.request()
          .input("userId", input.userId)
          .input("customerId", input.customerId)
          .input("checklistId", input.checklistId)
          .input("runDate", input.runDate)
          .query(`
            INSERT INTO dbo.checklistRuns (userId, customerId, checklistId, runDate)
            OUTPUT INSERTED.id
            VALUES (@userId, @customerId, @checklistId, @runDate)
          `);
        runId = rows(created)[0]?.id;
      }
      await pool.request()
        .input("runId", runId)
        .input("itemId", input.itemId)
        .input("status", input.status)
        .input("remarks", input.remarks ?? null)
        .query(`
          MERGE dbo.checklistRunItems AS target
          USING (SELECT @runId AS runId, @itemId AS itemId) AS source
          ON target.runId = source.runId AND target.itemId = source.itemId
          WHEN MATCHED THEN UPDATE SET status = @status, remarks = @remarks, updatedAt = SYSUTCDATETIME()
          WHEN NOT MATCHED THEN INSERT (runId, itemId, status, remarks) VALUES (@runId, @itemId, @status, @remarks);
        `);
      return this.loadChecklistRun(input);
    },

    async getReviewStatus(input) {
      const approval = await pool.request()
        .input("customerId", input.customerId)
        .input("checklistId", input.checklistId)
        .input("runDate", input.runDate)
        .query(`SELECT TOP (1) * FROM dbo.reviewApprovals WHERE customerId = @customerId AND checklistId = @checklistId AND runDate = @runDate ORDER BY createdAt DESC`);
      const publication = await pool.request()
        .input("customerId", input.customerId)
        .input("checklistId", input.checklistId)
        .input("runDate", input.runDate)
        .query(`SELECT TOP (1) * FROM dbo.reportPublications WHERE customerId = @customerId AND checklistId = @checklistId AND runDate = @runDate ORDER BY publishedAt DESC`);
      return { approval: rows(approval)[0], publication: rows(publication)[0] };
    },

    async getPublicationHistory(input) {
      const result = await pool.request()
        .input("customerId", input.customerId)
        .query(`SELECT * FROM dbo.reportPublications WHERE customerId = @customerId ORDER BY createdAt DESC`);
      return rows(result);
    },
  };
}
