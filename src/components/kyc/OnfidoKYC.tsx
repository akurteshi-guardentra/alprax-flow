
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Shield } from "lucide-react";


interface OnfidoKYCProps {
  onCompleted?: () => void;
}

// Professional KYC using Onfido Web SDK
export default function OnfidoKYC({ onCompleted }: OnfidoKYCProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let onfidoInstance: any;

    const init = async () => {
      setLoading(true);
      setError(null);

      try {
        const {
          data: { session },
          error: sessionErr,
        } = await supabase.auth.getSession();
        if (sessionErr || !session?.access_token) {
          throw new Error("Not authenticated. Please log in again.");
        }

        // Request SDK token from our Supabase Edge Function
        const resp = await fetch(
          `https://vixpxmvsndusngxdmjuv.functions.supabase.co/onfido-token`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${session.access_token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({}),
          }
        );

        if (!resp.ok) {
          const msg = await resp.text();
          throw new Error(
            `Failed to obtain Onfido SDK token. ${msg || resp.statusText}`
          );
        }

        const { sdk_token } = await resp.json();

        // Initialize Onfido SDK
        const { default: loadOnfido } = await import("onfido-sdk-ui");
        const loader: any = await (loadOnfido as any)();
        onfidoInstance = loader.init({
          token: sdk_token,
          containerEl: containerRef.current!,
          // Basic flow: document + face (selfie/liveness)
          steps: [
            { type: "document", options: { countryCode: "USA" } },
            { type: "face", options: { requestedVariant: "standard" } },
          ],
          onComplete: async (data: any) => {
            try {
              const { data: userData } = await supabase.auth.getUser();
              const userId = userData?.user?.id;

              if (!userId) throw new Error("Missing user id");

              // Store a record so the app reflects pending verification
              // NOTE: This app already has a kyc_verifications table with strict columns.
              // We store provider metadata in additional_documents.
              const { error: insertErr } = await supabase
                .from("kyc_verifications")
                .insert({
                  user_id: userId,
                  verification_type: "onfido",
                  document_type: "onfido_sdk_flow",
                  document_url: `onfido://sdk_flow/${data?.sdk_flow_run_id ?? "unknown"}`,
                  additional_documents: {
                    provider: "onfido",
                    onfido: data,
                  },
                  // status defaults to 'pending' until webhook approves/rejects
                });

              if (insertErr) throw insertErr;

              onCompleted?.();
            } catch (e: any) {
              console.error(e);
              setError(e.message || "Failed to record verification.");
            }
          },
        });
      } catch (e: any) {
        console.error(e);
        setError(e.message || "Failed to initialize Onfido.");
      } finally {
        setLoading(false);
      }
    };

    init();

    return () => {
      if (onfidoInstance && onfidoInstance.teardown) {
        onfidoInstance.teardown();
      }
    };
  }, [onCompleted]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6 rounded-lg border border-white/10 bg-white/5 text-white/80">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        Initializing secure verification...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-lg border border-red-500/30 bg-red-500/10 text-red-100">
        <div className="flex items-center gap-2 font-medium">
          <Shield className="h-4 w-4" />
          Professional verification unavailable
        </div>
        <p className="mt-2 text-sm opacity-90">{error}</p>
        <p className="mt-2 text-xs opacity-70">
          Tip: Add ONFIDO_API_TOKEN in Supabase Edge Function secrets and set the
          webhook later to get automatic approvals.
        </p>
      </div>
    );
  }

  return <div ref={containerRef} className="min-h-[520px]" />;
}
