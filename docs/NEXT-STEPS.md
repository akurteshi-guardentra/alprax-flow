# Alprax: prioritized plan (from the 2026-10-31 assessment)

Each phase is one or more small pull requests. Do not start a phase until the previous one's exit check passes. Anything touching the live Supabase project or real money needs the owner's explicit go-ahead.

## Phase 0. Decisions the owner makes first (no code)

- **Package manager:** npm (recommended, CI already uses it) or Bun. Delete the other lockfiles.
- **Hosting target:** Vercel, GitHub Pages, or other. Retire the rest of the deploy scripts.
- **Environments:** create a separate Supabase **staging** project, or a local `supabase start`, so fixes are never tested against production first.
- **AI provider for AutoPay:** replace the Lovable AI gateway (Claude via the Anthropic API, or another provider), or switch the AI assistant off for now.
- **Is real money in scope yet?** Until Phase 3 is done, Add Funds should be clearly test-mode only (Stripe test keys).

## Phase 1. Make the repo installable, testable and clean (about 1 day)

1. Fix the Vite peer conflict: upgrade `@vitejs/plugin-react-swc` to a version that supports Vite 8 (or pin Vite to 6). Regenerate `package-lock.json` so `npm ci` works without `--legacy-peer-deps`.
2. Remove `bun.lock`, `bun.lockb` (if npm chosen), the self-dependency `vite_react_shadcn_ts`, `.git_disabled/`, `t`, `tatus`. Stop tracking `.env` (keep `.env.example`).
3. Fix ESLint (align `typescript-eslint` with ESLint 9.39) and remove `|| echo` from CI so lint failures fail the build.
4. Repair the test harness: hoisting-safe `vi.mock` for `useNavigate`, a shared `renderWithProviders` that wraps `AuthProvider`/router/query client, a complete Supabase mock (`.order()` etc.), no real network calls. Delete or fix `transactionFlow.test.ts`.
5. Add `test` and `typecheck` scripts and run `npm ci && npm run lint && npm run typecheck && npm test && npm run build` in `pull-request.yml`.

**Exit check:** a clean clone passes that command line locally and in GitHub Actions.

## Phase 2. Inventory the live Supabase project (read-only, about half a day, needs owner access)

Run from a machine logged into Supabase (`supabase login`, `supabase link --project-ref vixpxmvsndusngxdmjuv`):

1. `supabase migration list` and compare with `supabase/migrations/` (37 files). Note drift.
2. `supabase db dump --schema public --role-only=false -f /tmp/prod-schema.sql` (schema only, no data). Compare RLS policies on `stellar_transactions`, `funding_transactions`, `orders`, `transaction_queue`, `payment_rules`, `wallets`/keys tables.
3. `supabase functions list` and `supabase secrets list` (names only). Confirm `STRIPE_SECRET_KEY` (test or live?), `WALLET_MASTER_KEY`, `CRON_SECRET`, `LOVABLE_API_KEY`.
4. `select * from cron.job;` to see which scheduled jobs are actually running.
5. Auth settings in the dashboard: Site URL, redirect URLs (still pointing at Lovable?), PKCE vs implicit, password policy, email confirmation.
6. Write the results to `docs/SUPABASE-INVENTORY.md`. **No secret values in the file.**

**Exit check:** we know exactly what is deployed and whether the repo matches it. A staging project exists with the repo's migrations applied.

## Phase 3. Fix and test one money path end to end: Add Funds (2 to 4 days)

1. One unit everywhere: integer cents from the UI to the edge functions to the database. Fix `AddFunds.tsx`, `PaymentMethodSelector.tsx`, `create-payment-intent`, `FundingIntegrationService`.
2. Replace the `setTimeout` simulation with real Stripe Elements (`@stripe/react-stripe-js` is already installed) confirming the PaymentIntent in test mode.
3. Credit the account **only on the server**: a Stripe webhook edge function (`payment_intent.succeeded`, signature verified) that checks the intent's metadata `user_id`/`order_id` and amount against `orders`, and inserts the ledger row idempotently (unique constraint on the Stripe intent id). Remove the browser insert into `stellar_transactions` and block it with RLS.
4. Replace the demo 1 USD = 10 XLM rate with a real rate source, or keep balances in USD until on-chain settlement is designed.
5. Tests: unit tests for amount handling, an edge-function test for the webhook, and a manual Stripe test-card run on staging.

**Exit check:** a $25 test top-up charges $25, records $25 once, and a replayed webhook or a forged client insert changes nothing.

## Phase 4. Security fixes for the other flows (2 to 3 days)

1. **Scheduled payments:** `evaluate-rules` accepts only `CRON_SECRET` (exact compare); remove anon-key auth; update the cron job to send the secret (store it in Supabase Vault, not in a migration). Claim due rules atomically (`update ... where next_trigger_at <= now() returning`, or `for update skip locked`) to prevent double payments. Move queue execution from the browser (`TransactionProcessor.ts`) to a server worker, enforce per-rule and per-day limits, and re-check balance at execution.
2. **Password reset:** add the `/reset-password` route, make the page handle the PKCE `?code=` flow (`exchangeCodeForSession`) as well as the hash, and add the URL to Supabase auth redirect URLs.
3. Review every edge function with `verify_jwt = false`; turn it on where the function is user-facing.
4. Raise the minimum password length and turn on email confirmation (live auth settings).
5. Hide test/diagnostic routes in production builds.

## Phase 5. Remove the remaining Lovable dependencies (1 to 2 days)

1. Port `ai-agent` to the chosen provider (keep the tool-calling structure; put the key in Supabase secrets).
2. Remove `lovable-tagger`. Decide whether to keep `@lovable.dev/mcp-js` and the `/.lovable/oauth/consent` route (they power the MCP integration; keep only if that integration is still wanted).
3. Update `supabase/config.toml` and the live auth redirect URLs to the new domain.
4. Archive Lovable-era docs and scripts in the repo root into `docs/archive/` and rewrite `README.md` with real setup steps.

## Phase 6. Toward production readiness (ongoing)

- Code-split the 1.4 MB main bundle (lazy routes; load `stellar-sdk` only where needed).
- Migrate `stellar-sdk` to `@stellar/stellar-sdk`.
- Error monitoring, audit log for money movements, rate limits on edge functions.
- KYC (Onfido) and compliance review before any real users or real funds.
