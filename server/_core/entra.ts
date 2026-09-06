import type { Express, Request, Response } from "express";
import { buildEntraAuthorizeUrl, getEntraConfig } from "../entra";
import crypto from "node:crypto";

export function registerEntraRoutes(app: Express): void {
  app.get("/auth/entra/start", (_req: Request, res: Response) => {
    const config = getEntraConfig();
    if (!config.configured) {
      res.status(503).json({ ok: false, code: "entra-not-configured", missing: config.missing });
      return;
    }
    const state = crypto.randomBytes(24).toString("hex");
    res.redirect(buildEntraAuthorizeUrl(config, state));
  });

  app.get("/auth/entra/callback", (req: Request, res: Response) => {
    const config = getEntraConfig();
    if (!config.configured) {
      res.status(503).json({ ok: false, code: "entra-not-configured", missing: config.missing });
      return;
    }
    if (typeof req.query.error === "string") {
      res.status(401).json({ ok: false, code: "entra-provider-error", detail: req.query.error });
      return;
    }
    if (typeof req.query.code !== "string" || typeof req.query.state !== "string") {
      res.status(400).json({ ok: false, code: "entra-callback-invalid" });
      return;
    }
    res.status(501).json({ ok: false, code: "entra-token-exchange-pending", message: "Complete Microsoft Graph token exchange and directory role mapping after tenant credentials are supplied." });
  });
}
