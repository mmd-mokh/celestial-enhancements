import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";

import { supabase } from "@/integrations/supabase/client";

type OAuthClient = { name?: string; client_name?: string; redirect_uri?: string };
type AuthorizationDetails = {
  client?: OAuthClient;
  scope?: string;
  scopes?: string[];
  redirect_url?: string;
  redirect_to?: string;
};

type OAuthNamespace = {
  getAuthorizationDetails: (id: string) => Promise<{ data: AuthorizationDetails | null; error: { message: string } | null }>;
  approveAuthorization: (id: string) => Promise<{ data: AuthorizationDetails | null; error: { message: string } | null }>;
  denyAuthorization: (id: string) => Promise<{ data: AuthorizationDetails | null; error: { message: string } | null }>;
};

function oauth(): OAuthNamespace {
  const authAny = supabase.auth as unknown as { oauth: OAuthNamespace };
  return authAny.oauth;
}

function isSameOriginPath(value: string | undefined): value is string {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//");
}

export const Route = createFileRoute("/.lovable/oauth/consent")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({
    authorization_id: typeof s.authorization_id === "string" ? s.authorization_id : "",
  }),
  beforeLoad: async ({ search, location }) => {
    if (!search.authorization_id) throw new Error("Missing authorization_id");
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      const next = location.pathname + location.searchStr;
      throw redirect({ to: "/auth", search: { next } });
    }
  },
  loader: async ({ location }) => {
    const authorizationId =
      new URLSearchParams(location.searchStr).get("authorization_id") ?? "";
    const { data, error } = await oauth().getAuthorizationDetails(authorizationId);
    if (error) throw new Error(error.message);
    const immediate = data?.redirect_url ?? data?.redirect_to;
    if (immediate && !data?.client) {
      window.location.href = immediate;
      return data;
    }
    return data;
  },
  component: Consent,
  errorComponent: ({ error }) => (
    <main className="min-h-dvh flex items-center justify-center p-6 bg-background">
      <div className="max-w-md text-center space-y-3">
        <h1 className="text-xl font-semibold">Could not load this authorization request</h1>
        <p className="text-sm text-muted-foreground">
          {String((error as Error)?.message ?? error)}
        </p>
      </div>
    </main>
  ),
});

function Consent() {
  const details = Route.useLoaderData();
  const { authorization_id } = Route.useSearch();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clientName = details?.client?.name ?? details?.client?.client_name ?? "an app";
  const redirectUri = details?.client?.redirect_uri;
  const scopeList = details?.scopes ?? (details?.scope ? details.scope.split(" ") : []);

  async function decide(approve: boolean) {
    setBusy(true);
    setError(null);
    const api = oauth();
    const { data, error: err } = approve
      ? await api.approveAuthorization(authorization_id)
      : await api.denyAuthorization(authorization_id);
    if (err) {
      setBusy(false);
      setError(err.message);
      return;
    }
    const target: string | undefined = data?.redirect_url ?? data?.redirect_to;
    if (!target || (!isSameOriginPath(target) && !target.startsWith("http"))) {
      setBusy(false);
      setError("No redirect returned by the authorization server.");
      return;
    }
    window.location.href = target;
  }

  return (
    <main className="min-h-dvh flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-lg space-y-5">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold text-foreground">
            Connect {clientName} to Gamio
          </h1>
          <p className="text-sm text-muted-foreground">
            This lets {clientName} use Gamio as you — browsing consoles and managing your own bookings.
          </p>
        </div>

        {redirectUri && (
          <p className="text-xs text-muted-foreground break-all">
            Redirect: <span className="font-mono">{redirectUri}</span>
          </p>
        )}

        {scopeList.length > 0 && (
          <ul className="text-sm space-y-1">
            {scopeList.map((s: string) => (
              <li key={s} className="text-foreground">• {s}</li>
            ))}
          </ul>
        )}

        <p className="text-xs text-muted-foreground">
          This does not bypass Gamio's own permissions or backend policies.
        </p>

        {error && (
          <p role="alert" className="text-sm text-destructive">{error}</p>
        )}

        <div className="flex gap-2 pt-2">
          <button
            disabled={busy}
            onClick={() => decide(true)}
            className="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60 hover:bg-primary/90"
          >
            Approve
          </button>
          <button
            disabled={busy}
            onClick={() => decide(false)}
            className="flex-1 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent disabled:opacity-60"
          >
            Cancel
          </button>
        </div>
      </div>
    </main>
  );
}