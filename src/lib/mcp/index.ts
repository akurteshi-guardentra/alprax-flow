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
  name: "alprax-flow-mcp",
  title: "Alprax Flow",
  version: "0.1.0",
  instructions:
    "Tools for the signed-in Alprax Flow user. Read-only: view your profile, saved contacts, and recent transactions. All amounts are shown in fiat; blockchain details are hidden.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [getProfileTool, listContactsTool, listTransactionsTool],
});
