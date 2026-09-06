export type EntraConfig = {
  tenantId: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  authority: string;
  configured: boolean;
  missing: string[];
};

function value(env: NodeJS.ProcessEnv, key: string): string {
  return env[key]?.trim() ?? "";
}

export function getEntraConfig(env: NodeJS.ProcessEnv = process.env): EntraConfig {
  const tenantId = value(env, "ENTRA_TENANT_ID");
  const clientId = value(env, "ENTRA_CLIENT_ID");
  const clientSecret = value(env, "ENTRA_CLIENT_SECRET");
  const redirectUri = value(env, "ENTRA_REDIRECT_URI");
  const missing = [
    ["ENTRA_TENANT_ID", tenantId],
    ["ENTRA_CLIENT_ID", clientId],
    ["ENTRA_CLIENT_SECRET", clientSecret],
    ["ENTRA_REDIRECT_URI", redirectUri],
  ].filter(([, entry]) => !entry).map(([key]) => key);

  return {
    tenantId,
    clientId,
    clientSecret,
    redirectUri,
    authority: tenantId ? `https://login.microsoftonline.com/${tenantId}/v2.0` : "",
    configured: missing.length === 0,
    missing,
  };
}

export function buildEntraAuthorizeUrl(config: EntraConfig, state: string): string {
  if (!config.configured) throw new Error(`entra-not-configured:${config.missing.join(",")}`);
  const params = new URLSearchParams({
    client_id: config.clientId,
    response_type: "code",
    redirect_uri: config.redirectUri,
    response_mode: "query",
    scope: "openid profile email User.Read",
    state,
  });
  return `https://login.microsoftonline.com/${config.tenantId}/oauth2/v2.0/authorize?${params.toString()}`;
}
