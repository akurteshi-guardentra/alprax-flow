

# AutoPay Agent for Stellar Hacks Hackathon

## What We're Building

An AI-powered autonomous payment agent with three capabilities:
1. **Rule-based auto-payments** -- users define rules like "send $100 to Maria every Friday" or "auto-split 50% of incoming funds to savings"
2. **Natural language payment chat** -- users type "send $50 to john@example.com for lunch" and the AI parses and executes it
3. **Rule evaluation engine** -- an Edge Function that evaluates payment rules and triggers Stellar transactions

## Architecture

```text
┌─────────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Chat UI (React)    │────▶│  ai-agent Edge   │────▶│  Lovable AI     │
│  /autopay           │     │  Function        │     │  Gateway        │
└─────────────────────┘     └──────────────────┘     └─────────────────┘
                                    │
                                    ▼
                            ┌──────────────────┐
                            │  payment_rules   │
                            │  table + existing │
                            │  Stellar infra   │
                            └──────────────────┘
```

## Implementation Steps

### Step 1: Database -- `payment_rules` table

New migration to create:
- `payment_rules` table with columns: `id`, `user_id`, `rule_name`, `rule_type` (scheduled/conditional/split), `trigger_config` (JSONB -- cron expression, balance threshold, etc.), `action_config` (JSONB -- recipient, amount, currency, memo), `is_active`, `last_triggered_at`, `next_trigger_at`, `created_at`, `updated_at`
- RLS policies scoped to `auth.uid() = user_id`
- `chat_messages` table for persisting AI agent conversations: `id`, `user_id`, `conversation_id`, `role`, `content`, `metadata` (JSONB), `created_at`
- RLS policies scoped to `auth.uid() = user_id`

### Step 2: Edge Function -- `ai-agent`

Single Edge Function at `supabase/functions/ai-agent/index.ts` that:
- Accepts `{ messages, conversation_id }` from the client
- Uses Lovable AI Gateway (`google/gemini-3-flash-preview`) with a system prompt that defines available tools
- Implements tool calling for:
  - `send_payment` -- parse natural language into recipient/amount/currency and call Stellar payment logic
  - `create_rule` -- create an auto-payment rule in the `payment_rules` table
  - `list_rules` -- show active rules
  - `check_balance` -- return user's fiat balance
  - `delete_rule` -- deactivate a rule
- Streams responses back via SSE
- Handles 429/402 errors from Lovable AI

### Step 3: Edge Function -- `evaluate-rules`

Edge Function at `supabase/functions/evaluate-rules/index.ts` that:
- Can be triggered via cron (pg_cron) or manual invocation
- Queries all active rules where `next_trigger_at <= now()`
- For each matching rule, executes the payment via Stellar
- Updates `last_triggered_at` and calculates `next_trigger_at`
- Logs results to `stellar_transactions`

### Step 4: Chat UI -- AutoPay page

New page at `src/pages/AutoPay.tsx` with:
- Chat interface with message history (streaming AI responses with markdown rendering)
- Sidebar/tab showing active payment rules with toggle on/off
- Example prompts: "Send $50 to maria@email.com", "Set up weekly $100 transfer to mom", "Show my balance"
- Route added to `App.tsx` at `/autopay` (auth-guarded)

### Step 5: Dashboard Integration

- Add "AI Agent" quick action card on Dashboard linking to `/autopay`
- Add active rules count badge

## Technical Details

- **AI model**: `google/gemini-3-flash-preview` via Lovable AI Gateway (LOVABLE_API_KEY already configured)
- **Streaming**: SSE from Edge Function, token-by-token rendering on client
- **Tool calling**: Structured output via function calling schema to parse payments
- **Config**: Add `[functions.ai-agent]` and `[functions.evaluate-rules]` to `config.toml` with `verify_jwt = false`; JWT validated in code via `getClaims()`

## Files to Create/Modify

| File | Action |
|------|--------|
| `supabase/migrations/..._payment_rules_and_chat.sql` | Create tables |
| `supabase/functions/ai-agent/index.ts` | AI chat + tool calling |
| `supabase/functions/evaluate-rules/index.ts` | Rule evaluation engine |
| `src/pages/AutoPay.tsx` | Chat UI + rules panel |
| `src/App.tsx` | Add `/autopay` route |
| `src/components/dashboard/...` | Add AI Agent quick action |
| `supabase/config.toml` | Add function configs |
| `src/integrations/supabase/types.ts` | Auto-updated after migration |

