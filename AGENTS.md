# Architecture rules
- Keep remote MCP tools in `src/lib/mcp/` with one tool per file and a shared lazy caller-scoped Supabase factory; this preserves OAuth identity and RLS without privileged credentials.
- Register browser tools in their owning page with `useWebMCP` and shared fail-open telemetry; this scopes tools to visible state and cleans up on navigation.
- Validate OAuth return paths once at the login boundary and preserve the canonical local path through every authentication method; this prevents open redirects and lost consent requests.