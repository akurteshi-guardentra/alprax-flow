# Agent integrations

The app has an OAuth-protected MCP catalog with `get_profile`, `list_contacts`, and `list_transactions`. These tools are read-only, forward the verified OAuth caller's token, and retain existing RLS. No payment, send, delete, or public-data access was added.

The Contacts page also registers the browser-local `read_visible_contacts` tool while that page is mounted. It exposes only the contacts shown on screen and unregisters on navigation. Browser-local tools are separate from the remote server.

## Activate this revision

This app uses user-managed Supabase. Lovable cannot deploy its generated MCP function, including during app publication.

1. Deploy the SDK-generated `supabase/functions/mcp/index.ts` to Supabase as the `mcp` function with the runtime JWT gate disabled (`supabase functions deploy mcp --project-ref vixpxmvsndusngxdmjuv --no-verify-jwt`). The SDK validates OAuth itself. Do not edit the generated function.
2. Republish the app in Lovable so its consent changes and updated tool catalog are advertised.
3. In an MCP client, use `https://vixpxmvsndusngxdmjuv.supabase.co/functions/v1/mcp`, sign in, and approve the request.

Keep `https://alprax-flow.lovable.app/.lovable/oauth/consent` in the hosted Supabase redirect allow-list for signup email verification. Local configuration includes this path but does not prove hosted settings have synchronized.

## Verification boundary

OAuth discovery returned the direct Supabase issuer during preparation. Manifest extraction validates the generated catalog, not hosted deployment. Authenticated approve/deny and real record reads must be verified after deploying the function and republishing. This external Supabase connection does not provide a managed authenticated browser test session.