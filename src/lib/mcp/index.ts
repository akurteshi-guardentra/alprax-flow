import { auth, defineMcp } from "@lovable.dev/mcp-js";
import getProfileTool from "./tools/get-profile";
import listContactsTool from "./tools/list-contacts";
import listTransactionsTool from "./tools/list-transactions";

// The OAuth issuer MUST be the direct Supabase host (built from project ref),
// never SUPABASE_URL — which may be a Cloud proxy host. Vite inlines this
// literal at build time, so no runtime env read.
const projectRef =
  import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "alprax-flow",
  title: "alprax-flow",
  version: "0.1.0",
  instructions:
    "Read-only tools for the signed-in AlpraX Flow user: view your profile, saved contacts, and recent payments. Amounts use fiat currency and permissions follow your account.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
    requireOAuthClientClaim: true,
  }),
  tools: [getProfileTool, listContactsTool, listTransactionsTool],
});
