# Alprax continuation prompt

Paste the block below at the start of a new AI coding session (Claude Code or similar). Fill in the two `<...>` lines. Keep this file updated when a phase finishes so the next session starts from the truth.

---

```text
You are continuing work on Alprax, a React + TypeScript + Vite payments app
(wallets, transfers, contacts, KYC, analytics, AutoPay) with a Supabase
backend (Postgres + RLS, Edge Functions in Deno, pg_cron) and Stripe for card
top-ups. It was built in Lovable and is now maintained directly in GitHub:
atdheekurteshi/alprax-flow. Lovable is no longer used.

TODAY'S GOAL: <one sentence, e.g. "Phase 1 step 1: make npm ci work">
ENVIRONMENT: <e.g. "local Windows machine, Supabase CLI logged in" or "cloud sandbox, no Supabase access">

Before doing anything:
1. Read docs/PROJECT-ASSESSMENT-2026-10-31.md (known problems, with file
   paths) and docs/NEXT-STEPS.md (the phased plan). If a later
   SUPABASE-INVENTORY.md exists, read it too.
2. Check `git log --oneline -15` and open PRs to see what has changed since
   those docs were written. Treat the docs as possibly stale and re-verify any
   claim before acting on it.
3. Tell me in a few lines: where the plan stands, which step today's goal
   maps to, and anything that blocks it.

Ground rules:
- Work on a feature branch and open a pull request. Never push to main.
- Small, reviewable changes. One plan step per PR unless I say otherwise.
- Before saying something works, run: npm ci && npm run lint &&
  npm run typecheck && npm test && npm run build (whatever of these exists
  yet). Report real output. If something fails or you skipped it, say so.
- Do NOT touch the live Supabase project (vixpxmvsndusngxdmjuv): no
  migrations, no `db push`, no function deploys, no secret changes, no data
  edits, unless I explicitly approve that specific action in this session.
  Read-only inspection is fine when I've given access. Prefer a staging
  project or `supabase start` locally.
- Never print, commit or paste secret values (Stripe secret key, service role
  key, WALLET_MASTER_KEY, CRON_SECRET, AI keys). Names only.
- Money rules: amounts are integer cents end to end; balances and ledger rows
  are written only by trusted server code (edge functions / webhooks), never
  by the browser; every money-moving operation is idempotent and authorized
  for the specific user; Stripe stays in test mode until I say otherwise.
- New migrations go in supabase/migrations with a clear name and must be
  reversible or come with a written rollback note.
- Do not reintroduce Lovable-only dependencies (lovable-tagger, the Lovable
  AI gateway). Ask before removing the MCP integration (@lovable.dev/mcp-js,
  /.lovable/oauth/consent), it may still be wanted.
- If a decision changes scope (provider choice, hosting, data model), stop
  and ask me with a recommendation instead of choosing silently.

When you finish:
- Summarize what changed, what you verified (with command output), and what
  is still unverified.
- Update docs/NEXT-STEPS.md: tick off finished steps, add anything new you
  found. Update the assessment only if a finding was wrong.
- Name the next step from the plan.
```

---

## Why the prompt is written this way

- **Goal and environment lines** make the same prompt reusable for every session, and tell the assistant up front whether live Supabase checks are possible.
- **"Re-verify before acting"** prevents the assistant from trusting docs that went stale after later commits.
- **Explicit validation command** stops "should work" answers; the assistant must show real output.
- **Live-database and secrets rules** protect production, since the repo is wired to the real project id.
- **Money rules** encode the exact bug classes found in the assessment (dollar/cent mismatch, browser-written ledger rows, non-idempotent confirmation, anon-key cron auth).
- **Update NEXT-STEPS.md at the end** keeps the hand-off current for the next session.
