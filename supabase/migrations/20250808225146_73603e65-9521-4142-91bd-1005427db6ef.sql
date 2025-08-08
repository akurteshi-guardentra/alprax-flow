-- Create table to store KYC verifications
create table if not exists public.kyc_verifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null default 'onfido',
  applicant_id text,
  sdk_flow_run_id text,
  status text not null default 'pending', -- pending | completed | failed | reviewing | rejected | approved
  result jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table public.kyc_verifications enable row level security;

-- Policies: users can manage their own records
create policy if not exists "Users can select own KYC records"
  on public.kyc_verifications for select
  using (auth.uid() = user_id);

create policy if not exists "Users can insert own KYC records"
  on public.kyc_verifications for insert
  with check (auth.uid() = user_id);

create policy if not exists "Users can update own KYC records"
  on public.kyc_verifications for update
  using (auth.uid() = user_id);

-- Optional: Admin role policy (requires role setup). Commented out by default
-- create policy "Admins can read all KYC records"
--   on public.kyc_verifications for select
--   using (exists (
--     select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
--   ));

-- Updated at trigger
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_kyc_verifications_updated_at
before update on public.kyc_verifications
for each row execute function public.update_updated_at_column();

-- Indexes for faster lookups
create index if not exists idx_kyc_verifications_user_id on public.kyc_verifications(user_id);
create index if not exists idx_kyc_verifications_status on public.kyc_verifications(status);