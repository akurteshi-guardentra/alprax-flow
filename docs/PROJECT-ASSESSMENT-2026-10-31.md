# Alprax project assessment (2026-10-31)

Independent check of `atdheekurteshi/alprax-flow` at commit `31883af` ("Updated MCP auth & access"), after the move off Lovable. Only documentation was added. No application code, no lockfile, and no Supabase project was changed.

## What was and was not verifiable

| Area | Status |
|---|---|
| Code, migrations, edge functions in the repo | Read and checked |
| Install, typecheck, build, lint, unit tests | Run in a clean Linux container (Node 22.23, npm 10.9) |
| Live Supabase project (`vixpxmvsndusngxdmjuv`): applied migrations, RLS, secrets, cron jobs, auth URL settings, deployed function versions | **Not verified.** No Supabase access from this session |
| Stripe account / keys, Lovable AI key, Onfido, Stellar network | **Not verified** |
| Hosting (Vercel, GitHub Pages, Lovable hosting) | **Not verified** |

## Validation results

| Check | Result |
|---|---|
| `npm ci` | **Fails** two ways: (1) peer conflict, `vite@^8.0.8` vs `@vitejs/plugin-react-swc@3.9.0` which only supports Vite 4 to 6; (2) `package-lock.json` is out of sync with `package.json` (missing `@lovable.dev/mcp-js`, `jsdom`, `use-webmcp-tool`, `zod@4`, and more). Lovable used Bun, so `bun.lock`/`bun.lockb` are newer than the npm lock. |
| `npm install --legacy-peer-deps` (workaround, not committed) | Succeeds |
| `tsc -p tsconfig.app.json --noEmit` | Passes (the TS config is permissive, so this proves little) |
| `vite build` | **Passes** (main chunk 1.37 MB, stellar-sdk 0.9 MB, chunk-size warnings) |
| `npm run lint` | **Crashes** (`@typescript-eslint/no-unused-expressions` rule fails to load with ESLint 9.39; plugin version mismatch). CI hides this with `|| echo`. |
| `vitest run` | **41 of 96 tests fail, 13 of 18 files fail.** Main causes: stale mocks (`navigate is not defined` from a hoisted `vi.mock`), components rendered without `AuthProvider`, Supabase mock missing `.order()`, one file with no test suite, one test making a real network call. These are test-harness problems, not proof the features are broken, but there is currently no working safety net. |
| GitHub Actions (`pull-request.yml`, `deploy.yml`) | Will fail at `npm ci` for the reasons above. |

## The pasted review's claims, checked

| Claim | Verdict | Evidence |
|---|---|---|
| Auth, wallets, transfers, contacts, KYC, analytics, AutoPay code exist | **Confirmed** | 38 pages in `src/pages`, 10 edge functions, 37 migrations |
| Install fails on Vite / React plugin versions | **Confirmed, and worse**: the npm lockfile is also out of sync | See validation table |
| Add Funds simulates card processing | **Confirmed** | `src/components/payment/PaymentMethodSelector.tsx:78-87` waits with `setTimeout` instead of collecting a card with Stripe Elements. The Stripe PaymentIntent is never confirmed by the client, so `confirm-payment` will normally see `requires_payment_method` and the flow fails. |
| Amount-conversion mismatch | **Confirmed** | `AddFunds.tsx` passes dollars (`parseFloat(amount)`), `PaymentMethodSelector` treats it as cents (shows "Pay $0.25" for $25), `create-payment-intent` multiplies by 100 again (charges $25), and `FundingIntegrationService.processSuccessfulFunding` divides by 100 (records $0.25, at a hard-coded demo rate of 1 USD = 10 XLM). Three different numbers for one top-up. |
| Payment confirmation needs fixes | **Confirmed** | `supabase/functions/confirm-payment/index.ts`: does not check that the PaymentIntent belongs to this user/order (no metadata or amount match against `orders`); not idempotent (each call inserts another `funding_transactions` row); stores `orderId` in the `payment_intent_id` column; no Stripe webhook. Separately, the client itself inserts a `completed` `stellar_transactions` row (`FundingIntegrationService.ts:50-63`), so the ledger is written from the browser. |
| Scheduled-payment authorization needs fixes | **Confirmed** | `supabase/functions/evaluate-rules/index.ts:22-25` accepts the **public anon key** as authorization, and the cron job (`migrations/20260415215822_…sql`) sends the anon key. Anyone with the key from the web bundle can call it. The check uses `authHeader.includes(...)` rather than an exact match. Rules are not locked, so overlapping runs can double-queue a payment. Queued payments are then executed by the browser (`src/services/TransactionProcessor.ts`), not by a trusted server worker, so a scheduled payment only runs when the user has the app open and the client can set its own status. |
| Password-reset links point to a missing route | **Confirmed** | `ForgotPasswordForm.tsx`, `Login.tsx`, `lib/auth-enhanced.ts` redirect to `/reset-password`, but `App.tsx` has no such route (falls to `NotFound`). `src/pages/ResetPassword.tsx` exists but is not mounted. Extra issue: that page looks for `type=recovery` in the URL hash, but `supabase/config.toml` enables PKCE, where the link returns `?code=...` instead, so it would likely reject valid links even once routed (depends on live auth settings). |
| AutoPay depends on Lovable's AI service | **Confirmed** | `supabase/functions/ai-agent/index.ts:326-415` calls `https://ai.gateway.lovable.dev` with `LOVABLE_API_KEY` and model `google/gemini-3-flash-preview`. Used by `src/pages/AutoPay.tsx`. Other Lovable ties: `lovable-tagger` and `@lovable.dev/mcp-js` in `vite.config.ts`, the `/.lovable/oauth/consent` route, and Lovable URLs in `supabase/config.toml`. |
| Live Supabase state unverified | **Confirmed** | Still unverified from here |

## Additional findings not in the original review

1. **Repo hygiene.** A whole old Git repository is committed under `.git_disabled/` (1.5 MB, includes history packs). Junk files `t` and `tatus` (output of a mistyped `git status` into `less`) are committed. `.env` and `.env.production` are committed (they contain only the publishable Supabase key and public URLs, which is acceptable, but `.env` should not be tracked going forward).
2. **Three lockfiles** (`package-lock.json`, `bun.lock`, `bun.lockb`). Pick one package manager.
3. `package.json` lists the project as a dependency of itself (`"vite_react_shadcn_ts": "file:"`).
4. **Test/diagnostic pages ship to production**: `/test-dashboard`, `/multi-user-testing`, `/system-health`, `PaymentTest.tsx`, `ProductionReadiness.tsx`.
5. **All edge functions have `verify_jwt = false`.** Some check the JWT themselves (confirm-payment, wallet-encryption-key); each must be reviewed.
6. Auth config (repo copy): `minimum_password_length = 6`, email confirmations off. Weak for a payments app; check the live values.
7. `stellar-sdk` is deprecated (moved to `@stellar/stellar-sdk`).
8. Roughly 20 Lovable-era markdown/script files in the repo root (deploy guides, PR helpers) that describe workflows that no longer apply.

## Bottom line

Continue from this repo; a rebuild is not needed. The UI and data model are substantial and the production build compiles. But the money paths (Add Funds, payment confirmation, scheduled payments) are not safe to use with real funds, the tooling can't install cleanly or test itself, and the live Supabase project has not been inventoried. Fix in that order: tooling, then Supabase inventory, then one payment flow end to end, then the rest. The prioritized plan is in [NEXT-STEPS.md](./NEXT-STEPS.md) and the reusable prompt is in [CONTINUATION-PROMPT.md](./CONTINUATION-PROMPT.md).
