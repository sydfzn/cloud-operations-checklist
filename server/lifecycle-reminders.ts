import type { Request, Response } from "express";
import { sdk } from "./_core/sdk";
import { listIncompleteLifecycleMetadata } from "./db";

export async function lifecycleReminderHandler(req: Request, res: Response) {
  try {
    let user;
    try {
      user = await sdk.authenticateRequest(req);
    } catch {
      res.status(403).json({ ok: false, error: "cron-only" });
      return;
    }
    if (!user.isCron || !user.taskUid) {
      res.status(403).json({ ok: false, error: "cron-only" });
      return;
    }
    const asOf = typeof req.query.asOf === "string" ? req.query.asOf : new Date().toISOString().slice(0, 10);
    const candidates = await listIncompleteLifecycleMetadata(asOf);
    res.json({ ok: true, taskUid: user.taskUid, asOf, reminderCount: candidates.length, candidates, delivery: "deferred-microsoft-365" });
  } catch (error) {
    res.status(500).json({ ok: false, error: error instanceof Error ? error.message : "lifecycle-reminder-failed", timestamp: new Date().toISOString() });
  }
}
