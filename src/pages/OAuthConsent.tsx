import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { UnifiedLayout } from "@/components/layout/UnifiedLayout";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

// Supabase's `auth.oauth` namespace is beta and may not be typed yet.
type OAuthNs = {
  getAuthorizationDetails: (id: string) => Promise<{ data: any; error: any }>;
  approveAuthorization: (id: string) => Promise<{ data: any; error: any }>;
  denyAuthorization: (id: string) => Promise<{ data: any; error: any }>;
};
const oauthNs = () =>
  (supabase.auth as unknown as { oauth: OAuthNs }).oauth;

export default function OAuthConsent() {
  const [params] = useSearchParams();
  const authorizationId = params.get("authorization_id") ?? "";
  const [details, setDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!authorizationId) {
        setError("Missing authorization_id");
        return;
      }
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        const next = window.location.pathname + window.location.search;
        window.location.href = "/login?next=" + encodeURIComponent(next);
        return;
      }
      try {
        const { data, error } = await oauthNs().getAuthorizationDetails(
          authorizationId,
        );
        if (!active) return;
        if (error) {
          setError(error.message);
          return;
        }
        const immediate = data?.redirect_url ?? data?.redirect_to;
        if (immediate && !data?.client) {
          window.location.href = immediate;
          return;
        }
        setDetails(data);
      } catch (e: any) {
        setError(e?.message ?? "Failed to load authorization request");
      }
    })();
    return () => {
      active = false;
    };
  }, [authorizationId]);

  async function decide(approve: boolean) {
    setBusy(true);
    try {
      const { data, error } = approve
        ? await oauthNs().approveAuthorization(authorizationId)
        : await oauthNs().denyAuthorization(authorizationId);
      if (error) {
        setBusy(false);
        setError(error.message);
        return;
      }
      const target = data?.redirect_url ?? data?.redirect_to;
      if (!target) {
        setBusy(false);
        setError("No redirect returned by the authorization server.");
        return;
      }
      window.location.href = target;
    } catch (e: any) {
      setBusy(false);
      setError(e?.message ?? "Failed to submit decision");
    }
  }

  if (error) {
    return (
      <UnifiedLayout title="Authorization error" subtitle={error}>
        <div className="max-w-md mx-auto glass-card modern-shadow p-8 text-center">
          <p className="mb-4">Could not load this authorization request.</p>
          <p className="text-sm text-white/70">{error}</p>
        </div>
      </UnifiedLayout>
    );
  }

  if (!details) {
    return (
      <UnifiedLayout title="Connecting…" subtitle="Preparing authorization">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </UnifiedLayout>
    );
  }

  const clientName = details.client?.name ?? "an app";

  return (
    <UnifiedLayout
      title={`Connect ${clientName}`}
      subtitle="Grant access to your Alprax Flow account"
    >
      <div className="max-w-md mx-auto glass-card modern-shadow p-8 space-y-6">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">
            Allow {clientName} to act as you?
          </h2>
          <p className="text-sm text-white/70">
            It will be able to use Alprax Flow tools (view your profile, saved
            contacts, and recent transactions) on your behalf. You can revoke
            access at any time.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            className="flex-1"
            onClick={() => decide(true)}
            disabled={busy}
          >
            Approve
          </Button>
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => decide(false)}
            disabled={busy}
          >
            Deny
          </Button>
        </div>
      </div>
    </UnifiedLayout>
  );
}
